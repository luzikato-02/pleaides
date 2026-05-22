<?php

namespace App\Http\Controllers;

use App\Models\MachineType;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MachineTypeController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('machine-types/index', [
            'machineTypes' => MachineType::withCount('machines')->latest()->get(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('machine-types/form');
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'type_name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        MachineType::create($request->only('type_name', 'description'));

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Machine type created.']);

        return to_route('machine-types.index');
    }

    public function edit(MachineType $machineType): Response
    {
        return Inertia::render('machine-types/form', [
            'machineType' => $machineType,
        ]);
    }

    public function update(Request $request, MachineType $machineType): RedirectResponse
    {
        $request->validate([
            'type_name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $machineType->update($request->only('type_name', 'description'));

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Machine type updated.']);

        return to_route('machine-types.index');
    }

    public function destroy(MachineType $machineType): RedirectResponse
    {
        $machineType->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Machine type deleted.']);

        return to_route('machine-types.index');
    }
}
