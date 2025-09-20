<?php

namespace App\Http\Controllers;

use App\Models\Quote;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class QuoteController extends Controller
{
    // GET /api/quotes  (filtres optionnels)
    public function index(Request $request)
    {
        $q = Quote::with(['client','mission']);

        if ($request->filled('client_id'))  $q->where('client_id',  $request->client_id);
        if ($request->filled('mission_id')) $q->where('mission_id', $request->mission_id);
        if ($request->filled('status'))     $q->where('status',     $request->status); // brouillon/envoyé/accepté/rejeté
        if ($request->filled('from'))       $q->whereDate('created_at', '>=', $request->from);
        if ($request->filled('to'))         $q->whereDate('created_at', '<=', $request->to);

        return $q->orderByDesc('id')->get();
    }

    // POST /api/quotes
    public function store(Request $request)
    {
        $data = $request->validate([
            'client_id'  => ['required', 'exists:clients,id'],
            'mission_id' => ['nullable', 'exists:missions,id'],
            'amount'     => ['required', 'numeric', 'min:0'],
            'status'     => ['nullable', Rule::in(['draft','sent','accepted','rejected'])],
        ]);

        $data['status'] = $data['status'] ?? 'draft';

        $quote = Quote::create($data);
        return $quote->load(['client','mission']);
    }

    // GET /api/quotes/{quote}
    public function show(Quote $quote)
    {
        return $quote->load(['client','mission']);
    }

    // PUT/PATCH /api/quotes/{quote}
    public function update(Request $request, Quote $quote)
    {
        $data = $request->validate([
            'client_id'  => ['sometimes', 'exists:clients,id'],
            'mission_id' => ['sometimes', 'nullable', 'exists:missions,id'],
            'amount'     => ['sometimes', 'numeric', 'min:0'],
            'status'     => ['sometimes', Rule::in(['draft','sent','accepted','rejected'])],
        ]);

        // Empêcher la modification du devis après acceptation ou rejet (optionnel)
        if ($quote->status === 'accepted' || $quote->status === 'rejected') {
            unset($data['amount']); // Nous ne changeons pas le montant après la décision
        }

        $quote->update($data);
        return $quote->load(['client','mission']);
    }

    // DELETE /api/quotes/{quote}
    public function destroy(Quote $quote)
    {
        $quote->delete();
        return response()->noContent();
    }

    // PATCH /api/quotes/{quote}/status  (changer le statut rapidement)
    public function changeStatus(Request $request, Quote $quote)
    {
        $request->validate([
            'status' => ['required', Rule::in(['draft','sent','accepted','rejected'])],
        ]);

        // Exemples de contraintes de cycle de vie
        if ($quote->status === 'accepted' && $request->status !== 'accepted') {
            return response()->json(['message' => 'Le devis déjà accepté ne peut pas changer de statut.'], 422);
        }

        $quote->status = $request->status;
        $quote->save();

        return $quote->load(['client','mission']);
    }
}
