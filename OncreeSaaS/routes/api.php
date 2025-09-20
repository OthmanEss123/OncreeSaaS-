<?php

use Illuminate\Support\Facades\Route;


// Ping pour vérifier que api.php se charge
Route::get('ping', fn() => ['pong' => now()]);

// ===== Controllers =====
use App\Http\Controllers\RoleController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\MissionController;
use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\TimeTrackingController;
use App\Http\Controllers\QuoteController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ConsultantController;
use App\Http\Controllers\AbsenceController;
use App\Http\Controllers\ProspectController;
use App\Http\Controllers\ProjetController;

// ===== Resources =====
Route::apiResource('roles', RoleController::class);
Route::apiResource('users', UserController::class);
Route::apiResource('clients', ClientController::class);
Route::apiResource('services', ServiceController::class);
Route::apiResource('missions', MissionController::class);
Route::apiResource('appointments', AppointmentController::class);
Route::apiResource('time-tracking', TimeTrackingController::class);
Route::apiResource('quotes', QuoteController::class);
Route::apiResource('invoices', InvoiceController::class);
Route::apiResource('payments', PaymentController::class);
Route::apiResource('notifications', NotificationController::class);
Route::apiResource('consultants', ConsultantController::class);
Route::apiResource('absences', AbsenceController::class);
Route::apiResource('prospects', ProspectController::class);
Route::apiResource('crm', CrmController::class);    
Route::apiResource('projets', ProjetController::class);

// Routes supplémentaires pour les cas spéciaux
Route::patch('appointments/{appointment}/status', [AppointmentController::class, 'changeStatus']);
Route::patch('services/{service}/toggle', [ServiceController::class, 'toggle']);
Route::patch('quotes/{quote}/status', [QuoteController::class, 'changeStatus']);
Route::get('notifications/unread', [NotificationController::class, 'unread']);
Route::patch('notifications/{notification}/read', [NotificationController::class, 'markAsRead']);
Route::get('consultants/stats', [ConsultantController::class, 'stats']);
Route::get('absences/stats', [AbsenceController::class, 'stats']);
Route::get('prospects/stats', [ProspectController::class, 'stats']);
