# Production Machine Cleaning Cycle — System Design

> A system to record machine cleaning cycles, calculate when the next cleaning is due, track who performed and who restarted each machine, and email stakeholders about machines that are due soon or overdue.

This document is the build specification. It is written to be handed directly to a developer or to Claude Code. Implementation choices left open are flagged as **DECISION** so they can be confirmed before building.

---

## 1. Overview

The system has two parts:

1. **Data + UI** — six tables plus the screens to manage them and log cleanings.
2. **Scheduled Alert Job** — an always-on job that runs daily, evaluates each machine's due status, and emails stakeholders a digest. This part cannot run in a browser alone; see Section 7.

### Core concepts

- A **standard cleaning cycle** is defined per **machine type** (all machines of a type share one cycle).
- A **cleaning record** is logged per **individual machine**.
- Both the cleaning **performer** and the person who **restarts** the machine after cleaning are represented as **shift groups** (each with a leader).
- `next_due_date` is calculated from the most recent cleaning and the type's cycle frequency.
- `duration_since_last` is calculated as the gap between a cleaning and the prior cleaning of the same machine.

---

## 2. Data Model

### Table 1 — Machine Types

Top-level lookup. Anchors the cleaning cycle.

| Field | Type | Notes |
|---|---|---|
| `type_id` | PK | |
| `type_name` | text | e.g. Mixer, Filler, Conveyor |
| `description` | text | optional |

### Table 2 — Machine Identity

Every physical machine. Each points to a type.

| Field | Type | Notes |
|---|---|---|
| `machine_id` | PK | |
| `machine_code` | text | real-world asset tag, e.g. FILL-03 |
| `machine_name` | text | |
| `type_id` | FK → Machine Types | |
| `location` | text | line / area, optional but useful for reporting |
| `status` | enum | Active / Inactive / Decommissioned |

### Table 3 — Standard Cleaning Cycle

Attaches to **machine type**. One active cycle per type; history kept via `is_active` + `effective_date`.

| Field | Type | Notes |
|---|---|---|
| `cycle_id` | PK | |
| `type_id` | FK → Machine Types | |
| `frequency_value` | number | e.g. 7 |
| `frequency_unit` | enum | **DECISION**: calendar (days/weeks) vs usage (operating-hours/batches). Default = calendar/days |
| `cleaning_steps` | text | the standard procedure / checklist |
| `effective_date` | date | when this standard took effect |
| `is_active` | boolean | only one active per type |

### Table 4 — Cleaning Records

The core log. One row per actual cleaning of an individual machine.

| Field | Type | Notes |
|---|---|---|
| `record_id` | PK | |
| `machine_id` | FK → Machine Identity | |
| `cleaning_date` | date / datetime | **DECISION**: date only vs datetime (affects duration math) |
| `performed_by_group_id` | FK → Shift Groups | group that performed the cleaning |
| `performed_by_leader` | text | leader **snapshot** at time of cleaning |
| `started_by_group_id` | FK → Shift Groups | group that restarted the machine |
| `started_by_leader` | text | leader **snapshot** at time of restart |
| `duration_since_last` | number | **calculated** — gap from prior cleaning of same machine; blank for first |
| `next_due_date` | date | **calculated** — see Section 3 |
| `notes` | text | optional |

Leader fields are snapshotted on write so historical records remain accurate if a group's leader later changes.

### Table 5 — Shift Groups

Maintains each group and its current leader. Feeds Cleaning Records twice (performer + restarter).

| Field | Type | Notes |
|---|---|---|
| `shift_group_id` | PK | |
| `group_name` | text | e.g. Shift A, Night Crew |
| `leader_name` | text | current leader |
| `status` | enum | Active / Inactive |

### Table 6 — Stakeholders / Notification Recipients

Who receives alert emails, and for which machines.

| Field | Type | Notes |
|---|---|---|
| `stakeholder_id` | PK | |
| `name` | text | |
| `email` | text | |
| `scope` | text / enum | all machines, or filtered by type / location |
| `severity` | enum | **DECISION (optional)**: which buckets they get — due-soon, overdue, or both. Enables escalation |
| `status` | enum | Active / Inactive |

---

## 3. Calculated Fields & Logic

