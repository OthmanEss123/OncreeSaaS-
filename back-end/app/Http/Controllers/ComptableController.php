<?php

namespace App\Http\Controllers;

use App\Models\Comptable;
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
}
