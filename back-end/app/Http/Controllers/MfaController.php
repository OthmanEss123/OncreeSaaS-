<?php

namespace App\Http\Controllers;

use App\Models\TwoFactorChallenge;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class MfaController extends Controller
{
    public function verify(Request $request)
    {
        // Log la requête brute pour debug
        \Log::info('MFA Verify Request (raw)', [
            'all' => $request->all(),
            'headers' => $request->headers->all(),
            'challenge_id' => $request->input('challenge_id'),
            'challenge_id_type' => gettype($request->input('challenge_id')),
            'challenge_id_length' => strlen($request->input('challenge_id', '')),
            'code' => $request->input('code'),
            'code_type' => gettype($request->input('code')),
            'code_length' => strlen($request->input('code', '')),
            'code_is_numeric' => ctype_digit($request->input('code', '')),
        ]);

        try {
            // Nettoyer le code avant validation (supprimer les espaces, etc.)
            $code = $request->input('code');
            if ($code) {
                $code = trim($code);
                // S'assurer que le code contient uniquement des chiffres
                if (!ctype_digit($code)) {
                    $code = preg_replace('/\D/', '', $code);
                }
                $request->merge(['code' => $code]);
            }

            $data = $request->validate([
                'challenge_id' => ['required', 'uuid'],
                'code' => ['required', 'string', 'size:6', 'regex:/^\d{6}$/'],
            ], [
                'challenge_id.required' => 'Le challenge ID est requis.',
                'challenge_id.uuid' => 'Le challenge ID doit être un UUID valide (format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx).',
                'code.required' => 'Le code est requis.',
                'code.size' => 'Le code doit contenir exactement 6 chiffres.',
                'code.regex' => 'Le code doit contenir uniquement des chiffres (0-9).',
            ]);
        } catch (ValidationException $e) {
            \Log::error('MFA Verify Validation Error', [
                'errors' => $e->errors(),
                'request_all' => $request->all(),
                'request_json' => $request->json()->all(),
                'challenge_id_raw' => $request->input('challenge_id'),
                'challenge_id_type' => gettype($request->input('challenge_id')),
                'challenge_id_length' => strlen($request->input('challenge_id', '')),
                'code_raw' => $request->input('code'),
                'code_type' => gettype($request->input('code')),
                'code_length' => strlen($request->input('code', '')),
                'code_bytes' => bin2hex($request->input('code', '')),
            ]);
            throw $e;
        }

        // Log pour debug
        \Log::info('MFA Verify Request (validated)', [
            'challenge_id' => $data['challenge_id'],
            'code_length' => strlen($data['code']),
        ]);

        /** @var TwoFactorChallenge|null $challenge */
        $challenge = TwoFactorChallenge::query()->find($data['challenge_id']);

        if (!$challenge) {
            \Log::warning('MFA Challenge not found', ['challenge_id' => $data['challenge_id']]);
            throw ValidationException::withMessages([
                'challenge_id' => 'Challenge introuvable ou expiré.',
            ]);
        }

        if ($challenge->consumed_at) {
            \Log::warning('MFA Challenge already consumed', ['challenge_id' => $data['challenge_id']]);
            throw ValidationException::withMessages([
                'code' => 'Ce code a déjà été utilisé.',
            ]);
        }

        if ($challenge->hasExpired()) {
            \Log::warning('MFA Challenge expired', ['challenge_id' => $data['challenge_id']]);
            $challenge->delete();

            throw ValidationException::withMessages([
                'code' => 'Code expiré, veuillez recommencer.',
            ]);
        }

        if ($challenge->attempts >= 5) {
            \Log::warning('MFA Challenge too many attempts', ['challenge_id' => $data['challenge_id']]);
            $challenge->delete();

            throw ValidationException::withMessages([
                'code' => 'Trop de tentatives. Veuillez vous reconnecter.',
            ]);
        }

        // Vérifier le code
        if (!$challenge->matchesCode($data['code'])) {
            $challenge->increment('attempts');
            \Log::warning('MFA Code incorrect', [
                'challenge_id' => $data['challenge_id'],
                'attempts' => $challenge->attempts,
            ]);

            throw ValidationException::withMessages([
                'code' => 'Code incorrect.',
            ]);
        }

        $user = $challenge->mfaable;

        DB::transaction(function () use ($challenge, $user) {
            $challenge->markConsumed();
            $user->twoFactorChallenges()
                ->where('id', '!=', $challenge->id)
                ->delete();
        });

        $token = $user->createToken($this->resolveTokenName($user))->plainTextToken;
        $userType = $this->resolveUserType($user);

        \Log::info('MFA Verification successful', [
            'user_type' => $userType,
            'user_id' => $user->id,
        ]);

        return response()->json([
            'token' => $token,
            'type' => $userType,
            'user' => $user,
        ]);
    }

    private function resolveTokenName(object $user): string
    {
        return $this->resolveUserType($user) . '-token';
    }

    private function resolveUserType(object $user): string
    {
        return match (get_class($user)) {
            \App\Models\Admin::class => 'admin',
            \App\Models\Client::class => 'client',
            \App\Models\Manager::class => 'manager',
            \App\Models\Rh::class => 'rh',
            \App\Models\Comptable::class => 'comptable',
            \App\Models\Consultant::class => 'consultant',
            default => 'user',
        };
    }
}


