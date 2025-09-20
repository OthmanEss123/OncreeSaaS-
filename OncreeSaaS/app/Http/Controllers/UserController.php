<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    // Afficher tous les utilisateurs avec leur rôle
    public function index()
    {
        return User::with('role')->get();
    }

    // Créer un nouvel utilisateur
    public function store(Request $request)
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'role_id'  => 'required|exists:roles,id',
            'address'  => 'required|string|max:255',
        ]);

        $data = $request->all();
        $data['password'] = Hash::make($data['password']); // Chiffrer le mot de passe

        return User::create($data);
    }

    // Afficher un utilisateur
    public function show(User $user)
    {
        return $user->load('role');
    }

    // Modifier un utilisateur
    public function update(Request $request, User $user)
    {
        $request->validate([
            'name'     => 'sometimes|required|string|max:255',
            'email'    => 'sometimes|required|string|email|max:255|unique:users,email,' . $user->id,
            'password' => 'sometimes|string|min:6',
            'role_id'  => 'sometimes|required|exists:roles,id',
            'address'  => 'sometimes|string|max:255',
            'phone'    => 'sometimes|string|max:255',
        ]);

        $data = $request->only(['name', 'email', 'address', 'phone', 'role_id']);
        
        if ($request->has('password') && !empty($request->password)) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);
        return $user;
    }

    // Supprimer un utilisateur
    public function destroy(User $user)
    {
        $user->delete();
        return response()->noContent();
    }
    public function assignSkills(Request $request, User $user)
    {
        $request->validate([
            'skills' => 'required|array',
            'skills.*' => 'exists:skills,id',
        ]);
        $user->skills()->sync($request->skills);
        if ($request->has('skills') && $request->input('role_id') != 3) {
            return response()->json(['error' => 'Seuls les utilisateurs avec role_id=3 peuvent avoir des skills'], 403);
        }
        return $user;
    }
    public function getSkills(User $user)
    {
        return $user->skills;
    }

}