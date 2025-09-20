<?php

namespace App\Http\Controllers;

use App\Models\Prospect;
use Illuminate\Http\Request;

class ProspectController extends Controller
{
    // GET /api/prospects
    public function index()
    {
        return Prospect::all();
    }

    // POST /api/prospects
    public function store(Request $request)
    {
        $request->validate([
            'company_name' => 'required|string|max:255',
            'contact_name' => 'nullable|string|max:255',
            'email'        => 'nullable|email',
            'phone'        => 'nullable|string|max:20',
            'status'       => 'nullable|in:new,contacted,converted',
        ]);

        return Prospect::create($request->all());
    }

    // GET /api/prospects/{prospect}
    public function show(Prospect $prospect)
    {
        return $prospect;
    }

    // PUT/PATCH /api/prospects/{prospect}
    public function update(Request $request, Prospect $prospect)
    {
        $request->validate([
            'company_name' => 'sometimes|string|max:255',
            'contact_name' => 'sometimes|string|max:255',
            'email'        => 'sometimes|email|unique:prospects,email,' . $prospect->id,
            'phone'        => 'sometimes|string|max:20',
            'status'       => 'sometimes|in:new,contacted,converted',
        ]);

        $prospect->update($request->all());
        return $prospect;
    }

    // DELETE /api/prospects/{prospect}
    public function destroy(Prospect $prospect)
    {
        $prospect->delete();
        return response()->noContent();
    }
}
