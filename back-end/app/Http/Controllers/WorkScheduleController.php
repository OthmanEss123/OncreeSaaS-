<?php

namespace App\Http\Controllers;

use App\Models\WorkSchedule;
use App\Models\CraSignature;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Mail;

class WorkScheduleController extends Controller
{
    public function index() { 
        return WorkSchedule::with(['consultant.client', 'workType', 'leaveType'])->get(); 
    }
    
    /**
     * Récupère les work schedules du consultant connecté uniquement
     * Retourne les données avec date, period et selected_days pour le calendrier
     */
    public function mySchedules(Request $request)
    {
        $consultant = $request->user();
        $schedules = WorkSchedule::where('consultant_id', $consultant->id)
            ->select('id', 'date', 'period', 'selected_days', 'work_type_selected_days', 'leave_type_selected_days', 'work_type_id', 'leave_type_id', 'notes')
            ->orderBy('date', 'desc')
            ->orderBy('period', 'asc')
            ->get()
            ->map(function ($schedule) {
                return [
                    'id' => $schedule->id,
                    'date' => $schedule->date->format('Y-m-d'),
                    'period' => $schedule->period,
                    'selected_days' => $schedule->selected_days, // Retourner les jours sélectionnés
                    'work_type_selected_days' => $schedule->work_type_selected_days, // Jours sélectionnés pour types de travail
                    'leave_type_selected_days' => $schedule->leave_type_selected_days, // Jours sélectionnés pour congés
                    'work_type_id' => $schedule->work_type_id,
                    'leave_type_id' => $schedule->leave_type_id
                ];
            });
            
        return response()->json([
            'success' => true,
            'data' => $schedules
        ]);
    }

    /**
     * Récupère les données de travail groupées par mois pour le consultant connecté
     */
    public function getWorkLogsGroupedByMonth(Request $request)
    {
        $consultant = $request->user();
        
        // Récupérer tous les work schedules du consultant
        $schedules = WorkSchedule::where('consultant_id', $consultant->id)
            ->with(['workType', 'leaveType'])
            ->orderBy('year', 'desc')
            ->orderBy('month', 'desc')
            ->get();

        // Grouper par mois en utilisant les champs month et year
        $groupedData = $schedules->groupBy(function ($schedule) {
            // Utiliser directement les valeurs de month et year
            return $schedule->year . '-' . str_pad($schedule->month, 2, '0', STR_PAD_LEFT);
        });

        $result = [];
        
        foreach ($groupedData as $monthKey => $monthSchedules) {
            $firstSchedule = $monthSchedules->first();
            // Créer le nom du mois à partir de month et year
            $monthName = \Carbon\Carbon::create($firstSchedule->year, $firstSchedule->month, 1)
                ->locale('fr')
                ->isoFormat('MMMM YYYY');
            
            // Calculer les totaux pour le mois
            $totalDaysWorked = $monthSchedules->sum('days_worked');
            $totalWeekendWork = $monthSchedules->sum('weekend_worked'); // Somme des jours de week-end travaillés
            $totalAbsences = $monthSchedules->sum('absence_days');
            $totalWorkTypeDays = $monthSchedules->sum('work_type_days');
            
            // Collecter les types d'absence et de travail
            $absenceTypes = $monthSchedules->whereNotNull('leave_type_id')
                ->pluck('leaveType.name')
                ->unique()
                ->filter()
                ->values()
                ->toArray();
                
            $workTypes = $monthSchedules->whereNotNull('workType.name')
                ->pluck('workType.name')
                ->unique()
                ->filter()
                ->values()
                ->toArray();

            $result[] = [
                'id' => $monthKey,
                'month' => $firstSchedule->month, // Valeur du mois (1-12)
                'year' => $firstSchedule->year,    // Valeur de l'année
                'monthName' => $monthName,         // Nom formaté du mois
                'daysWorked' => round($totalDaysWorked, 1),
                'weekendWork' => round($totalWeekendWork, 1),
                'absences' => round($totalAbsences, 1),
                'workTypeDays' => round($totalWorkTypeDays, 1),
                'absenceType' => implode(', ', $absenceTypes) ?: null,
                'workType' => implode(', ', $workTypes) ?: null,
                'details' => $monthSchedules->map(function ($schedule) use ($consultant) {
                    // Décoder les notes une seule fois
                    $notes = $schedule->notes ? json_decode($schedule->notes, true) : [];
                    
                    // Calculer le total des frais de déplacement
                    $travelExpensesTotal = 0;
                    if (isset($notes['travelExpenses'])) {
                        if (is_array($notes['travelExpenses'])) {
                            // Si c'est un array de dépenses, calculer la somme
                            $travelExpensesTotal = array_reduce($notes['travelExpenses'], function($carry, $expense) {
                                return $carry + ($expense['amount'] ?? 0);
                            }, 0);
                        } else {
                            // Si c'est déjà un nombre
                            $travelExpensesTotal = (float) $notes['travelExpenses'];
                        }
                    }
                    
                    return [
                        'id' => $schedule->id,
                        'date' => $schedule->date,
                        'period' => $schedule->period ?? 'morning',
                        'month' => $schedule->month,
                        'year' => $schedule->year,
                        'daysWorked' => $schedule->days_worked ?? 0,
                        'workDescription' => $notes['description'] ?? $notes['task'] ?? 'Travail enregistré',
                        'additionalCharges' => $travelExpensesTotal,
                        'totalCost' => (($schedule->days_worked ?? 0) * ($consultant->daily_rate ?? 450)) + $travelExpensesTotal,
                        'weekendWork' => $schedule->weekend_worked ?? 0,
                        'absences' => $schedule->absence_days ?? 0,
                        'workTypeDays' => $schedule->work_type_days ?? 0,
                        'absenceType' => $schedule->leaveType?->name,
                        'workType' => $schedule->workType?->name
                    ];
                })->toArray()
            ];
        }

        return response()->json([
            'success' => true,
            'data' => $result
        ]);
    }

