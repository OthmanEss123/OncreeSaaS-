<?php

namespace App\Http\Controllers;

use App\Models\FactureItem;
use Illuminate\Http\Request;

class FactureItemController extends Controller
{
    public function index() { 
        return FactureItem::all(); 
    }

    public function store(Request $request) {
        $data = $request->validate([
            'facture_id'    => 'required|exists:factures,id',
            'description'   => 'required|string',
            'quantity'     => 'required|numeric|min:0',
            'unit_price'   => 'required|numeric|min:0',
        ]);
        
        $item = FactureItem::create($data);
        return response()->json($item, 201);
    }

    public function show(FactureItem $factureItem) { 
        return $factureItem; 
    }

    public function update(Request $request, FactureItem $factureItem) {
        $data = $request->validate([
            'facture_id'    => 'sometimes|exists:factures,id',
            'description'   => 'sometimes|string',
            'quantity'     => 'sometimes|numeric|min:0',
            'unit_price'   => 'sometimes|numeric|min:0',
        ]);
        
        $factureItem->update($data);
        return $factureItem;
    }

    public function destroy(FactureItem $factureItem) {
        $factureItem->delete();
        return response()->noContent();
    }
}














































