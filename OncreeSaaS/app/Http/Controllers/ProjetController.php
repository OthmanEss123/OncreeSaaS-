<?php

namespace App\Http\Controllers;

use App\Models\Projet;
use Illuminate\Http\Request;

class ProjetController extends Controller
{
    /**
     * Liste de tous les projets
     */
    public function index()
    {
        return Projet::all();
    }

    /**
     * Créer un nouveau projet
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom_projet'    => 'required|string|max:255',
            'email'         => 'required|email|unique:projets,email',
            'telephone'     => 'required|string|max:50',
            'nom_contacteur'=> 'required|string|max:255',
        ]);

        $projet = Projet::create($validated);

        return response()->json($projet, 201);
    }

    /**
     * Afficher un projet précis
     */
    public function show(Projet $projet)
    {
        return $projet;
    }

    /**
     * Mettre à jour un projet
     */
    public function update(Request $request, Projet $projet)
    {
        $validated = $request->validate([
            'nom_projet'    => 'sometimes|string|max:255',
            'email'         => 'sometimes|email|unique:projets,email,' . $projet->id,
            'telephone'     => 'sometimes|string|max:50',
            'nom_contacteur'=> 'sometimes|string|max:255',
        ]);

        $projet->update($validated);

        return response()->json($projet, 200);
    }

    /**
     * Supprimer un projet
     */
    public function destroy(Projet $projet)
    {
        $projet->delete();

        return response()->json(null, 204);
    }
}
