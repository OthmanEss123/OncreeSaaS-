<?php

namespace App\Http\Controllers;

use App\Models\TimeTracking;
use Illuminate\Http\Request;

class TimeTrackingController extends Controller
{
    // GET /api/time-tracking
    public function index()
    {
        return TimeTracking::with(['mission', 'consultant'])->get();
    }

    // POST /api/time-tracking
    public function store(Request $request)
    {
        $request->validate([
            'mission_id'    => 'required|exists:missions,id',
            'consultant_id' => 'required|exists:consultants,id',
            'hours'         => 'required|numeric|min:0',
            'date'          => 'required|date',
            'notes'         => 'nullable|string',
        ]);

        return TimeTracking::create($request->all());
    }

    // GET /api/time-tracking/{id}
    public function show(TimeTracking $timeTracking)
    {
        return $timeTracking->load(['mission', 'consultant']);
    }

    // PUT/PATCH /api/time-tracking/{id}
    public function update(Request $request, TimeTracking $timeTracking)
    {
        $request->validate([
            'hours' => 'sometimes|numeric|min:0',
            'date'  => 'sometimes|date',
            'notes' => 'nullable|string',
        ]);

        $timeTracking->update($request->all());
        return $timeTracking;
    }

    // DELETE /api/time-tracking/{id}
    public function destroy(TimeTracking $timeTracking)
    {
        $timeTracking->delete();
        return response()->noContent();
    }
}
