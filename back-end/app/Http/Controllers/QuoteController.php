<?php

namespace App\Http\Controllers;

use App\Models\Quote;
use Illuminate\Http\Request;

class QuoteController extends Controller
{
    public function index() { return Quote::with(['client','project'])->get(); }

    public function store(Request $request) {
        $data = $request->validate([
            'client_id'  => 'required|exists:clients,id',
            'project_id' => 'nullable|exists:projects,id',
            'amount'     => 'required|numeric',
            'status'     => 'nullable|in:draft,sent,accepted,rejected',
        ]);
        return Quote::create($data);
    }

    public function show(Quote $quote) { return $quote->load(['client','project']); }

    public function update(Request $request, Quote $quote) {
        $data = $request->validate([
            'client_id'  => 'sometimes|exists:clients,id',
            'project_id' => 'nullable|exists:projects,id',
            'amount'     => 'sometimes|numeric',
            'status'     => 'nullable|in:draft,sent,accepted,rejected',
        ]);
        $quote->update($data);
        return $quote;
    }

    public function destroy(Quote $quote) {
        $quote->delete();
        return response()->noContent();
    }
}
