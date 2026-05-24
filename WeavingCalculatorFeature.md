# Weaving Waste Calculator — Design Specification

## Overview

A single-page web app for calculating weaving waste from bobbin weight samples and determining the minimum required bobbin weight on the creel. The app also indicates whether the fabric is at risk of becoming a short roll.

---

## Layout Structure

Four stacked cards, in order:

1. **Job Information**
2. **Creel Parameters** (includes Actual Length and Actual G/m sub-sections)
3. **Bobbin Weight Samples**
4. **Results**

---

## Card 1 — Job Information

Input fields (all optional, text/select):

| Field | Type | Notes |
|---|---|---|
| Shift group | Dropdown | Options: A, B, C, D |
| Production order | Text | e.g. PO-20240523 |
| Loom number | Text | e.g. L-04 |
| Weaving style | Text | e.g. Plain, Twill |
| Twisting length | Number | Unit: meters |

---

## Card 2 — Creel Parameters

### Main inputs

| Field | Type | Unit |
|---|---|---|
| Total rolls | Number | — |
| Total roll produced | Number | — |
| Total warp ends | Number | — |
| Plastic tube weight | Number | grams |

### Sub-section: Actual Length

Displayed as an inline equation row:

```
Standard roll length (m)  ±  Adjustment length (m)  =  Actual length (m) [derived, read-only]
```

- Adjustment length accepts negative values (can subtract from standard length)
- Actual length = standard roll length + adjustment length
- Derived field is read-only, updates live

### Sub-section: Actual Gram per Meter

Displayed as an inline equation row:

```
G/m measurement 1  +  G/m measurement 2  ÷ 2  =  Actual g/m [derived, read-only]
```

- Two separate manual g/m inputs
- Actual g/m = (g/m 1 + g/m 2) / 2
- Derived field is read-only, updates live

---

## Card 3 — Bobbin Weight Samples

12 total samples from 4 creel positions, displayed in a 4-column grid:

| Position | Sample count | Color coding |
|---|---|---|
| AO (Outer A) | 2 samples | Blue |
| AI (Inner A) | 4 samples | Green |
| BI (Inner B) | 4 samples | Purple |
| BO (Outer B) | 2 samples | Coral/red |

Each position shows a labeled header and stacked number inputs (one per sample). All inputs are in grams.

---

## Card 4 — Results

### Metric tiles (auto-fit grid)

| Metric | Formula | Unit |
|---|---|---|
| Actual length | standard roll length ± adjustment length | meters |
| Actual g/m | (g/m 1 + g/m 2) ÷ 2 | g/m |
| Min. required bobbin weight | see formula below | grams |
| Avg. bobbin weight | average of all 12 samples | grams |
| Waste estimate | see formula below | kg |

### Formulas

**Minimum required bobbin weight (per bobbin, grams):**
```
min_required = ((total_rolls - total_roll_produced) × actual_length / total_warp_ends × actual_gpm) + plastic_tube_weight
```

**Waste estimate (total across all warp ends, kg):**
```
waste_estimate_kg = (avg_sample_weight - min_required) × total_warp_ends / 1000
```

### Roll Status Indicator

A banner below the metric tiles with three states:

#### State 1 — Pending (no samples entered)
- Neutral/muted styling
- Icon: dashed circle
- Title: "Awaiting sample data"
- Description: "Enter bobbin weight samples to see the roll status."

#### State 2 — Sufficient (waste estimate ≥ 0)
- Green styling
- Icon: check circle
- Title: "Bobbin weight sufficient"
- Description: "Estimated surplus of X.XXX kg across all warp ends. Full roll length expected."

#### State 3 — Short roll risk (waste estimate < 0)
- Red styling
- Icon: warning triangle
- Title: "Short roll risk"
- Description: "Estimated deficit of X.XXX kg across all warp ends. Fabric may not reach full roll length."

---

## Behaviour

- All calculations update **live on input** — no submit button needed
- Waste estimate displayed with `+` prefix when positive, no prefix when negative
- Waste estimate colored red when positive (surplus waste), green when negative is NOT correct — see below:
  - Positive waste estimate → green status (bobbin weight sufficient)
  - Negative waste estimate → red status (short roll risk)
- Actual length and actual g/m shown both as inline derived fields in Card 2 and as result tiles in Card 4
- All number outputs rounded to appropriate decimal places:
  - Lengths: 2 decimal places
  - G/m: 3 decimal places
  - Grams: 2 decimal places
  - Kg: 3 decimal places

---