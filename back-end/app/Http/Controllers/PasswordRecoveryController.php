<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use App\Models\Client;
use App\Models\Manager;
use App\Models\Rh;
use App\Models\Comptable;
use App\Models\Consultant;

class PasswordRecoveryController extends Controller
{
    /**
     * Envoyer un email de réinitialisation de mot de passe
     */
    public function forgotPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email'
        ]);

        $email = $request->email;
        
        // Chercher l'utilisateur dans toutes les tables
        $user = null;
        $userType = null;
        
        // Vérifier dans chaque table
        $tables = [
            'client' => Client::class,
            'manager' => Manager::class,
            'rh' => Rh::class,
            'comptable' => Comptable::class,
            'consultant' => Consultant::class,
        ];
        
        foreach ($tables as $type => $model) {
            $emailField = ($type === 'client') ? 'contact_email' : 'email';
            $user = $model::where($emailField, $email)->first();
            if ($user) {
                $userType = $type;
                break;
            }
        }
        
        if (!$user) {
            return response()->json([
                'message' => 'Aucun compte trouvé avec cette adresse email'
            ], 404);
        }
        
        // Générer un token de réinitialisation
        $token = Str::random(60);
        
        // Stocker le token (dans un cache ou base de données)
        // Pour la démo, on utilise le cache
        cache()->put("password_reset_{$token}", [
            'user_id' => $user->id,
            'user_type' => $userType,
            'email' => $email
        ], now()->addHour()); // Token valide 1 heure
        
        // Envoyer l'email (simulation pour la démo)
        // Dans un vrai projet, vous utiliseriez Mail::send()
        $resetUrl = config('app.frontend_url', 'http://localhost:3000') . "/reset-password?token={$token}";
        
        // Log pour la démo (à remplacer par un vrai envoi d'email)
        \Log::info("Password reset email sent to {$email}");
        \Log::info("Reset URL: {$resetUrl}");
        
        return response()->json([
            'message' => 'Email de réinitialisation envoyé avec succès',
            'success' => true,
            // En développement, on peut retourner l'URL pour les tests
            'reset_url' => app()->environment('local') ? $resetUrl : null
        ]);
    }
    
    /**
     * Réinitialiser le mot de passe
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'token' => 'required|string',
            'password' => 'required|string|min:6'
        ]);
        
        $token = $request->token;
        $password = $request->password;
        
        // Récupérer les données du token
        $tokenData = cache()->get("password_reset_{$token}");
        
        if (!$tokenData) {
            return response()->json([
                'message' => 'Token invalide ou expiré'
            ], 400);
        }
        
        // Trouver l'utilisateur
        $userType = $tokenData['user_type'];
        $userId = $tokenData['user_id'];
        
        $tables = [
            'client' => Client::class,
            'manager' => Manager::class,
            'rh' => Rh::class,
            'comptable' => Comptable::class,
            'consultant' => Consultant::class,
        ];
        
        $model = $tables[$userType];
        $user = $model::find($userId);
        
        if (!$user) {
            return response()->json([
                'message' => 'Utilisateur non trouvé'
            ], 404);
        }
        
        // Mettre à jour le mot de passe
        $user->password = Hash::make($password);
        $user->save();
        
        // Supprimer le token utilisé
        cache()->forget("password_reset_{$token}");
        
        return response()->json([
            'message' => 'Mot de passe mis à jour avec succès',
            'success' => true
        ]);
    }
}













