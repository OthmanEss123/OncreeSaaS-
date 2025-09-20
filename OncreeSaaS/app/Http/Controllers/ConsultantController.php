<?php

namespace App\Http\Controllers;

use App\Models\Consultant;
use Illuminate\Http\Request;

class ConsultantController extends Controller
{
    public function index()
    {
        return Consultant::with('user')->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'user_id'       => 'required|exists:users,id',
            'contract_type' => 'nullable|string|max:255',
            'tjm'           => 'nullable|numeric',
            'availability'  => 'boolean',
        ]);

        return Consultant::create($request->all());
    }

    
    public function show(Consultant $consultant)
    {
        return $consultant->load('user');
    }

    public function update(Request $request, Consultant $consultant)
    {
        $request->validate([
            'contract_type' => 'sometimes|string|max:255',
            'tjm'           => 'sometimes|numeric',
            'availability'  => 'sometimes|boolean',
        ]);

        $consultant->update($request->all());
        return $consultant;
    }

    public function destroy(Consultant $consultant)
    {
        $consultant->delete();
        return response()->noContent();
    }
}
