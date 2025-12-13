<?php

namespace App\Http\Controllers;

use App\Models\Conge;
use App\Models\Consultant;
use App\Models\Rh;
use Illuminate\Http\Request;

class CongeController extends Controller
{
    /**
     * Liste de tous les congés (pour RH et Admin)
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        // Si c'est un RH, filtrer par client_id
        if ($user instanceof Rh) {
            $conges = Conge::with(['consultant', 'leaveType', 'rh'])
                ->whereHas('consultant', function($query) use ($user) {
                    $query->where('client_id', $user->client_id);
                })
                ->orderBy('created_at', 'desc')
                ->get();
        } else {
            // Pour les autres rôles (admin, etc.), retourner tous les congés
            $conges = Conge::with(['consultant', 'leaveType', 'rh'])
                ->orderBy('created_at', 'desc')
                ->get();
        }
        
        return response()->json([
            'success' => true,
            'data' => $conges
        ]);
    }

    /**
     * Récupère les congés du consultant connecté
     */
    public function myConges(Request $request)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Utilisateur non authentifié'
            ], 401);
        }
        
        if (!($user instanceof Consultant)) {
            $userType = get_class($user);
            return response()->json([
                'success' => false,
                'message' => 'Accès réservé aux consultants. Type d\'utilisateur détecté: ' . class_basename($userType)
            ], 403);
        }
        
        $consultant = $user;
        
        $conges = Conge::where('consultant_id', $consultant->id)
            ->with(['leaveType', 'rh'])
            ->orderBy('created_at', 'desc')
            ->get();
        
        return response()->json([
            'success' => true,
            'data' => $conges
        ]);
    }

    /**
     * Récupère les congés en attente pour le RH
     */
    public function pendingConges(Request $request)
    {
        $user = $request->user();
        
        if (!($user instanceof Rh)) {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé'
            ], 403);
        }
        
        $conges = Conge::with(['consultant', 'leaveType'])
            ->whereHas('consultant', function($query) use ($user) {
                $query->where('client_id', $user->client_id);
            })
            ->where('status', 'pending')
            ->orderBy('created_at', 'asc')
            ->get();
        
        return response()->json([
            'success' => true,
            'data' => $conges
        ]);
    }

    /**
     * Création d'une nouvelle demande de congé (par le consultant)
     */
    public function store(Request $request)
    {
        $consultant = $request->user();
        
        if (!($consultant instanceof Consultant)) {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé'
            ], 403);
        }
        
        try {
            $data = $request->validate([
                'start_date' => 'required|date|after_or_equal:today',
                'end_date' => 'required|date|after_or_equal:start_date',
                'leave_type_id' => 'nullable|exists:leave_types,id',
                'reason' => 'nullable|string|max:1000',
            ]);
            
            $data['consultant_id'] = $consultant->id;
            $data['status'] = 'pending';
            
            $conge = Conge::create($data);
            $conge->load(['leaveType', 'consultant']);
            
            return response()->json([
                'success' => true,
                'data' => $conge,
                'message' => 'Demande de congé créée avec succès'
            ], 201);
            
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Affiche un congé précis
     */
    public function show(Conge $conge)
    {
        $conge->load(['consultant', 'leaveType', 'rh']);
        return response()->json([
            'success' => true,
            'data' => $conge
        ]);
    }

    /**
     * Met à jour le statut d'un congé (par le RH)
     */
    public function update(Request $request, Conge $conge)
    {
        $user = $request->user();
        
        if (!($user instanceof Rh)) {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé. Seul le RH peut modifier le statut.'
            ], 403);
        }
        
        // Vérifier que le consultant appartient au même client que le RH
        if ($conge->consultant->client_id !== $user->client_id) {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé'
            ], 403);
        }
        
        try {
            $data = $request->validate([
                'status' => 'required|in:approved,rejected',
                'rh_comment' => 'nullable|string|max:1000',
            ]);
            
            $data['rh_id'] = $user->id;
            $data['processed_at'] = now();
            
            $conge->update($data);
            $conge->load(['consultant', 'leaveType', 'rh']);
            
            return response()->json([
                'success' => true,
                'data' => $conge,
                'message' => 'Statut du congé mis à jour avec succès'
            ]);
            
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Supprime une demande de congé (uniquement si elle est en attente)
     */
    public function destroy(Conge $conge)
    {
        $consultant = request()->user();
        
        // Seul le consultant qui a créé la demande peut la supprimer, et uniquement si elle est en attente
        if (!($consultant instanceof Consultant) || $conge->consultant_id !== $consultant->id) {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé'
            ], 403);
        }
        
        if ($conge->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Impossible de supprimer une demande déjà traitée'
            ], 400);
        }
        
        $conge->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Demande de congé supprimée avec succès'
        ]);
    }
}
