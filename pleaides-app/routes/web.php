<?php

use App\Http\Controllers\CleaningCycleController;
use App\Http\Controllers\CleaningRecordController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\MachineController;
use App\Http\Controllers\MachineTypeController;
use App\Http\Controllers\ProductionAreaController;
use App\Http\Controllers\ShiftGroupController;
use App\Http\Controllers\StakeholderController;
use App\Http\Controllers\TubeTypeController;
use App\Http\Controllers\WeavingCalculationController;
use App\Http\Controllers\WeavingCalculatorController;
use App\Http\Controllers\WeavingDashboardController;
use App\Http\Controllers\WeavingMachineStandardController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::resource('machine-types', MachineTypeController::class);
    Route::resource('machines', MachineController::class);
    Route::resource('cleaning-cycles', CleaningCycleController::class);
    Route::resource('shift-groups', ShiftGroupController::class);
    Route::get('cleaning-records/export', [CleaningRecordController::class, 'export'])->name('cleaning-records.export');
    Route::resource('cleaning-records', CleaningRecordController::class)->only(['index', 'create', 'store']);
    Route::resource('stakeholders', StakeholderController::class);

    Route::get('shift-groups/{shiftGroup}/leader', [ShiftGroupController::class, 'leader'])
        ->name('shift-groups.leader');

    Route::resource('tube-types', TubeTypeController::class)->except(['show']);
    Route::resource('production-areas', ProductionAreaController::class)->except(['show']);
    Route::resource('weaving-machine-standards', WeavingMachineStandardController::class)->except(['show']);

    Route::get('weaving-calculator', [WeavingCalculatorController::class, 'index'])->name('weaving-calculator');
    Route::get('weaving-dashboard', [WeavingDashboardController::class, 'index'])->name('weaving-dashboard');
    Route::get('weaving-calculations/export', [WeavingCalculationController::class, 'export'])->name('weaving-calculations.export');
    Route::resource('weaving-calculations', WeavingCalculationController::class)->only(['index', 'store', 'show', 'edit', 'update']);
});

require __DIR__.'/settings.php';
