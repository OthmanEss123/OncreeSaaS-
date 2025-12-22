<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ConsultantController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\ManagerController;
use App\Http\Controllers\RhController;
use App\Http\Controllers\ComptableController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\AssignmentController;
use App\Http\Controllers\QuoteController;
use App\Http\Controllers\FactureController;
use App\Http\Controllers\FactureItemController;
use App\Http\Controllers\WorkScheduleController;
use App\Http\Controllers\WorkTypeController;
use App\Http\Controllers\LeaveTypeController;
use App\Http\Controllers\ScheduleContestController;
use App\Http\Controllers\CongeController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\EmailResetPasswordController;
use App\Http\Controllers\MfaController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::post('login', [AuthController::class, 'login']);

// Routes de récupération de mot de passe (ancien système - gardé pour compatibilité)
Route::post('forgot-password-old', [App\Http\Controllers\PasswordRecoveryController::class, 'forgotPassword']);
Route::post('reset-password-old', [App\Http\Controllers\PasswordRecoveryController::class, 'resetPassword']);

// Routes de récupération de mot de passe avec code à 6 chiffres (NOUVEAU)
Route::post('forgot-password', [EmailResetPasswordController::class, 'sendResetCode']);
Route::post('verify-code', [EmailResetPasswordController::class, 'verifyCode']);
Route::post('reset-password', [EmailResetPasswordController::class, 'resetPassword']);

Route::post('mfa/verify', [MfaController::class, 'verify'])->middleware('throttle:6,1');

// Routes publiques pour les types
Route::get('work-types', [WorkTypeController::class, 'index']);
Route::get('leave-types', [LeaveTypeController::class, 'index']);

// Routes protégées par authentification (AVANT les routes resource pour éviter les conflits)
Route::middleware(['auth:sanctum', 'throttle:120,1'])->group(function () {
    Route::get('/admin/me', [AuthController::class, 'me']);
    Route::get('/client/me', [AuthController::class, 'me']);
    Route::get('/manager/me', [AuthController::class, 'me']);
    Route::get('/rh/me', [AuthController::class, 'me']);
    Route::get('/comptable/me', [AuthController::class, 'me']);
    Route::get('/consultant/me', [ConsultantController::class, 'me']);
    Route::post('logout', [AuthController::class, 'logout']);
    
    // 🚀 Endpoints agrégés pour performance (1 appel au lieu de plusieurs)
    Route::get('/consultant/dashboard-data', [ConsultantController::class, 'getDashboardData']);
    Route::get('/admin/consultants-data', [ConsultantController::class, 'getAdminConsultantsData']);
    
    // 🚀 Endpoints pour comptable - données filtrées par client_id
    Route::get('/comptable/consultants', [ComptableController::class, 'getMyConsultants']);
    Route::get('/comptable/work-schedules', [ComptableController::class, 'getMyWorkSchedules']);
    Route::get('/comptable/factures', [ComptableController::class, 'getMyFactures']);
    
    // Routes pour les work schedules (authentifiées) avec rate limit augmenté
    Route::get('/my-work-schedules', [WorkScheduleController::class, 'mySchedules']);
    Route::get('/work-logs-grouped', [WorkScheduleController::class, 'getWorkLogsGroupedByMonth']);
    Route::apiResource('work-schedules', WorkScheduleController::class);
    
    // Route pour envoyer le rapport mensuel au client par email
    Route::post('/send-monthly-report', [WorkScheduleController::class, 'sendMonthlyReportToClient']);
    
    // Routes pour la signature de CRA
    Route::post('/sign-cra', [WorkScheduleController::class, 'signCRA']);
    Route::get('/check-cra-signature', [WorkScheduleController::class, 'checkCRASignature']);
    Route::get('/check-cra-signature-status', [WorkScheduleController::class, 'checkCRASignatureStatus']); // Vérifier le statut détaillé des signatures
    Route::post('/check-cra-signatures', [WorkScheduleController::class, 'checkCRASignatures']); // Optimisé pour plusieurs signatures
    
    // Routes pour les contestations d'horaires
    Route::apiResource('schedule-contests', ScheduleContestController::class);
    
    // Routes pour les congés
    Route::get('/my-conges', [CongeController::class, 'myConges']); // Congés du consultant connecté
    Route::get('/rh/pending-conges', [CongeController::class, 'pendingConges']); // Congés en attente pour RH
    Route::apiResource('conges', CongeController::class);
});

// Routes publiques (sans authentification) - APRÈS les routes protégées pour éviter les conflits
Route::apiResource('clients', ClientController::class);
Route::apiResource('managers', ManagerController::class);
Route::apiResource('rh', RhController::class);
Route::apiResource('comptables', ComptableController::class);
Route::apiResource('projects', ProjectController::class);
Route::apiResource('assignments', AssignmentController::class);
Route::apiResource('quotes', QuoteController::class);
Route::apiResource('factures', FactureController::class);
Route::post('factures/{facture}/send-email', [FactureController::class, 'sendEmail']);
Route::apiResource('facture-items', FactureItemController::class);
Route::apiResource('consultants', ConsultantController::class);

