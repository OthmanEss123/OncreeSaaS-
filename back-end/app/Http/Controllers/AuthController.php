<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Manager;
use App\Models\Rh;
use App\Models\Comptable;
use App\Models\Consultant;
use App\Models\Admin;
use App\Models\TwoFactorChallenge;
use App\Models\TwoFactorSetting;
use App\Notifications\TwoFactorCodeNotification;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
            'type'     => 'nullable|in:admin,client,manager,rh,comptable,consultant'
        ]);

        // Si le type est fourni, l'utiliser directement
        if (isset($credentials['type'])) {
            $userType = $credentials['type'];
        } else {
            // Sinon, détecter automatiquement le type en cherchant l'email
            $userType = $this->detectUserType($credentials['email']);
            
            if (!$userType) {
                return response()->json(['message' => 'Aucun compte trouvé avec cet email'], 401);
            }
        }

        // Choisir le modèle selon le type
        $map = [
            'admin'      => Admin::class,
            'client'     => Client::class,
            'manager'    => Manager::class,
            'rh'         => Rh::class,
            'comptable'  => Comptable::class,
            'consultant' => Consultant::class,
        ];

        $model = $map[$userType];
        
        // Utiliser le bon nom de colonne selon le type d'utilisateur
        $emailField = ($userType === 'client') ? 'contact_email' : 'email';
        $user = $model::where($emailField, $credentials['email'])->first();

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            return response()->json(['message' => 'Identifiants invalides'], 401);
        }

        // MFA est maintenant obligatoire pour tous les types d'utilisateurs, y compris les admins
        // Vérifier le statut MFA
        $setting = $user->twoFactorSetting()->first();
        
        // Si MFA n'est pas activé, le créer automatiquement
        if (!$setting) {
            $setting = $user->twoFactorSetting()->create([
                'channel' => 'email',
                'enabled' => true,
            ]);
        } elseif (!$setting->enabled) {
            // Si le setting existe mais est désactivé, le réactiver
            $setting->update(['enabled' => true]);
        }
        
        // Log pour debug (en développement)
        if (app()->environment('local')) {
            \Log::info('MFA Check', [
                'user_type' => $userType,
                'user_id' => $user->id,
                'user_email' => $user->email ?? $user->contact_email ?? 'N/A',
                'setting_exists' => $setting ? true : false,
                'setting_enabled' => $setting ? $setting->enabled : false,
            ]);
        }

        // MFA est maintenant toujours activé pour tous les utilisateurs (y compris les admins) - générer le code

        $code = (string) random_int(100000, 999999);
        $ttlMinutes = 5;

        $challenge = DB::transaction(function () use ($user, $setting, $code, $ttlMinutes) {
            $user->twoFactorChallenges()->delete();

            return $user->twoFactorChallenges()->create([
                'channel'    => $setting->channel,
                'code_hash'  => Hash::make($code),
                'expires_at' => Carbon::now()->addMinutes($ttlMinutes),
            ]);
        });

        try {
            $user->notify(new TwoFactorCodeNotification($code, $ttlMinutes));
            \Log::info('MFA Code sent successfully', [
                'user_type' => $userType,
                'user_id' => $user->id,
                'email' => $user->email ?? $user->contact_email ?? 'N/A',
                'challenge_id' => $challenge->id,
            ]);
        } catch (\Exception $e) {
            \Log::error('Error sending MFA code notification', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_type' => $userType,
                'user_id' => $user->id,
                'email' => $user->email ?? $user->contact_email ?? 'N/A',
                'challenge_id' => $challenge->id,
            ]);
            // En production, log le code pour débugger temporairement
            \Log::info('MFA Code (production debug): ' . $code, [
                'user_id' => $user->id,
                'challenge_id' => $challenge->id,
                'email' => $user->email ?? $user->contact_email ?? 'N/A',
            ]);
        }

        return response()->json([
            'mfa_required' => true,
            'challenge_id' => $challenge->id,
            'channel'      => $setting->channel,
            'type'         => $userType,
            // In development, return the code for testing
            'code'         => $code, // Temporairement en production pour débugger - À RETIRER après résolution
        ], 201);
    }

    /**
     * Détecte automatiquement le type d'utilisateur basé sur son email
     * Note: L'ordre est important - les rôles plus spécifiques sont vérifiés en premier
     */
    private function detectUserType(string $email): ?string
    {
        // Vérifier d'abord si c'est un admin
        if (Admin::where('email', $email)->exists()) {
            return 'admin';
        }
        
        // Vérifier dans chaque table avec le bon champ email
        if (Client::where('contact_email', $email)->exists()) {
            return 'client';
        }
        
        if (Manager::where('email', $email)->exists()) {
            return 'manager';
        }
        
        // Comptable AVANT RH pour éviter les conflits d'email
        if (Comptable::where('email', $email)->exists()) {
            return 'comptable';
        }
        
        if (Rh::where('email', $email)->exists()) {
            return 'rh';
        }
        
        if (Consultant::where('email', $email)->exists()) {
            return 'consultant';
        }

        return null;
    }

    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();
        return response()->json(['message' => 'Déconnecté']);
    }

    public function me(Request $request)
    {
        $user = $request->user();
        
        // Charger la relation client pour RH, Manager, Comptable, Consultant
        if ($user instanceof Rh || $user instanceof Manager || $user instanceof Comptable) {
            $user->load('client');
        }
        
        return response()->json($user);
    }
}
