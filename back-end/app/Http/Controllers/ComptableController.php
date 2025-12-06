<?php

namespace App\Http\Controllers;

use App\Models\Comptable;
use App\Models\Consultant;
use App\Models\WorkSchedule;
use App\Models\Facture;
use Illuminate\Http\Request;

class ComptableController extends Controller
{
    /**
     * Affiche la liste de tous les comptables.
     */
    public function index()
    {
        // Inclut le client lié
        return Comptable::with('client')->get();
    }

    /**
     * Enregistre un nouveau comptable.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name'      => 'required|string|max:150',
            'email'     => 'required|email|unique:comptables',
            'password'  => 'required|string|min:8',
            'phone'     => 'nullable|string|max:30',
            'client_id' => 'required|exists:clients,id',
            'address'   => 'nullable|string|max:255', // ✅ champ adresse
        ]);

        $data['password'] = bcrypt($data['password']);

        return Comptable::create($data);
    }

    /**
     * Affiche un comptable précis.
     */
    public function show(Comptable $comptable)
    {
        return $comptable->load('client');
    }

    /**
     * Met à jour un comptable existant.
     */
    public function update(Request $request, Comptable $comptable)
    {
        $data = $request->validate([
            'name'      => 'sometimes|string|max:150',
            'email'     => 'sometimes|email|unique:comptables,email,' . $comptable->id,
            'password'  => 'nullable|string|min:8',
            'phone'     => 'nullable|string|max:30',
            'client_id' => 'sometimes|exists:clients,id',
            'address'   => 'nullable|string|max:255', // ✅ champ adresse
        ]);

        if (isset($data['password'])) {
            $data['password'] = bcrypt($data['password']);
        }

        $comptable->update($data);
        return $comptable;
    }

    /**
     * Supprime un comptable.
     */
    public function destroy(Comptable $comptable)
    {
        $comptable->delete();
        return response()->noContent();
    }

    /**
     * Récupère les consultants du client du comptable authentifié
     */
    public function getMyConsultants(Request $request)
    {
        try {
            $comptable = $request->user();
            
            if (!$comptable) {
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non authentifié'
                ], 401);
            }

            if (!$comptable instanceof Comptable) {
                return response()->json([
                    'success' => false,
                    'message' => 'Accès réservé aux comptables'
                ], 403);
            }
            
            if (!$comptable->client_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Aucun client associé à ce comptable'
                ], 400);
            }

            // Récupérer uniquement les consultants du même client
            $consultants = Consultant::with(['client', 'project.client'])
                ->where('client_id', $comptable->client_id)
                ->get();

            return response()->json([
                'success' => true,
                'data' => $consultants
            ]);
        } catch (\Exception $e) {
            \Log::error('Erreur dans getMyConsultants: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du chargement des consultants',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Récupère les horaires de travail des consultants du client du comptable
     */
    public function getMyWorkSchedules(Request $request)
    {
        try {
            $comptable = $request->user();
            
            if (!$comptable) {
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non authentifié'
                ], 401);
            }

            if (!$comptable instanceof Comptable) {
                return response()->json([
                    'success' => false,
                    'message' => 'Accès réservé aux comptables'
                ], 403);
            }
            
            if (!$comptable->client_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Aucun client associé à ce comptable'
                ], 400);
            }

            // Récupérer les IDs des consultants du même client
            $consultantIds = Consultant::where('client_id', $comptable->client_id)
                ->pluck('id');

            // Récupérer les horaires de travail de ces consultants
            $workSchedules = WorkSchedule::with(['consultant.client', 'workType', 'leaveType'])
                ->whereIn('consultant_id', $consultantIds)
                ->orderBy('date', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $workSchedules
            ]);
        } catch (\Exception $e) {
            \Log::error('Erreur dans getMyWorkSchedules: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du chargement des horaires de travail',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Récupère les factures du client du comptable
     */
    public function getMyFactures(Request $request)
    {
        try {
            $comptable = $request->user();
            
            if (!$comptable) {
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non authentifié'
                ], 401);
            }

            if (!$comptable instanceof Comptable) {
                return response()->json([
                    'success' => false,
                    'message' => 'Accès réservé aux comptables'
                ], 403);
            }
            
            if (!$comptable->client_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Aucun client associé à ce comptable'
                ], 400);
            }

            // Récupérer uniquement les factures du même client
            $factures = Facture::with(['client', 'consultant', 'quote', 'items'])
                ->where('client_id', $comptable->client_id)
                ->orderBy('facture_date', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $factures
            ]);
        } catch (\Exception $e) {
            \Log::error('Erreur dans getMyFactures: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du chargement des factures',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