    public function store(Request $request) {
        $data = $request->validate([
            'consultant_id' => 'sometimes|exists:consultants,id',
            'date'          => 'required|date',
            'period'        => 'nullable|in:morning,evening', // MODIFIÉ: nullable pour les entrées mensuelles
            'notes'         => 'nullable|string',
            'selected_days' => 'nullable|json', // NOUVEAU: liste des jours sélectionnés avec leurs périodes
            'work_type_selected_days' => 'nullable|json', // NOUVEAU: jours sélectionnés pour types de travail
            'leave_type_selected_days' => 'nullable|json', // NOUVEAU: jours sélectionnés pour congés
            'days_worked'   => 'nullable|numeric|min:0|max:62', // 31 jours × 2 périodes max
            'work_type_days' => 'nullable|numeric|min:0|max:62',
            'weekend_worked' => 'nullable|numeric|min:0|max:31',
            'absence_type'  => 'nullable|in:none,vacation,sick,personal,other',
            'absence_days'  => 'nullable|numeric|min:0|max:7',
            'month'         => 'nullable|integer|min:1|max:12',
            'year'          => 'nullable|integer|min:2020|max:2030',
            'work_type_id'  => 'nullable|exists:work_types,id',
            'leave_type_id' => 'nullable|exists:leave_types,id',
        ], [
            'days_worked.max' => 'Le nombre de jours travaillés ne peut pas dépasser 62 (31 jours × 2 périodes maximum)',
            'work_type_days.max' => 'Le nombre de jours de type de travail ne peut pas dépasser 62 (31 jours × 2 périodes maximum)',
        ]);
        
        // Validation personnalisée pour les jours travaillés
        if (isset($data['days_worked']) && $data['days_worked'] > 62) {
            return response()->json([
                'success' => false,
                'message' => 'Le nombre de jours travaillés ne peut pas dépasser 62 (31 jours × 2 périodes maximum)',
                'errors' => ['days_worked' => ['Le nombre de jours travaillés ne peut pas dépasser 62 (31 jours × 2 périodes maximum)']]
            ], 422);
        }
        
        // Si consultant_id n'est pas fourni et que l'utilisateur est authentifié,
        // utiliser l'ID du consultant connecté
        if (!isset($data['consultant_id']) && $request->user()) {
            $data['consultant_id'] = $request->user()->id;
        }
        
        // Auto-remplir month et year si pas fournis
        if (isset($data['date'])) {
            $date = \Carbon\Carbon::parse($data['date']);
            $data['month'] = $data['month'] ?? $date->month;
            $data['year'] = $data['year'] ?? $date->year;
        }
        
        // Utiliser updateOrCreate avec une logique adaptée
        // Si period est fourni : utiliser consultant_id + date + period (entrées par période)
        // Si period est null : utiliser consultant_id + date (entrées mensuelles)
        return WorkSchedule::updateOrCreate(
            [
                'consultant_id' => $data['consultant_id'],
                'date' => $data['date'],
                'period' => $data['period'] ?? null
            ],
            $data
        );
    }

