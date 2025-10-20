<?php

namespace App\Http\Controllers;

use App\Models\Assignment;
use Illuminate\Http\Request;

class AssignmentController extends Controller
{
    public function index() { return Assignment::with(['consultant','project'])->get(); }

    public function store(Request $request) {
        $data = $request->validate([
            'consultant_id' => 'required|exists:consultants,id',
            'project_id'    => 'required|exists:projects,id',
            'start_date'    => 'required|date',
            'end_date'      => 'nullable|date|after_or_equal:start_date',
        ]);
        return Assignment::create($data);
    }

    public function show(Assignment $assignment) { return $assignment->load(['consultant','project']); }

    public function update(Request $request, Assignment $assignment) {
        $data = $request->validate([
            'consultant_id' => 'sometimes|exists:consultants,id',
            'project_id'    => 'sometimes|exists:projects,id',
            'start_date'    => 'sometimes|date',
            'end_date'      => 'nullable|date|after_or_equal:start_date',
        ]);
        $assignment->update($data);
        return $assignment;
    }

    public function destroy(Assignment $assignment) {
        $assignment->delete();
        return response()->noContent();
    }
}
