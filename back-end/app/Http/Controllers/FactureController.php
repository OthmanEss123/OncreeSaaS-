<?php

namespace App\Http\Controllers;

use App\Models\Facture;
use Illuminate\Http\Request;

class FactureController extends Controller
{
    public function index() { return Facture::with(['client','consultant','quote'])->get(); }

    public function store(Request $request) {
        try {
            $data = $request->validate([
                'client_id'        => 'required|exists:clients,id',
                'consultant_id'    => 'nullable|exists:consultants,id',
                'quote_id'         => 'nullable|exists:quotes,id',
                'created_by_manager'=> 'nullable|exists:managers,id',
                'facture_date'     => 'required|date',
                'due_date'         => 'nullable|date|after_or_equal:facture_date',
                'status'           => 'nullable|in:draft,sent,paid,cancelled',
                'total'            => 'nullable|numeric',
            ]);
            
            $facture = Facture::create($data);
            return response()->json($facture->load(['client', 'consultant']), 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Erreur de validation',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Erreur lors de la création de la facture: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erreur lors de la création de la facture',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show(Facture $facture) { return $facture->load(['client','consultant','quote']); }

    public function update(Request $request, Facture $facture) {
        $data = $request->validate([
            'client_id'        => 'sometimes|exists:clients,id',
            'consultant_id'    => 'nullable|exists:consultants,id',
            'quote_id'         => 'nullable|exists:quotes,id',
            'created_by_manager'=> 'nullable|exists:managers,id',
            'facture_date'     => 'sometimes|date',
            'due_date'         => 'nullable|date|after_or_equal:facture_date',
            'status'           => 'nullable|in:draft,sent,paid,cancelled',
            'total'            => 'nullable|numeric',
        ]);
        $facture->update($data);
        return $facture;
    }

    public function destroy(Facture $facture) {
        $facture->delete();
        return response()->noContent();
    }
}
