<?php

namespace App\Http\Controllers;

use App\Models\ProductionArea;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductionAreaController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('production-areas/index', [
            'productionAreas' => ProductionArea::orderBy('area_name')->get(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('production-areas/form');
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'area_name' => 'required|string|max:255|unique:production_areas',
            'description' => 'nullable|string|max:500',
        ]);

        ProductionArea::create($request->only('area_name', 'description'));

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Production area created.']);

        return to_route('production-areas.index');
    }

    public function edit(ProductionArea $productionArea): Response
    {
        return Inertia::render('production-areas/form', [
            'productionArea' => $productionArea,
        ]);
    }

    public function update(Request $request, ProductionArea $productionArea): RedirectResponse
    {
        $request->validate([
            'area_name' => 'required|string|max:255|unique:production_areas,area_name,'.$productionArea->id,
            'description' => 'nullable|string|max:500',
        ]);

        $productionArea->update($request->only('area_name', 'description'));

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Production area updated.']);

        return to_route('production-areas.index');
    }

    public function destroy(ProductionArea $productionArea): RedirectResponse
    {
        $productionArea->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Production area deleted.']);

        return to_route('production-areas.index');
    }
}