    public function show(WorkSchedule $workSchedule) { return $workSchedule->load('consultant'); }

    public function update(Request $request, WorkSchedule $workSchedule) {
        $data = $request->validate([
            'consultant_id' => 'sometimes|exists:consultants,id',
            'date'          => 'sometimes|date',
            'period'        => 'nullable|in:morning,evening',
            'notes'         => 'nullable|string',
            'selected_days' => 'nullable|json', // NOUVEAU: permettre de modifier les jours sélectionnés
            'work_type_selected_days' => 'nullable|json', // NOUVEAU: jours sélectionnés pour types de travail
            'leave_type_selected_days' => 'nullable|json', // NOUVEAU: jours sélectionnés pour congés
            'days_worked'   => 'nullable|numeric|min:0|max:62', // 31 jours × 2 périodes max
            'work_type_days' => 'nullable|numeric|min:0|max:62',
            'weekend_worked' => 'nullable|numeric|min:0|max:31',
            'absence_type'  => 'nullable|in:none,vacation,sick,personal,other',
            'absence_days'  => 'nullable|numeric|min:0|max:7',
            'month'         => 'nullable|integer|min:1|max:12',
            'year'          => 'nullable|integer|min:2020|max:2030',
            'work_type_id'  => 'nullable|exists:work_types,id',
            'leave_type_id' => 'nullable|exists:leave_types,id',
        ], [
            'days_worked.max' => 'Le nombre de jours travaillés ne peut pas dépasser 62 (31 jours × 2 périodes maximum)',
            'work_type_days.max' => 'Le nombre de jours de type de travail ne peut pas dépasser 62 (31 jours × 2 périodes maximum)',
        ]);
        
        // Auto-remplir month et year si date est modifiée
        if (isset($data['date'])) {
            $date = \Carbon\Carbon::parse($data['date']);
            $data['month'] = $data['month'] ?? $date->month;
            $data['year'] = $data['year'] ?? $date->year;
        }
        
        $workSchedule->update($data);
        return $workSchedule;
    }

    public function destroy(WorkSchedule $workSchedule) {
        $workSchedule->delete();
        return response()->noContent();
    }

