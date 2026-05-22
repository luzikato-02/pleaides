<?php

use App\Http\Controllers\CleaningCycleController;
use App\Http\Controllers\CleaningRecordController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\MachineController;
use App\Http\Controllers\MachineTypeController;
use App\Http\Controllers\ShiftGroupController;
use App\Http\Controllers\StakeholderController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::resource('machine-types', MachineTypeController::class);
    Route::resource('machines', MachineController::class);
    Route::resource('cleaning-cycles', CleaningCycleController::class);
    Route::resource('shift-groups', ShiftGroupController::class);
    Route::resource('cleaning-records', CleaningRecordController::class)->only(['index', 'create', 'store']);
    Route::resource('stakeholders', StakeholderController::class);

    Route::get('shift-groups/{shiftGroup}/leader', [ShiftGroupController::class, 'leader'])
        ->name('shift-groups.leader');
});

require __DIR__.'/settings.php';
