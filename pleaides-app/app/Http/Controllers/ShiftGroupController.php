<?php

namespace App\Http\Controllers;

use App\Models\ShiftGroup;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ShiftGroupController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('shift-groups/index', [
            'shiftGroups' => ShiftGroup::latest()->get(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('shift-groups/form');
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'group_name' => 'required|string|max:255',
            'leader_name' => 'required|string|max:255',
            'status' => 'required|in:Active,Inactive',
        ]);

        ShiftGroup::create($request->only('group_name', 'leader_name', 'status'));

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Shift group created.']);

        return to_route('shift-groups.index');
    }

    public function edit(ShiftGroup $shiftGroup): Response
    {
        return Inertia::render('shift-groups/form', [
            'shiftGroup' => $shiftGroup,
        ]);
    }

    public function update(Request $request, ShiftGroup $shiftGroup): RedirectResponse
    {
        $request->validate([
            'group_name' => 'required|string|max:255',
            'leader_name' => 'required|string|max:255',
            'status' => 'required|in:Active,Inactive',
        ]);

        $shiftGroup->update($request->only('group_name', 'leader_name', 'status'));

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Shift group updated.']);

        return to_route('shift-groups.index');
    }

    public function destroy(ShiftGroup $shiftGroup): RedirectResponse
    {
        $shiftGroup->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Shift group deleted.']);

        return to_route('shift-groups.index');
    }

    public function leader(ShiftGroup $shiftGroup): JsonResponse
    {
        return response()->json(['leader_name' => $shiftGroup->leader_name]);
    }
}
