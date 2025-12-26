<?php

namespace App\Http\Controllers;

use App\Models\WorkSchedule;
use App\Models\CraSignature;
use App\Models\Consultant;
use App\Models\Client;
use App\Models\Manager;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

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
     * Gère les signatures pour consultant, client et manager
     */
    public function signCRA(Request $request)
    {
        try {
            $request->validate([
                'month' => 'required|integer|min:1|max:12',
                'year' => 'required|integer|min:2020|max:2030',
                'signature_data' => 'required|string',
                'consultant_id' => 'nullable|exists:consultants,id'
            ]);

            $user = $request->user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non authentifié'
                ], 401);
            }

            $month = $request->month;
            $year = $request->year;
            $signatureData = $request->signature_data;
            
            // Déterminer le consultant_id
            $consultantId = $request->consultant_id;
            
            // Si consultant_id n'est pas fourni, utiliser l'ID de l'utilisateur si c'est un consultant
            if (!$consultantId) {
                if ($user instanceof Consultant) {
                    $consultantId = $user->id;
                } else {
                    return response()->json([
                        'success' => false,
                        'message' => 'consultant_id requis pour signer le CRA'
                    ], 422);
                }
            }

            // Déterminer le type de signataire selon le type d'utilisateur
            $signatureField = null;
            $signedAtField = null;
            $signerIdField = null;
            
            if ($user instanceof Consultant) {
                $signatureField = 'consultant_signature_data';
                $signedAtField = 'consultant_signed_at';
                $signerIdField = 'consultant_signer_id';
            } elseif ($user instanceof Client) {
                $signatureField = 'client_signature_data';
                $signedAtField = 'client_signed_at';
                $signerIdField = 'client_signer_id';
            } elseif ($user instanceof Manager) {
                $signatureField = 'manager_signature_data';
                $signedAtField = 'manager_signed_at';
                $signerIdField = 'manager_signer_id';
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Type d\'utilisateur non autorisé pour signer'
                ], 403);
            }

            // Récupérer ou créer l'enregistrement de signature
            $craSignature = CraSignature::firstOrCreate(
                [
                    'consultant_id' => $consultantId,
                    'month' => $month,
                    'year' => $year
                ],
                [
                    'consultant_id' => $consultantId,
                    'month' => $month,
                    'year' => $year
                ]
            );

            // Mettre à jour la signature correspondante
            $updateData = [
                $signatureField => $signatureData,
                $signedAtField => now(),
                $signerIdField => $user->id
            ];

            // Si c'est un client, mettre à jour aussi client_id
            if ($user instanceof Client) {
                $updateData['client_id'] = $user->id;
            }
            
            // Si c'est un manager, mettre à jour aussi manager_id
            if ($user instanceof Manager) {
                $updateData['manager_id'] = $user->id;
            }

            $craSignature->update($updateData);
            
            // Recharger la signature depuis la base de données pour avoir les dernières données
            $craSignature->refresh();

            // Vérifier si toutes les signatures sont présentes pour envoyer le PDF
            $allSigned = $craSignature->consultant_signature_data 
                && $craSignature->client_signature_data 
                && $craSignature->manager_signature_data;

            if ($allSigned) {
                // Générer et envoyer le PDF par email
                try {
                    Log::info('Toutes les signatures sont présentes, envoi de l\'email CRA', [
                        'consultant_id' => $consultantId,
                        'month' => $month,
                        'year' => $year
                    ]);
                    $this->sendSignedCRAPDF($craSignature);
                } catch (\Exception $e) {
                    Log::error('Erreur lors de l\'envoi du PDF CRA', [
                        'consultant_id' => $consultantId,
                        'month' => $month,
                        'year' => $year,
                        'error' => $e->getMessage(),
                        'trace' => $e->getTraceAsString()
                    ]);
                    // Ne pas faire échouer la signature si l'envoi échoue
                }
            } else {
                Log::info('Toutes les signatures ne sont pas encore présentes', [
                    'consultant_id' => $consultantId,
                    'month' => $month,
                    'year' => $year,
                    'has_consultant' => !empty($craSignature->consultant_signature_data),
                    'has_client' => !empty($craSignature->client_signature_data),
                    'has_manager' => !empty($craSignature->manager_signature_data)
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Signature enregistrée avec succès',
                'data' => [
                    'signature' => $craSignature,
                    'all_signed' => $allSigned
                ]
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Erreur lors de la signature du CRA: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la signature: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Envoyer le PDF du CRA signé par email
     */
    private function sendSignedCRAPDF($craSignature)
    {
        // Recharger la signature avec les relations nécessaires
        $craSignature->load(['consultant.project.client', 'consultant.client', 'client']);
        
        $consultant = $craSignature->consultant;
        
        if (!$consultant) {
            throw new \Exception('Consultant non trouvé (consultant_id: ' . $craSignature->consultant_id . ')');
        }
        
        // Essayer de récupérer le client depuis plusieurs sources
        $client = null;
        $project = $consultant->project;
        
        // 1. D'abord depuis le client_id dans la signature CRA
        if ($craSignature->client_id && $craSignature->client) {
            $client = $craSignature->client;
        }
        // 2. Sinon depuis le projet
        elseif ($project && $project->client) {
            $client = $project->client;
        }
        // 3. Sinon depuis le consultant directement
        elseif ($consultant->client_id && $consultant->client) {
            $client = $consultant->client;
        }
        // 4. Dernier recours : charger le client depuis l'ID
        elseif ($craSignature->client_id) {
            $client = Client::find($craSignature->client_id);
        }
        elseif ($project && $project->client_id) {
            $client = Client::find($project->client_id);
        }
        elseif ($consultant->client_id) {
            $client = Client::find($consultant->client_id);
        }
        
        if (!$client) {
            throw new \Exception('Client non trouvé pour le CRA. consultant_id: ' . $consultant->id . ', project_id: ' . ($project ? $project->id : 'null') . ', cra_client_id: ' . ($craSignature->client_id ?? 'null'));
        }
        
        // Créer un objet projet virtuel si nécessaire
        if (!$project) {
            $project = (object)[
                'id' => null,
                'name' => 'Projet non défini',
                'client' => $client
            ];
        } else {
            // S'assurer que le projet a le client
            if (!$project->client) {
                $project->client = $client;
            }
        }

        // Récupérer les données du mois
        $schedules = WorkSchedule::where('consultant_id', $consultant->id)
            ->where('month', $craSignature->month)
            ->where('year', $craSignature->year)
            ->with(['workType', 'leaveType'])
            ->orderBy('date', 'asc')
            ->get();

        $monthName = \Carbon\Carbon::create($craSignature->year, $craSignature->month, 1)
            ->locale('fr')
            ->isoFormat('MMMM YYYY');

        // Préparer les données pour le PDF
        $totalDaysWorked = $schedules->sum('days_worked');
        $totalWeekendWork = $schedules->sum('weekend_worked');
        $totalAbsences = $schedules->sum('absence_days');
        $totalWorkTypeDays = $schedules->sum('work_type_days');

        // Collecter les types d'absence et de travail
        $absenceTypes = [];
        $workTypes = [];
        
        foreach ($schedules as $schedule) {
            if ($schedule->absence_type && $schedule->absence_type !== 'none') {
                if ($schedule->leaveType && $schedule->leaveType->name) {
                    if (!in_array($schedule->leaveType->name, $absenceTypes)) {
                        $absenceTypes[] = $schedule->leaveType->name;
                    }
                } elseif (!in_array($schedule->absence_type, $absenceTypes)) {
                    $absenceTypes[] = $schedule->absence_type;
                }
            }
            
            if ($schedule->workType && $schedule->workType->name) {
                if (!in_array($schedule->workType->name, $workTypes)) {
                    $workTypes[] = $schedule->workType->name;
                }
            }
        }

        // Préparer l'objet workLog pour les templates
        $workLog = (object) [
            'daysWorked' => round($totalDaysWorked, 1),
            'weekendWork' => round($totalWeekendWork, 1),
            'absences' => round($totalAbsences, 1),
            'workTypeDays' => round($totalWorkTypeDays, 1),
            'absenceType' => implode(', ', $absenceTypes),
            'workType' => implode(', ', $workTypes)
        ];

        // Préparer la structure des signatures pour les templates
        $signatures = [];
        
        if ($craSignature->consultant_signature_data && $craSignature->consultant_signed_at) {
            $signatures['consultant'] = [
                'signature_data' => $craSignature->consultant_signature_data,
                'signed_at' => $craSignature->consultant_signed_at
            ];
        }
        
        if ($craSignature->client_signature_data && $craSignature->client_signed_at) {
            $signatures['client'] = [
                'signature_data' => $craSignature->client_signature_data,
                'signed_at' => $craSignature->client_signed_at
            ];
        }
        
        if ($craSignature->manager_signature_data && $craSignature->manager_signed_at) {
            $signatures['manager'] = [
                'signature_data' => $craSignature->manager_signature_data,
                'signed_at' => $craSignature->manager_signed_at
            ];
        }

        $data = [
            'consultant' => $consultant,
            'client' => $project->client,
            'project' => $project,
            'monthName' => $monthName,
            'month' => $craSignature->month,
            'year' => $craSignature->year,
            'schedules' => $schedules,
            'totalDaysWorked' => round($totalDaysWorked, 1),
            'totalWeekendWork' => round($totalWeekendWork, 1),
            'totalAbsences' => round($totalAbsences, 1),
            'totalWorkTypeDays' => round($totalWorkTypeDays, 1),
            'workLog' => $workLog,
            'signatures' => $signatures,
            'craSignature' => $craSignature
        ];

        // Générer le PDF
        $pdf = Pdf::loadView('emails.signed-cra', $data);
        
        // Envoyer l'email
        try {
            $clientEmail = $project->client->contact_email;
            
            Log::info("Tentative d'envoi d'email CRA signé", [
                'consultant_id' => $consultant->id,
                'month' => $craSignature->month,
                'year' => $craSignature->year,
                'client_email' => $clientEmail
            ]);
            
            Mail::send('emails.signed-cra-email', $data, function ($message) use ($project, $consultant, $monthName, $pdf, $clientEmail) {
                $message->to($clientEmail)
                    ->subject("CRA Signé - {$consultant->name} - {$monthName}")
                    ->attachData($pdf->output(), "CRA_Signe_{$monthName}.pdf");
            });
            
            Log::info("Email CRA signé envoyé avec succès", [
                'consultant_id' => $consultant->id,
                'month' => $craSignature->month,
                'year' => $craSignature->year,
                'client_email' => $clientEmail
            ]);
        } catch (\Exception $e) {
            Log::error("Erreur lors de l'envoi de l'email CRA signé", [
                'consultant_id' => $consultant->id,
                'month' => $craSignature->month,
                'year' => $craSignature->year,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e; // Re-lancer l'exception pour que le catch parent puisse la gérer
        }
    }

    /**
     * Réenvoyer l'email du CRA signé
     */
    public function resendSignedCRAEmail(Request $request)
    {
        try {
            $request->validate([
                'month' => 'required|integer|min:1|max:12',
                'year' => 'required|integer|min:2020|max:2030',
                'consultant_id' => 'required|exists:consultants,id'
            ]);

            $month = $request->month;
            $year = $request->year;
            $consultantId = $request->consultant_id;

            $craSignature = CraSignature::where('consultant_id', $consultantId)
                ->where('month', $month)
                ->where('year', $year)
                ->first();

            if (!$craSignature) {
                return response()->json([
                    'success' => false,
                    'message' => 'CRA non trouvé pour cette période'
                ], 404);
            }

            // Vérifier que toutes les signatures sont présentes
            $allSigned = $craSignature->consultant_signature_data 
                && $craSignature->client_signature_data 
                && $craSignature->manager_signature_data;

            if (!$allSigned) {
                return response()->json([
                    'success' => false,
                    'message' => 'Toutes les signatures ne sont pas présentes. Email non envoyé.',
                    'signatures' => [
                        'consultant' => !empty($craSignature->consultant_signature_data),
                        'client' => !empty($craSignature->client_signature_data),
                        'manager' => !empty($craSignature->manager_signature_data)
                    ]
                ], 422);
            }

            // Réenvoyer l'email
            try {
                $this->sendSignedCRAPDF($craSignature);
                
                return response()->json([
                    'success' => true,
                    'message' => 'Email réenvoyé avec succès'
                ]);
            } catch (\Exception $e) {
                Log::error('Erreur lors de la réexpédition de l\'email CRA', [
                    'consultant_id' => $consultantId,
                    'month' => $month,
                    'year' => $year,
                    'error' => $e->getMessage()
                ]);
                
                return response()->json([
                    'success' => false,
                    'message' => 'Erreur lors de l\'envoi de l\'email: ' . $e->getMessage()
                ], 500);
            }

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Erreur lors de la réexpédition de l\'email CRA: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Vérifier si un CRA est signé pour un mois/année donné
     */
    public function checkCRASignature(Request $request)
    {
        try {
            $request->validate([
                'month' => 'required|integer|min:1|max:12',
                'year' => 'required|integer|min:2020|max:2030',
                'consultant_id' => 'nullable|exists:consultants,id'
            ]);

            $user = $request->user();
            $month = $request->month;
            $year = $request->year;
            $consultantId = $request->consultant_id ?? ($user instanceof Consultant ? $user->id : null);

            if (!$consultantId) {
                return response()->json([
                    'success' => false,
                    'message' => 'consultant_id requis'
                ], 422);
            }

            $craSignature = CraSignature::where('consultant_id', $consultantId)
                ->where('month', $month)
                ->where('year', $year)
                ->first();

            $isSigned = $craSignature && (
                $craSignature->consultant_signature_data ||
                $craSignature->client_signature_data ||
                $craSignature->manager_signature_data
            );

            return response()->json([
                'success' => true,
                'is_signed' => $isSigned,
                'signature' => $craSignature ? [
                    'consultant_signed_at' => $craSignature->consultant_signed_at?->toISOString(),
                    'client_signed_at' => $craSignature->client_signed_at?->toISOString(),
                    'manager_signed_at' => $craSignature->manager_signed_at?->toISOString(),
                    'created_at' => $craSignature->created_at->toISOString()
                ] : null
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur lors de la vérification de signature CRA: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la vérification: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Vérifier le statut détaillé des signatures pour un CRA
     */
    public function checkCRASignatureStatus(Request $request)
    {
        try {
            $request->validate([
                'month' => 'required|integer|min:1|max:12',
                'year' => 'required|integer|min:2020|max:2030',
                'consultant_id' => 'nullable|exists:consultants,id'
            ]);

            $user = $request->user();
            $month = $request->month;
            $year = $request->year;
            $consultantId = $request->consultant_id ?? ($user instanceof Consultant ? $user->id : null);

            if (!$consultantId) {
                return response()->json([
                    'success' => false,
                    'message' => 'consultant_id requis'
                ], 422);
            }

            $craSignature = CraSignature::where('consultant_id', $consultantId)
                ->where('month', $month)
                ->where('year', $year)
                ->first();

            if (!$craSignature) {
                return response()->json([
                    'success' => true,
                    'status' => [
                        'consultant_signed' => false,
                        'client_signed' => false,
                        'manager_signed' => false,
                        'all_signed' => false
                    ]
                ]);
            }

            $consultantSigned = !empty($craSignature->consultant_signature_data);
            $clientSigned = !empty($craSignature->client_signature_data);
            $managerSigned = !empty($craSignature->manager_signature_data);

            return response()->json([
                'success' => true,
                'status' => [
                    'consultant_signed' => $consultantSigned,
                    'client_signed' => $clientSigned,
                    'manager_signed' => $managerSigned,
                    'all_signed' => $consultantSigned && $clientSigned && $managerSigned,
                    'consultant_signed_at' => $craSignature->consultant_signed_at?->toISOString(),
                    'client_signed_at' => $craSignature->client_signed_at?->toISOString(),
                    'manager_signed_at' => $craSignature->manager_signed_at?->toISOString()
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur lors de la vérification du statut CRA: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la vérification: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Vérifier les signatures pour plusieurs périodes (optimisé)
     */
    public function checkCRASignatures(Request $request)
    {
        try {
            $request->validate([
                'periods' => 'required|array',
                'periods.*.month' => 'required|integer|min:1|max:12',
                'periods.*.year' => 'required|integer|min:2020|max:2030',
                'consultant_id' => 'nullable|exists:consultants,id'
            ]);

            $user = $request->user();
            $periods = $request->periods;
            $consultantId = $request->consultant_id ?? ($user instanceof Consultant ? $user->id : null);

            if (!$consultantId) {
                return response()->json([
                    'success' => false,
                    'message' => 'consultant_id requis'
                ], 422);
            }

            // Construire les conditions pour la requête
            $query = CraSignature::where('consultant_id', $consultantId);
            
            $query->where(function($q) use ($periods) {
                foreach ($periods as $period) {
                    $q->orWhere(function($subQ) use ($period) {
                        $subQ->where('month', $period['month'])
                             ->where('year', $period['year']);
                    });
                }
            });

            $signatures = $query->get();

            // Construire le résultat par période
            $result = [];
            foreach ($periods as $period) {
                $key = "{$period['year']}-{$period['month']}";
                $signature = $signatures->first(function($sig) use ($period) {
                    return $sig->month == $period['month'] && $sig->year == $period['year'];
                });

                if ($signature) {
                    $result[$key] = [
                        'consultant' => $signature->consultant_signature_data ? [
                            'signed_at' => $signature->consultant_signed_at?->toISOString()
                        ] : null,
                        'client' => $signature->client_signature_data ? [
                            'signed_at' => $signature->client_signed_at?->toISOString()
                        ] : null,
                        'manager' => $signature->manager_signature_data ? [
                            'signed_at' => $signature->manager_signed_at?->toISOString()
                        ] : null
                    ];
                } else {
                    $result[$key] = [
                        'consultant' => null,
                        'client' => null,
                        'manager' => null
                    ];
                }
            }

            return response()->json([
                'success' => true,
                'signatures' => $result
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur lors de la vérification des signatures CRA: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la vérification: ' . $e->getMessage()
            ], 500);
        }
    }
}