    /**
     * Générer et envoyer le rapport mensuel en PDF au client
     */
    public function sendMonthlyReportToClient(Request $request)
    {
        $request->validate([
            'month' => 'required|integer|min:1|max:12',
            'year' => 'required|integer|min:2020|max:2030'
        ]);

        $consultant = $request->user();
        $month = $request->month;
        $year = $request->year;

        // Récupérer le projet et le client du consultant
        $project = $consultant->project()->with('client')->first();
        
        if (!$project || !$project->client) {
            return response()->json([
                'success' => false,
                'message' => 'Aucun projet ou client associé trouvé'
            ], 404);
        }

        $client = $project->client;
        $clientEmail = $client->contact_email;

        if (!$clientEmail) {
            return response()->json([
                'success' => false,
                'message' => 'Email du client non trouvé'
            ], 404);
        }

        // Récupérer les données du mois
        $schedules = WorkSchedule::where('consultant_id', $consultant->id)
            ->where('month', $month)
            ->where('year', $year)
            ->with(['workType', 'leaveType'])
            ->orderBy('date', 'asc')
            ->get();

        if ($schedules->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'Aucune donnée trouvée pour ce mois'
            ], 404);
        }

        // Préparer les données pour le PDF
        $monthName = \Carbon\Carbon::create($year, $month, 1)->locale('fr')->isoFormat('MMMM YYYY');
        
        $totalDaysWorked = $schedules->sum('days_worked');
        $totalWeekendWork = $schedules->sum('weekend_worked');
        $totalAbsences = $schedules->sum('absence_days');
        $totalWorkTypeDays = $schedules->sum('work_type_days');
        
        // Calculer le total des frais
        $totalExpenses = 0;
        $schedules->each(function($schedule) use (&$totalExpenses) {
            $notes = $schedule->notes ? json_decode($schedule->notes, true) : [];
            if (isset($notes['travelExpenses'])) {
                if (is_array($notes['travelExpenses'])) {
                    $totalExpenses += array_reduce($notes['travelExpenses'], function($carry, $expense) {
                        return $carry + ($expense['amount'] ?? 0);
                    }, 0);
                } else {
                    $totalExpenses += (float) $notes['travelExpenses'];
                }
            }
        });

        $totalCost = ($totalDaysWorked * $consultant->daily_rate) + $totalExpenses;

        // Collecter les types
        $absenceTypes = $schedules->whereNotNull('leave_type_id')
            ->pluck('leaveType.name')
            ->unique()
            ->filter()
            ->implode(', ');
            
        $workTypes = $schedules->whereNotNull('workType.name')
            ->pluck('workType.name')
            ->unique()
            ->filter()
            ->implode(', ');

        $data = [
            'consultant' => $consultant,
            'client' => $client,
            'project' => $project,
            'monthName' => $monthName,
            'month' => $month,
            'year' => $year,
            'schedules' => $schedules,
            'totalDaysWorked' => round($totalDaysWorked, 1),
            'totalWeekendWork' => round($totalWeekendWork, 1),
            'totalAbsences' => round($totalAbsences, 1),
            'totalWorkTypeDays' => round($totalWorkTypeDays, 1),
            'totalExpenses' => round($totalExpenses, 2),
            'totalCost' => round($totalCost, 2),
            'absenceTypes' => $absenceTypes,
            'workTypes' => $workTypes
        ];

        // Générer le PDF
        $pdf = Pdf::loadView('emails.monthly-report', $data);
        
        // Envoyer l'email
        try {
            Mail::send('emails.monthly-report-email', $data, function ($message) use ($clientEmail, $consultant, $monthName, $pdf) {
                $message->to($clientEmail)
                    ->subject("Rapport de travail - {$consultant->name} - {$monthName}")
                    ->attachData($pdf->output(), "rapport_{$monthName}.pdf");
            });

            return response()->json([
                'success' => true,
                'message' => "Rapport envoyé avec succès à {$clientEmail}"
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'envoi de l\'email: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Signer un CRA mensuel
     */
    public function signCRA(Request $request)
    {
        $request->validate([
            'month' => 'required|integer|min:1|max:12',
            'year' => 'required|integer|min:2020|max:2030',
            'signature_data' => 'required|string'
        ]);

        $consultant = $request->user();
        $month = $request->month;
        $year = $request->year;

        // Vérifier si une signature existe déjà pour ce mois/année
        $existingSignature = CraSignature::where('consultant_id', $consultant->id)
            ->where('month', $month)
            ->where('year', $year)
            ->first();

        if ($existingSignature) {
            return response()->json([
                'success' => false,
                'message' => 'Ce CRA a déjà été signé'
            ], 400);
        }

        // Créer la signature
        $signature = CraSignature::create([
            'consultant_id' => $consultant->id,
            'month' => $month,
            'year' => $year,
            'signature_data' => $request->signature_data,
            'signed_at' => now()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'CRA signé avec succès',
            'data' => [
                'signature' => $signature,
                'signed_at' => $signature->signed_at
            ]
        ]);
    }

    /**
     * Vérifier si un CRA est signé
     */
    public function checkCRASignature(Request $request)
    {
        $request->validate([
            'month' => 'required|integer|min:1|max:12',
            'year' => 'required|integer|min:2020|max:2030'
        ]);

        $consultant = $request->user();
        $month = $request->month;
        $year = $request->year;

        $signature = CraSignature::where('consultant_id', $consultant->id)
            ->where('month', $month)
            ->where('year', $year)
            ->first();

        return response()->json([
            'success' => true,
            'is_signed' => $signature !== null,
            'signature' => $signature ? [
                'signed_at' => $signature->signed_at,
                'created_at' => $signature->created_at
            ] : null
        ]);
    }
}
