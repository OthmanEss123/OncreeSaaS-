<?php

namespace App\Http\Controllers;

use App\Models\UserSignature;
use App\Models\Consultant;
use App\Models\Client;
use App\Models\Manager;
use App\Models\Rh;
use App\Models\Comptable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class UserSignatureController extends Controller
{
    /**
     * Enregistrer une nouvelle signature
     */
    public function store(Request $request)
    {
        try {
            $request->validate([
                'signature_data' => 'required|string',
                'document_type' => 'nullable|string|max:255',
                'document_id' => 'nullable|integer',
                'metadata' => 'nullable|array',
                'consultant_id' => 'nullable|integer|exists:consultants,id',
                'month' => 'nullable|integer|min:1|max:12',
                'year' => 'nullable|integer|min:2020|max:2030'
            ]);

            $user = $request->user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non authentifié'
                ], 401);
            }

            // Récupérer le nom et l'email selon le type d'utilisateur
            $userName = $this->getUserName($user);
            $userEmail = $this->getUserEmail($user);

            // Préparer les métadonnées avec informations de contexte
            $metadata = array_merge($request->metadata ?? [], [
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'signed_at' => now()->toIso8601String()
            ]);

            $signature = UserSignature::create([
                'user_type' => get_class($user),
                'user_id' => $user->id,
                'user_name' => $userName,
                'user_email' => $userEmail,
                'signature_data' => $request->signature_data,
                'signed_at' => now(),
                'document_type' => $request->document_type,
                'document_id' => $request->document_id,
                'metadata' => $metadata,
                'consultant_id' => $request->consultant_id,
                'client_id' => $user instanceof Client ? $user->id : null,
                'manager_id' => $user instanceof Manager ? $user->id : null,
                'month' => $request->month,
                'year' => $request->year
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Signature enregistrée avec succès',
                'data' => $signature
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Erreur lors de l\'enregistrement de la signature: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'enregistrement: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtenir le nom de l'utilisateur selon son type
     */
    private function getUserName($user): string
    {
        if ($user instanceof Consultant) {
            return trim($user->first_name . ' ' . $user->last_name);
        } elseif ($user instanceof Client) {
            return $user->contact_name ?? $user->company_name;
        } elseif ($user instanceof Manager) {
            return $user->name;
        } elseif ($user instanceof Rh) {
            return $user->name ?? '';
        } elseif ($user instanceof Comptable) {
            return $user->name ?? '';
        }
        
        return 'Inconnu';
    }

    /**
     * Obtenir l'email de l'utilisateur selon son type
     */
    private function getUserEmail($user): string
    {
        if ($user instanceof Consultant) {
            return $user->email;
        } elseif ($user instanceof Client) {
            return $user->contact_email;
        } elseif ($user instanceof Manager) {
            return $user->email;
        } elseif ($user instanceof Rh) {
            return $user->email ?? '';
        } elseif ($user instanceof Comptable) {
            return $user->email ?? '';
        }
        
        return '';
    }

    /**
     * Récupérer une signature par ID
     */
    public function show($id)
    {
        try {
            $signature = UserSignature::findOrFail($id);
            return response()->json([
                'success' => true,
                'data' => $signature
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Signature non trouvée'
            ], 404);
        }
    }

    /**
     * Récupérer les signatures avec filtres
     */
    public function index(Request $request)
    {
        try {
            $query = UserSignature::query();

            if ($request->user_id) {
                $query->where('user_id', $request->user_id);
            }

            if ($request->user_type) {
                $query->where('user_type', $request->user_type);
            }

            if ($request->document_type) {
                $query->where('document_type', $request->document_type);
                
                if ($request->document_id) {
                    $query->where('document_id', $request->document_id);
                }
            }

            // Pour les CRA
            if ($request->month && $request->year && $request->consultant_id) {
                $query->where('month', $request->month)
                      ->where('year', $request->year)
                      ->where('consultant_id', $request->consultant_id);
            }

            $signatures = $query->orderBy('signed_at', 'desc')->get();

            return response()->json([
                'success' => true,
                'data' => $signatures
            ]);
        } catch (\Exception $e) {
            Log::error('Erreur lors de la récupération des signatures: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des signatures'
            ], 500);
        }
    }

    /**
     * Supprimer une signature
     */
    public function destroy($id)
    {
        try {
            $signature = UserSignature::findOrFail($id);
            $signature->delete();

            return response()->json([
                'success' => true,
                'message' => 'Signature supprimée avec succès'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Signature non trouvée'
            ], 404);
        }
    }
}
