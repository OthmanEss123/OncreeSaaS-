<?php

namespace App\Http\Controllers;

use App\Models\Facture;
use Illuminate\Http\Request;

class FactureController extends Controller
{
    public function index() { return Facture::with(['client','consultant','quote'])->get(); }

    public function store(Request $request) {
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
        return Facture::create($data);
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
