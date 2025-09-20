<?php

namespace App\Http\Controllers;

use App\Models\Mission;
use Illuminate\Http\Request;

class MissionController extends Controller
{
    // GET /api/missions  (filtrable optionnellement)
    public function index(Request $request)
    {
        $q = Mission::with(['client','consultant.user','service']);

        // Filtres optionnels
        if ($request->filled('status')) {
            $q->where('status', $request->get('status')); // en_cours/terminé/annulé
        }
        if ($request->filled('client_id')) {
            $q->where('client_id', $request->get('client_id'));
        }
        if ($request->filled('consultant_id')) {
            $q->where('consultant_id', $request->get('consultant_id'));
        }
        if ($request->filled('from')) {
            $q->whereDate('start_date', '>=', $request->get('from'));
        }
        if ($request->filled('to')) {
            $q->whereDate('end_date', '<=', $request->get('to'));
        }

        return $q->orderByDesc('id')->get();
    }

    // POST /api/missions
    public function store(Request $request)
    {
        $data = $request->validate([
            'client_id'     => 'required|exists:clients,id',
            'consultant_id' => 'required|exists:consultants,id',
            'service_id'    => 'nullable|exists:services,id',
            'start_date'    => 'required|date',
            'end_date'      => 'nullable|date|after_or_equal:start_date',
            'status'        => 'nullable|in:ongoing,completed,cancelled',
        ]);

        $data['status'] = $data['status'] ?? 'ongoing';

        $mission = Mission::create($data);
        return $mission->load(['client','consultant.user','service']);
    }

    // GET /api/missions/{mission}
    public function show(Mission $mission)
    {
        return $mission->load(['client','consultant.user','service','timeTrackings']);
    }

    // PUT/PATCH /api/missions/{mission}
    public function update(Request $request, Mission $mission)
    {
        $data = $request->validate([
            'client_id'     => 'sometimes|exists:clients,id',
            'consultant_id' => 'sometimes|exists:consultants,id',
            'service_id'    => 'sometimes|nullable|exists:services,id',
            'start_date'    => 'sometimes|date',
            'end_date'      => 'sometimes|nullable|date|after_or_equal:start_date',
            'status'        => 'sometimes|in:ongoing,completed,cancelled',
        ]);

        $mission->update($data);
        return $mission->load(['client','consultant.user','service','timeTrackings']);
    }

    // DELETE /api/missions/{mission}
    public function destroy(Mission $mission)
    {
        $mission->delete();
        return response()->noContent();
    }
}
