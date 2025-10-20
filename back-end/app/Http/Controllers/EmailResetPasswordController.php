<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\DB;
use App\Models\Client;
use App\Models\Manager;
use App\Models\Rh;
use App\Models\Comptable;
use App\Models\Consultant;
use Carbon\Carbon;

class EmailResetPasswordController extends Controller
{
    /**
     * Step 1: Send 6-digit code to user's email
     */
    public function sendResetCode(Request $request)
    {
        $request->validate([
            'email' => 'required|email'
        ]);

        $email = $request->email;
        
        // Search for user across all user tables
        $user = null;
        $userType = null;
        
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
                'success' => false,
                'message' => 'Aucun compte trouvé avec cette adresse email'
            ], 404);
        }
        
        // Generate 6-digit code
        $code = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
        
        // Delete any existing codes for this email
        DB::table('password_resets')->where('email', $email)->delete();
        
        // Store the reset code in database
        DB::table('password_resets')->insert([
            'email' => $email,
            'code' => $code,
            'user_type' => $userType,
            'created_at' => Carbon::now(),
            'expires_at' => Carbon::now()->addMinutes(15), // Expires in 15 minutes
        ]);
        
        // Get user's name
        $userName = $user->name ?? $user->contact_name ?? 'Utilisateur';
        
        // Send email with the code
        try {
            Mail::send('emails.reset-code', [
                'code' => $code,
                'userName' => $userName,
                'expiresIn' => '15 minutes'
            ], function ($message) use ($email) {
                $message->to($email)
                        ->subject('Code de réinitialisation - OncreeSaaS');
            });
            
            return response()->json([
                'success' => true,
                'message' => 'Code de réinitialisation envoyé avec succès à votre email',
                // In development mode, return the code for testing
                'code' => app()->environment('local') ? $code : null
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'envoi de l\'email: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Step 2: Verify the 6-digit code
     */
    public function verifyCode(Request $request)
    {
        \Log::info('Verify Code Request:', $request->all());
        
        $request->validate([
            'email' => 'required|email',
            'code' => 'required|string|size:6'
        ]);

        $email = $request->email;
        $code = $request->code;
        
        \Log::info('Searching for reset record:', ['email' => $email, 'code' => $code]);
        
        // Find the reset code in database
        $resetRecord = DB::table('password_resets')
            ->where('email', $email)
            ->where('code', $code)
            ->first();
        
        \Log::info('Reset record found:', $resetRecord ? (array) $resetRecord : ['record' => 'null']);
        
        if (!$resetRecord) {
            \Log::warning('No reset record found for email and code');
            return response()->json([
                'success' => false,
                'message' => 'Code invalide ou email incorrect'
            ], 400);
        }
        
        // Check if code has expired (15 minutes)
        $expiresAt = Carbon::parse($resetRecord->expires_at);
        if (Carbon::now()->greaterThan($expiresAt)) {
            // Delete expired code
            DB::table('password_resets')
                ->where('email', $email)
                ->where('code', $code)
                ->delete();
                
            return response()->json([
                'success' => false,
                'message' => 'Le code a expiré. Veuillez demander un nouveau code.'
            ], 400);
        }
        
        return response()->json([
            'success' => true,
            'message' => 'Code vérifié avec succès',
            'email' => $email,
            'user_type' => $resetRecord->user_type
        ]);
    }
    
    /**
     * Step 3: Reset password with verified code
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'code' => 'required|string|size:6',
            'password' => 'required|string|min:6|confirmed'
        ]);

        $email = $request->email;
        $code = $request->code;
        $password = $request->password;
        
        // Verify the code again
        $resetRecord = DB::table('password_resets')
            ->where('email', $email)
            ->where('code', $code)
            ->first();
        
        if (!$resetRecord) {
            return response()->json([
                'success' => false,
                'message' => 'Code invalide ou email incorrect'
            ], 400);
        }
        
        // Check if code has expired
        $expiresAt = Carbon::parse($resetRecord->expires_at);
        if (Carbon::now()->greaterThan($expiresAt)) {
            DB::table('password_resets')
                ->where('email', $email)
                ->where('code', $code)
                ->delete();
                
            return response()->json([
                'success' => false,
                'message' => 'Le code a expiré. Veuillez demander un nouveau code.'
            ], 400);
        }
        
        // Find the user based on user_type
        $userType = $resetRecord->user_type;
        $tables = [
            'client' => Client::class,
            'manager' => Manager::class,
            'rh' => Rh::class,
            'comptable' => Comptable::class,
            'consultant' => Consultant::class,
        ];
        
        $model = $tables[$userType];
        $emailField = ($userType === 'client') ? 'contact_email' : 'email';
        $user = $model::where($emailField, $email)->first();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Utilisateur non trouvé'
            ], 404);
        }
        
        // Update the password
        $user->password = Hash::make($password);
        $user->save();
        
        // Delete the used code
        DB::table('password_resets')
            ->where('email', $email)
            ->where('code', $code)
            ->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Mot de passe réinitialisé avec succès'
        ]);
    }
}

