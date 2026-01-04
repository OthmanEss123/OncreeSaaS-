<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    public function index() { return Project::with('client')->get(); }

    public function store(Request $request) {
        $data = $request->validate([
            'client_id'  => 'required|exists:clients,id',
            'name'       => 'required|string|max:150',
            'description'=> 'nullable|string',
            'start_date' => 'nullable|date',
            'end_date'   => 'nullable|date|after_or_equal:start_date',
            'id_manager' => 'nullable|exists:managers,id',
            'id_comptable' => 'nullable|exists:comptables,id',
            'id_rh'      => 'nullable|exists:rh,id',
            'consultants'=> 'nullable|array',
            'consultants.*'=> 'exists:consultants,id',
        ]);
        
        // Extraire les consultants avant de créer le projet
        $consultantIds = $data['consultants'] ?? [];
        unset($data['consultants']);
        
        // Créer le projet
        $project = Project::create($data);
        
        // Assigner les consultants au projet (mettre à jour project_id dans la table consultants)
        if (!empty($consultantIds)) {
            \App\Models\Consultant::whereIn('id', $consultantIds)
                ->update(['project_id' => $project->id]);
        }
        
        return $project->load('consultants');
    }

    public function show(Project $project) {
        // Charger toutes les relations nécessaires pour la page de détails
        $project->load([
            'client',
            'manager',
            'rh',
            'comptable',
            'consultants' => function ($query) {
                // Charger les consultants avec leurs work schedules
                $query->with(['workSchedules' => function ($wsQuery) {
                    // Trier les work schedules par date décroissante
                    $wsQuery->orderBy('date', 'desc');
                }]);
            }
        ]);
        
        return $project;
    }

    public function update(Request $request, Project $project) {
        $data = $request->validate([
            'client_id'  => 'sometimes|exists:clients,id',
            'name'       => 'sometimes|string|max:150',
            'description'=> 'nullable|string',
            'start_date' => 'nullable|date',
            'end_date'   => 'nullable|date|after_or_equal:start_date',
            'id_manager' => 'nullable|exists:managers,id',
            'id_comptable' => 'nullable|exists:comptables,id',
            'id_rh'      => 'nullable|exists:rh,id',
            'consultants'=> 'nullable|array',
            'consultants.*'=> 'exists:consultants,id',
        ]);
        
        // Extraire les consultants avant de mettre à jour le projet
        $consultantIds = $data['consultants'] ?? null;
        unset($data['consultants']);
        
        // Mettre à jour le projet
        $project->update($data);
        
        // Gérer les consultants si fournis
        if ($consultantIds !== null) {
            // Retirer l'ancien projet_id des consultants précédemment assignés
            \App\Models\Consultant::where('project_id', $project->id)
                ->update(['project_id' => null]);
                
            // Assigner les nouveaux consultants
            if (!empty($consultantIds)) {
                \App\Models\Consultant::whereIn('id', $consultantIds)
                    ->update(['project_id' => $project->id]);
            }
        }
        
        return $project->load('consultants');
    }

    public function destroy(Project $project) {
        $project->delete();
        return response()->noContent();
    }
}
