<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AppointmentController extends Controller
{
    // GET /api/appointments  (filtres optionnels)
    public function index(Request $request)
    {
        $q = Appointment::with(['service','client','consultant.user']);

        if ($request->filled('status')) {
            $q->where('status', $request->get('status')); // en_attente/confirmé/terminé/annulé
        }
        if ($request->filled('client_id')) {
            $q->where('client_id', $request->get('client_id'));
        }
        if ($request->filled('consultant_id')) {
            $q->where('consultant_id', $request->get('consultant_id'));
        }
        if ($request->filled('from')) {
            $q->where('date', '>=', $request->get('from'));
        }
        if ($request->filled('to')) {
            $q->where('date', '<=', $request->get('to'));
        }

        return $q->orderByDesc('date')->get();
    }

    // POST /api/appointments
    public function store(Request $request)
    {
        $data = $request->validate([
            'service_id'    => ['required','exists:services,id'],
            'client_id'     => ['required','exists:clients,id'],
            'consultant_id' => ['nullable','exists:consultants,id'],
            'status'        => ['nullable', Rule::in(['pending','confirmed','completed','cancelled'])],
            'date'          => ['required','date'],
            'notes'         => ['nullable','string'],
        ]);

        $data['status'] = $data['status'] ?? 'pending';

        // Vérification simple : empêcher les conflits de rendez-vous pour le même consultant (sauf si spécifié)
        if (!empty($data['consultant_id'])) {
            $conflict = Appointment::where('consultant_id', $data['consultant_id'])
                ->where('date', $data['date'])
                ->whereIn('status', ['pending','confirmed'])
                ->exists();

            if ($conflict) {
                return response()->json([
                    'message' => 'Consultant déjà occupé à ce créneau.'
                ], 422);
            }
        }

        $appt = Appointment::create($data);
        return $appt->load(['service','client','consultant.user']);
    }

    // GET /api/appointments/{appointment}
    public function show(Appointment $appointment)
    {
        return $appointment->load(['service','client','consultant.user']);
    }

    // PUT/PATCH /api/appointments/{appointment}
    public function update(Request $request, Appointment $appointment)
    {
        $data = $request->validate([
            'service_id'    => ['sometimes','exists:services,id'],
            'client_id'     => ['sometimes','exists:clients,id'],
            'consultant_id' => ['sometimes','nullable','exists:consultants,id'],
            'status'        => ['sometimes', Rule::in(['pending','confirmed','completed','cancelled'])],
            'date'          => ['sometimes','date'],
            'notes'         => ['nullable','string'],
        ]);

        // Vérifier le conflit si nous changeons consultant ou date
        if (array_key_exists('consultant_id', $data) || array_key_exists('date', $data)) {
            $consultantId = $data['consultant_id'] ?? $appointment->consultant_id;
            $date         = $data['date'] ?? $appointment->date;

            if (!empty($consultantId)) {
                $conflict = Appointment::where('consultant_id', $consultantId)
                    ->where('date', $date)
                    ->where('id', '<>', $appointment->id)
                    ->whereIn('status', ['pending','confirmed'])
                    ->exists();

                if ($conflict) {
                    return response()->json([
                        'message' => 'Conflit d\'horaire : consultant déjà réservé.'
                    ], 422);
                }
            }
        }

        $appointment->update($data);
        return $appointment->load(['service','client','consultant.user']);
    }

    // DELETE /api/appointments/{appointment}
    public function destroy(Appointment $appointment)
    {
        $appointment->delete();
        return response()->noContent();
    }

    // PATCH /api/appointments/{appointment}/status  (changer le statut)
    public function changeStatus(Request $request, Appointment $appointment)
    {
        $request->validate([
            'status' => ['required', Rule::in(['pending','confirmed','completed','cancelled'])],
        ]);

        // Exemple simple de cycle de vie : ne pas passer de annulé à terminé
        if ($appointment->status === 'cancelled' && $request->status === 'completed') {
            return response()->json([
                'message' => 'Transition de statut invalide (annulé → terminé).'
            ], 422);
        }

        $appointment->status = $request->status;
        $appointment->save();

        return $appointment->load(['service','client','consultant.user']);
    }
}
