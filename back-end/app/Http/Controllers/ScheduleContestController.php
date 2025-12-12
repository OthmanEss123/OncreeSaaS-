<?php

namespace App\Http\Controllers;

use App\Models\ScheduleContest;
use App\Models\WorkSchedule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class ScheduleContestController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Utilisateur non authentifié'
            ], 401);
        }
        
        // Si c'est un client, retourner ses contestations
        if ($user->role === 'Client') {
            $contests = ScheduleContest::where('client_id', $user->id)
                ->with(['consultant', 'workSchedule'])
                ->orderBy('created_at', 'desc')
                ->get();
        } else {
            // Pour les autres rôles, retourner toutes les contestations
            $contests = ScheduleContest::with(['client', 'consultant', 'workSchedule'])
                ->orderBy('created_at', 'desc')
                ->get();
        }
        
        return response()->json([
            'success' => true,
            'data' => $contests
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $data = $request->validate([
                'work_schedule_id' => 'required|exists:work_schedules,id',
                'justification' => 'required|string|min:10',
            ]);

            $user = $request->user();
            
            // Vérifier que l'utilisateur est authentifié
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non authentifié'
                ], 401);
            }
            
            // Vérifier que l'utilisateur est un client
            if ($user->role !== 'Client') {
                return response()->json([
                    'success' => false,
                    'message' => 'Seuls les clients peuvent contester un horaire'
                ], 403);
            }

            // Récupérer le work schedule pour obtenir le consultant_id
            $workSchedule = WorkSchedule::findOrFail($data['work_schedule_id']);
            
            // Vérifier si une contestation existe déjà pour ce work_schedule
            $existingContest = ScheduleContest::where('work_schedule_id', $data['work_schedule_id'])
                ->where('client_id', $user->id)
                ->first();
                
            if ($existingContest) {
                return response()->json([
                    'success' => false,
                    'message' => 'Une contestation existe déjà pour cet horaire'
                ], 409);
            }

            // Créer la contestation
            $contest = ScheduleContest::create([
                'client_id' => $user->id,
                'consultant_id' => $workSchedule->consultant_id,
                'work_schedule_id' => $data['work_schedule_id'],
                'justification' => $data['justification'],
                'status' => 'pending'
            ]);

            // Charger les relations pour l'email
            $contest->load(['consultant', 'workSchedule']);
            $consultant = $contest->consultant;

            // Envoyer un email au consultant pour l'informer de la contestation
            if ($consultant && $consultant->email) {
                try {
                    Mail::send('emails.cra-contest-notification', [
                        'consultant' => $consultant,
                        'workSchedule' => $workSchedule,
                        'justification' => $data['justification'],
                        'client' => $user
                    ], function ($message) use ($consultant) {
                        $message->to($consultant->email)
                            ->subject('Contestation de votre Compte Rendu d\'Activité (CRA) - OncreeSaaS');
                    });
                    
                    \Log::info('Email de contestation envoyé au consultant', [
                        'consultant_id' => $consultant->id,
                        'consultant_email' => $consultant->email,
                        'work_schedule_id' => $workSchedule->id
                    ]);
                } catch (\Exception $e) {
                    \Log::error('Erreur lors de l\'envoi de l\'email de contestation au consultant', [
                        'consultant_id' => $consultant->id,
                        'consultant_email' => $consultant->email,
                        'error' => $e->getMessage()
                    ]);
                    // Ne pas faire échouer la création de la contestation si l'email échoue
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Contestation créée avec succès',
                'data' => $contest
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Erreur lors de la création de la contestation: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'request' => $request->all()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création de la contestation: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $contest = ScheduleContest::with(['client', 'consultant', 'workSchedule'])
            ->findOrFail($id);
            
        return response()->json([
            'success' => true,
            'data' => $contest
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $data = $request->validate([
            'status' => 'sometimes|in:pending,resolved,rejected',
            'justification' => 'sometimes|string|min:10',
        ]);

        $contest = ScheduleContest::findOrFail($id);
        $contest->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Contestation mise à jour avec succès',
            'data' => $contest->load(['client', 'consultant', 'workSchedule'])
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $contest = ScheduleContest::findOrFail($id);
        $contest->delete();

        return response()->json([
            'success' => true,
            'message' => 'Contestation supprimée avec succès'
        ]);
    }
}
