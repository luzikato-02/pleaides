<?php

namespace App\Http\Controllers;

use App\Models\Stakeholder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StakeholderController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('stakeholders/index', [
            'stakeholders' => Stakeholder::latest()->get(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('stakeholders/form');
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'scope' => 'required|string|max:255',
            'severity' => 'required|in:due-soon,overdue,both',
            'status' => 'required|in:Active,Inactive',
        ]);

        Stakeholder::create($request->only('name', 'email', 'scope', 'severity', 'status'));

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Stakeholder created.']);

        return to_route('stakeholders.index');
    }

    public function edit(Stakeholder $stakeholder): Response
    {
        return Inertia::render('stakeholders/form', [
            'stakeholder' => $stakeholder,
        ]);
    }

    public function update(Request $request, Stakeholder $stakeholder): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'scope' => 'required|string|max:255',
            'severity' => 'required|in:due-soon,overdue,both',
            'status' => 'required|in:Active,Inactive',
        ]);

        $stakeholder->update($request->only('name', 'email', 'scope', 'severity', 'status'));

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Stakeholder updated.']);

        return to_route('stakeholders.index');
    }

    public function destroy(Stakeholder $stakeholder): RedirectResponse
    {
        $stakeholder->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Stakeholder deleted.']);

        return to_route('stakeholders.index');
    }
}
