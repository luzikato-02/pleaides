<?php

namespace App\Http\Controllers;

use App\Models\TubeType;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TubeTypeController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('tube-types/index', [
            'tubeTypes' => TubeType::orderBy('tube_name')->get(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('tube-types/form');
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'tube_name'    => 'required|string|max:255|unique:tube_types,tube_name',
            'basic_weight' => 'required|numeric|min:0',
            'status'       => 'required|in:Active,Inactive',
        ]);

        TubeType::create($request->only('tube_name', 'basic_weight', 'status'));

        return to_route('tube-types.index');
    }

    public function edit(TubeType $tubeType): Response
    {
        return Inertia::render('tube-types/form', ['tubeType' => $tubeType]);
    }

    public function update(Request $request, TubeType $tubeType): RedirectResponse
    {
        $request->validate([
            'tube_name'    => 'required|string|max:255|unique:tube_types,tube_name,' . $tubeType->id,
            'basic_weight' => 'required|numeric|min:0',
            'status'       => 'required|in:Active,Inactive',
        ]);

        $tubeType->update($request->only('tube_name', 'basic_weight', 'status'));

        return to_route('tube-types.index');
    }

    public function destroy(TubeType $tubeType): RedirectResponse
    {
        $tubeType->delete();

        return to_route('tube-types.index');
    }
}
