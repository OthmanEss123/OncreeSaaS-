<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\Client;
use App\Models\Manager;
use App\Models\Rh;
use App\Models\Comptable;
use App\Models\Consultant;
use App\Models\Admin;

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

        // Créer un token avec Laravel Sanctum
        $token = $user->createToken($userType.'-token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'type'  => $userType,
            'user'  => $user
        ]);
    }

    /**
     * Détecte automatiquement le type d'utilisateur basé sur son email
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
        
        if (Rh::where('email', $email)->exists()) {
            return 'rh';
        }
        
        if (Comptable::where('email', $email)->exists()) {
            return 'comptable';
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
