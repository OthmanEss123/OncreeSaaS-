<?php

namespace App\Http\Controllers;

use App\Models\Absence;
use Illuminate\Http\Request;

class AbsenceController extends Controller
{
    public function index()
    {
        return Absence::with('consultant')->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'consultant_id' => 'required|exists:consultants,id',
            'type'          => 'required|in:vacation,sick,other',
            'start_date'    => 'required|date',
            'end_date'      => 'required|date|after_or_equal:start_date',
            'status'        => 'in:pending,approved,rejected',
        ]);

        return Absence::create($request->all());
    }

    public function show(Absence $absence)
    {
        return $absence->load('consultant');
    }

    public function update(Request $request, Absence $absence)
    {
        $request->validate([
            'type'       => 'sometimes|in:vacation,sick,other',
            'start_date' => 'sometimes|date',
            'end_date'   => 'sometimes|date|after_or_equal:start_date',
            'status'     => 'sometimes|in:pending,approved,rejected',
        ]);

        $absence->update($request->all());
        return $absence;
    }

    public function destroy(Absence $absence)
    {
        $absence->delete();
        return response()->noContent();
    }
}