### next_due_date
On logging a cleaning: read the machine's `type_id` → find the **active** cycle for that type → take its frequency → `next_due_date = cleaning_date + frequency`.

**DECISION — basis:** count from the **actual cleaning date** (forgiving; clock resets when cleaning actually happens) vs from the **previous scheduled due date** (strict fixed cadence). Default = actual cleaning date.

### duration_since_last
On logging a cleaning: find the machine's **most recent prior** cleaning → `duration_since_last = this cleaning_date − previous cleaning_date`. Blank if no prior record exists.

### Current due status (per machine, evaluated live)
Look at the machine's most recent cleaning record, read `next_due_date`, compare to today:
- `next_due_date` in the past → **Overdue**
- `next_due_date` within warning window → **Due soon**
- otherwise → **OK**

---

## 4. Relationships

```
Machine Types (1) ─── (many) Machine Identity (1) ─── (many) Cleaning Records
      │
      └─ (1) ─── (1 active) Standard Cleaning Cycle

Shift Groups (1) ─── (many) Cleaning Records   [as performer]
Shift Groups (1) ─── (many) Cleaning Records   [as restarter]

Stakeholders ──► consumed by the Scheduled Alert Job (Section 7)
```

Path from a record back to its standard: `record → machine → type → active cycle`.

---

## 5. Screens (UI)

- **Machine Types** — list / add / edit.
- **Machines** — list / add / edit; show current due status badge (OK / Due soon / Overdue).
- **Cleaning Cycles** — manage the active cycle per type; keep history.
- **Shift Groups** — list / add / edit leader.
- **Stakeholders** — manage recipients and their scope.
- **Log Cleaning** — the main daily action: pick machine, date, performer group, restarter group; system auto-fills leaders, computes `duration_since_last` and `next_due_date`.
- **Dashboard** — all machines grouped by due status; the at-a-glance compliance view.

**DECISION — append-only records:** for compliance, cleaning records are typically not editable after creation (log, don't rewrite history). Confirm whether edits/corrections are allowed and by whom.

---

## 6. Alert Settings (global)

- **Warning window** — days before due that count as "due soon" (default 3).
- **Send schedule** — when the daily job runs (e.g. 07:00 local).
- **Format** — single daily **digest** (recommended) vs per-machine emails.
- **Re-alert cadence** — **DECISION**: remind **every day** until resolved (recommended for compliance) vs **once** on crossing into overdue.

---

## 7. Scheduled Alert Job (must be always-on)

A browser-only front end cannot send scheduled email. The alert layer requires one always-on option:

1. **Small backend service** — a daily cron/scheduled job that runs the due-date evaluation and sends mail via an email provider (e.g. SMTP / a transactional email API).
2. **No-code automation** — a scheduler service wired to an email service, reading from wherever the data lives.
3. **Spreadsheet-hosted** — if data lives in a spreadsheet, a built-in time-triggered script can email on a timer.

**Job flow (daily):**
1. For each Active machine, compute current due status (Section 3).
2. Collect machines that are Due soon or Overdue.
3. For each Active stakeholder, filter that list by their `scope` (and `severity` if used).
4. Send each stakeholder a digest of their relevant machines.

**DECISION — hosting path** (1, 2, or 3) is still open and was deferred from the original "how to run this app" question.

---

## 8. Open Decisions (collect before build)

1. **Frequency unit** — calendar vs usage-based. *(default: calendar/days)*
2. **cleaning_date precision** — date only vs datetime. *(affects duration units)*
3. **next_due basis** — actual cleaning date vs scheduled due date. *(default: actual)*
4. **Performer vs restarter** — usually same group? If so, default restart fields to match performer.
5. **Records editable?** — append-only vs correctable.
6. **Re-alert cadence** — daily-until-resolved vs once.
7. **Escalation** — do overdue items go to more senior recipients than due-soon? *(drives `severity`)*
8. **Hosting path** for the alert job — backend / no-code / spreadsheet.

---

## 9. Build Order (suggested)

1. Tables 1, 2, 5 (lookups: types, machines, shift groups).
2. Table 3 (cycles) + `next_due_date` logic.
3. Table 4 (cleaning records) + `duration_since_last` logic + Log Cleaning screen.
4. Dashboard with live due-status.
5. Table 6 (stakeholders) + alert settings.
6. Scheduled Alert Job once hosting path is chosen.