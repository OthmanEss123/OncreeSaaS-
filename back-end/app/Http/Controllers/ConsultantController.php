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
        $data = $request->validate([
            'first_name'  => 'required|string|max:150',
            'last_name'   => 'required|string|max:150',
            'email'       => 'required|email|unique:consultants',
            'password'    => 'required|string|min:8',
            'phone'       => 'nullable|string|max:30',
            'client_id'   => 'nullable|exists:clients,id',
            'address'     => 'nullable|string|max:255',   // ✅ adresse
            'skills'      => 'nullable|string',
            'daily_rate'  => 'nullable|numeric',
            'status'      => 'in:active,inactive',
            'project_id'  => 'nullable|exists:projects,id',
        ]);

        $data['password'] = bcrypt($data['password']);

        return Consultant::create($data);
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
        
        return $consultant;
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
            $consultant = $request->user();
            
            // Charger toutes les relations nécessaires
            $consultant->load([
                'client', 
                'project.client',
                'workSchedules'
            ]);
            
            // Récupérer les types de travail et congés
            $workTypes = \App\Models\WorkType::all();
            $leaveTypes = \App\Models\LeaveType::all();
            
            return response()->json([
                'success' => true,
                'data' => [
                    'consultant' => $consultant,
                    'project' => $consultant->project,
                    'workSchedules' => $consultant->workSchedules,
                    'workTypes' => $workTypes,
                    'leaveTypes' => $leaveTypes
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
