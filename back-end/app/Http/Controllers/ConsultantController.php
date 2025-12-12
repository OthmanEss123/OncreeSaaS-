<?php

namespace App\Http\Controllers;

use App\Models\Consultant;
use Illuminate\Http\Request;

class ConsultantController extends Controller
{
    /**
     * Liste de tous les consultants
     */
    public function index()
    {
        // Retourne tous les consultants avec leur client associé
        return Consultant::with('client')->get();
    }

    /**
     * Création d’un nouveau consultant
     */
    public function store(Request $request)
    {
        try {
            $data = $request->validate([
                'first_name'  => 'required|string|max:150',
                'last_name'   => 'required|string|max:150',
                'email'       => 'required|email|unique:consultants,email',
                'password'    => 'required|string|min:8',
                'phone'       => 'nullable|string|max:30',
                'client_id'   => 'nullable|exists:clients,id',
                'address'     => 'nullable|string|max:255',
                'skills'      => 'nullable|string',
                'daily_rate'  => 'nullable|numeric',
                'status'      => 'nullable|in:active,inactive',
                'project_id'  => 'nullable|exists:projects,id',
            ]);

            $data['password'] = bcrypt($data['password']);
            $consultant = Consultant::create($data);
            return response()->json($consultant, 201);
            
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Erreur de validation',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la création',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Affiche un consultant précis
     */
    public function show(Consultant $consultant)
    {
        // Charger toutes les relations nécessaires pour la page de détails
        $consultant->load([
            'client',
            'project.client', // Projet actuel avec son client
            'workSchedules' => function ($query) {
                // Charger les work schedules avec leurs relations
                $query->with(['workType', 'leaveType'])
                      ->orderBy('date', 'desc');
            },
            'assignments.project' // Assignments historiques avec leurs projets
        ]);
        
        // Recharger les workSchedules pour s'assurer qu'ils sont bien chargés
        $consultant->load('workSchedules.workType', 'workSchedules.leaveType');
        
        // Log pour déboguer
        \Log::info('ConsultantController::show - Consultant chargé', [
            'consultant_id' => $consultant->id,
            'work_schedules_count' => $consultant->workSchedules->count(),
            'work_schedules_ids' => $consultant->workSchedules->pluck('id')->toArray(),
            'first_schedule' => $consultant->workSchedules->first() ? [
                'id' => $consultant->workSchedules->first()->id,
                'date' => $consultant->workSchedules->first()->date,
                'work_type' => $consultant->workSchedules->first()->workType ? $consultant->workSchedules->first()->workType->name : null,
                'leave_type' => $consultant->workSchedules->first()->leaveType ? $consultant->workSchedules->first()->leaveType->name : null,
            ] : null,
            'consultant_to_array' => $consultant->toArray()
        ]);
        
        // Forcer la sérialisation en convertissant en array puis en JSON
        // Cela garantit que toutes les relations chargées sont incluses
        return response()->json($consultant->toArray());
    }

    /**
     * Mise à jour d’un consultant
     */
    public function update(Request $request, Consultant $consultant)
    {
        $data = $request->validate([
            'first_name'  => 'sometimes|string|max:150',
            'last_name'   => 'sometimes|string|max:150',
            'email'       => 'sometimes|email|unique:consultants,email,' . $consultant->id,
            'password'    => 'nullable|string|min:8',
            'phone'       => 'nullable|string|max:30',
            'client_id'   => 'sometimes|exists:clients,id',
            'address'     => 'nullable|string|max:255',   // ✅ adresse
            'skills'      => 'nullable|string',
            'daily_rate'  => 'nullable|numeric',
            'status'      => 'sometimes|in:active,inactive',
            'project_id'  => 'nullable|exists:projects,id', 
        ]);

        // Ne pas supprimer first_name/last_name - ils sont les vraies colonnes
        // 'name' est un accesseur virtuel calculé automatiquement
        if (isset($data['password'])) {
            $data['password'] = bcrypt($data['password']);
        }

        $consultant->update($data);
        return $consultant;
    }

    /**
     * Suppression d'un consultant
     */
    public function destroy(Consultant $consultant)
    {
        $consultant->delete();
        return response()->noContent();
    }

    /**
     * Récupère les informations du consultant connecté avec son projet et ses work schedules
     */
    public function me(Request $request)
    {
        $consultant = $request->user();
        
        // Charger les relations avec le client du projet aussi
        $consultant->load([
            'client', 
            'project.client',  // Charger le client du projet
            'workSchedules'
        ]);
        
        return response()->json([
            'consultant' => $consultant,
            'project' => $consultant->project,
            'workSchedules' => $consultant->workSchedules
        ]);
    }

    /**
     * 🚀 Endpoint agrégé pour le dashboard consultant
     * Récupère toutes les données nécessaires en 1 seul appel
     */
    public function getDashboardData(Request $request)
    {
        try {
            $user = $request->user();
            
            // Vérifier que l'utilisateur est authentifié
            if (!$user) {
                \Log::warning('getDashboardData: Utilisateur non authentifié');
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non authentifié'
                ], 401);
            }
            
            // Logger le type d'utilisateur pour le débogage
            $userType = get_class($user);
            \Log::info('getDashboardData: Type d\'utilisateur connecté', [
                'type' => $userType,
                'id' => $user->id ?? null,
                'email' => $user->email ?? $user->contact_email ?? null
            ]);
            
            // Vérifier que c'est bien un consultant
            if (!$user instanceof \App\Models\Consultant) {
                \Log::warning('getDashboardData: Accès refusé - pas un consultant', [
                    'type_utilisateur' => $userType,
                    'id' => $user->id ?? null
                ]);
                return response()->json([
                    'success' => false,
                    'message' => 'Accès réservé aux consultants. Type d\'utilisateur détecté: ' . class_basename($userType)
                ], 403);
            }
            
            $consultant = $user;
            
            // Charger les relations de manière contrôlée pour éviter les problèmes de sérialisation
            $consultant->load([
                'client', 
                'project' => function ($query) {
                    // Charger le projet avec son client, mais sans relations supplémentaires
                    $query->with('client');
                },
                'workSchedules' => function ($query) {
                    // Charger les work schedules avec leurs relations workType et leaveType
                    $query->with(['workType', 'leaveType'])
                          ->orderBy('date', 'desc');
                }
            ]);
            
            // Récupérer les types de travail et congés
            $workTypes = \App\Models\WorkType::all();
            $leaveTypes = \App\Models\LeaveType::all();
            
            // Construire la réponse de manière explicite pour éviter les problèmes de sérialisation
            $projectData = null;
            if ($consultant->project) {
                $projectData = [
                    'id' => $consultant->project->id,
                    'name' => $consultant->project->name,
                    'description' => $consultant->project->description,
                    'start_date' => $consultant->project->start_date,
                    'end_date' => $consultant->project->end_date,
                    'client_id' => $consultant->project->client_id,
                    'created_at' => $consultant->project->created_at,
                    'updated_at' => $consultant->project->updated_at,
                ];
                
                // Ajouter le client du projet si disponible
                if ($consultant->project->client) {
                    $projectData['client'] = [
                        'id' => $consultant->project->client->id,
                        'company_name' => $consultant->project->client->company_name,
                        'contact_name' => $consultant->project->client->contact_name,
                        'contact_email' => $consultant->project->client->contact_email,
                        'contact_phone' => $consultant->project->client->contact_phone,
                    ];
                }
            }
            
            return response()->json([
                'success' => true,
                'data' => [
                    'consultant' => $consultant,
                    'project' => $projectData,
                    'workSchedules' => $consultant->workSchedules,
                    'workTypes' => $workTypes,
                    'leaveTypes' => $leaveTypes
                ]
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Erreur dans getDashboardData: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du chargement des données',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * 🚀 Endpoint agrégé pour la page admin consultants
     * Récupère consultants + clients + projects en 1 seul appel
     */
    public function getAdminConsultantsData()
    {
        try {
            return response()->json([
                'success' => true,
                'data' => [
                    'consultants' => Consultant::with(['client', 'project.client'])->get(),
                    'clients' => \App\Models\Client::all(),
                    'projects' => \App\Models\Project::with('client')->get()
                ]
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du chargement des données',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
