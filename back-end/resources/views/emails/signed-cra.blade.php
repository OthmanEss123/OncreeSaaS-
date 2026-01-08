<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>CRA Signé - {{ $monthName }}</title>

    <style>
        @page { size: A4 portrait; margin: 20mm 15mm; }
        body { font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #2c3e50; }
        h2 { border-bottom: 2px solid #3498db; padding-bottom: 6px; }

        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { border: 1px solid #ddd; padding: 8px; font-size: 10px; }
        th { background: #667eea; color: #fff; text-align: left; }
        
        table.days-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        table.days-table th, table.days-table td { border: 1px solid #ddd; padding: 4px 6px; font-size: 8px; }
        table.days-table th { background: #667eea; color: #fff; text-align: left; }

        .day-worked { color: #27ae60; font-weight: bold; }
        .day-weekend-worked { color: #f39c12; font-weight: bold; }
        .day-absence { color: #e74c3c; font-weight: bold; }
        .day-weekend { background: #fff3cd; }

        .signature-box {
            border: 1px solid #ddd;
            padding: 10px;
            width: 27%;
            display: inline-block;
            vertical-align: top;
            margin-right: 2%;
        }

        .signature-image {
            max-width: 100%;
            max-height: 70px;
            border: 1px solid #ccc;
        }

        .footer {
            margin-top: 20px;
            text-align: center;
            font-size: 10px;
            color: #777;
        }
    </style>
</head>

<body>

<!-- HEADER -->
<h2 style="text-align:center;">
    COMPTE RENDU D’ACTIVITÉ (CRA)<br>
    {{ $monthName }}
</h2>

<p><strong>Consultant :</strong> {{ $consultant->name }} ({{ $consultant->email }})</p>@if($project)<p><strong>Projet :</strong> {{ $project->name }}</p>@endif<p><strong>Date de génération :</strong> {{ now()->locale('fr')->isoFormat('D MMMM YYYY HH:mm') }}</p>

@php
    /**
     * ===============================
     * CONSTRUIRE LES JOURS À PARTIR DES SCHEDULES ET SELECTED_DAYS
     * ===============================
     */
    $daysData = [];
    $allSelectedDays = [];

    // Extraire tous les jours de selected_days pour le mois sélectionné depuis TOUS les schedules
    foreach ($schedules as $schedule) {
        // Si selected_days existe, extraire tous les jours
        if ($schedule->selected_days) {
            try {
                // Gérer différents formats : string JSON, array, ou déjà décodé par Laravel
                $selectedDaysData = null;
                
                if (is_string($schedule->selected_days)) {
                    // Si c'est une string, essayer de la décoder
                    $decoded = json_decode($schedule->selected_days, true);
                    if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                        $selectedDaysData = $decoded;
                    }
                } elseif (is_array($schedule->selected_days)) {
                    // Si c'est déjà un array (Laravel peut le caster automatiquement)
                    $selectedDaysData = $schedule->selected_days;
                }
                
                if (is_array($selectedDaysData) && !empty($selectedDaysData)) {
                    foreach ($selectedDaysData as $dayPeriod) {
                        // Vérifier que dayPeriod est un array avec les clés nécessaires
                        if (is_array($dayPeriod) && isset($dayPeriod['date']) && isset($dayPeriod['period'])) {
                            try {
                                $dayDate = \Carbon\Carbon::parse($dayPeriod['date']);
                                // Vérifier que le jour appartient au mois/année sélectionné
                                if ($dayDate->month == $month && $dayDate->year == $year) {
                                    $allSelectedDays[] = [
                                        'date' => $dayPeriod['date'],
                                        'period' => $dayPeriod['period'],
                                        'schedule' => $schedule
                                    ];
                                }
                            } catch (\Exception $dateException) {
                                // Ignorer les dates invalides et continuer
                                continue;
                            }
                        }
                    }
                }
            } catch (\Exception $e) {
                // Ignorer les erreurs de parsing mais continuer avec les autres schedules
                continue;
            }
        }
    }
    
    // Debug: compter les jours extraits (peut être commenté en production)
    // $totalSelectedDaysExtracted = count($allSelectedDays);

    // D'abord, ajouter tous les jours de selected_days
    foreach ($allSelectedDays as $dayPeriod) {
        try {
            $date = \Carbon\Carbon::parse($dayPeriod['date']);
            $key = $date->format('Y-m-d');
            
            // Double vérification : s'assurer que le jour appartient bien au mois/année sélectionné
            if ($date->month != $month || $date->year != $year) {
                continue; // Ignorer les jours qui ne sont pas dans le mois sélectionné
            }
            
            if (!isset($daysData[$key])) {
                $daysData[$key] = [
                    'date' => $date,
                    'morning' => null,
                    'evening' => null
                ];
            }
            
            // Chercher le schedule correspondant dans TOUS les schedules
            $matchingSchedule = null;
            
            if ($dayPeriod['schedule']) {
                try {
                    $sDate = \Carbon\Carbon::parse($dayPeriod['schedule']->date);
                    $sKey = $sDate->format('Y-m-d');
                    $sPeriod = $dayPeriod['schedule']->period ?? 'morning';
                    // Si le schedule correspond exactement à la date et période
                    if ($sKey === $key && $sPeriod === $dayPeriod['period']) {
                        $matchingSchedule = $dayPeriod['schedule'];
                    }
                } catch (\Exception $e) {
                    // Ignorer les erreurs de parsing de date
                }
            }
            
            // Sinon, chercher dans tous les schedules
            if (!$matchingSchedule) {
                foreach ($schedules as $s) {
                    if (!$s->date) continue;
                    try {
                        $sDate = \Carbon\Carbon::parse($s->date);
                        $sKey = $sDate->format('Y-m-d');
                        $sPeriod = $s->period ?? 'morning';
                        if ($sKey === $key && $sPeriod === $dayPeriod['period']) {
                            $matchingSchedule = $s;
                            break;
                        }
                    } catch (\Exception $e) {
                        continue;
                    }
                }
            }
            
            // Utiliser le schedule trouvé ou créer un objet basé sur le schedule parent
            if ($matchingSchedule) {
                $scheduleToUse = $matchingSchedule;
            } else {
                // Créer un objet par défaut en utilisant les informations du schedule parent
                $parentSchedule = $dayPeriod['schedule'];
                
                $scheduleToUse = (object)[
                    'date' => $dayPeriod['date'],
                    'period' => $dayPeriod['period'],
                    'days_worked' => 0.5, // Par défaut, un jour sélectionné = 0.5 jour travaillé
                    'absence_days' => 0,
                    'workType' => $parentSchedule ? ($parentSchedule->workType ?? null) : null,
                    'leaveType' => $parentSchedule ? ($parentSchedule->leaveType ?? null) : null,
                    'work_type_id' => $parentSchedule ? ($parentSchedule->work_type_id ?? null) : null,
                    'leave_type_id' => $parentSchedule ? ($parentSchedule->leave_type_id ?? null) : null,
                    'weekend_worked' => 0,
                    'absence_type' => $parentSchedule ? ($parentSchedule->absence_type ?? 'none') : 'none',
                    'work_type_days' => 0
                ];
            }
            
            // Assigner le schedule à la période appropriée
            if ($dayPeriod['period'] === 'morning') {
                $daysData[$key]['morning'] = $scheduleToUse;
            } else if ($dayPeriod['period'] === 'evening') {
                $daysData[$key]['evening'] = $scheduleToUse;
            }
        } catch (\Exception $e) {
            // Ignorer les erreurs pour ce jour et continuer avec les autres
            continue;
        }
    }

    // Ensuite, ajouter les schedules directs qui ne sont pas déjà dans selected_days
    foreach ($schedules as $schedule) {
        if (!$schedule->date) continue;

        $date = \Carbon\Carbon::parse($schedule->date);
        $key = $date->format('Y-m-d');

        // Vérifier que le schedule appartient au mois/année sélectionné
        if ($date->month != $month || $date->year != $year) {
            continue;
        }

        if (!isset($daysData[$key])) {
            $daysData[$key] = [
                'date' => $date,
                'morning' => null,
                'evening' => null
            ];
        }

        // Assigner le schedule à la période appropriée (morning ou evening)
        $period = $schedule->period ?? 'morning';
        if (in_array($period, ['morning', 'evening'])) {
            // Ne remplacer que si la période n'est pas déjà remplie
            if (!$daysData[$key][$period]) {
                $daysData[$key][$period] = $schedule;
            }
        }
    }

    ksort($daysData);
    
    // Debug: informations sur les jours extraits
    // Pour déboguer, vous pouvez décommenter ces lignes et vérifier les logs
    // \Log::info('Total schedules reçus: ' . count($schedules));
    // \Log::info('Total jours extraits de selected_days: ' . count($allSelectedDays));
    // \Log::info('Total jours dans daysData: ' . count($daysData));
    // \Log::info('Jours extraits:', $allSelectedDays);
@endphp

<!-- TABLE -->
<h2>Détail des jours travaillés</h2>

<table class="days-table">
    <thead>
        <tr>
            <th>Date</th>
            <th>Jour</th>
            <th>Jours travaillés</th>
            <th>Week-end travaillé</th>
            <th>Absence</th>
            <th>Type de travail</th>
            <th>Type de congé</th>
           
        </tr>
    </thead>

    <tbody>
        @forelse($daysData as $day)
            @php
                $date = $day['date'];
                $isWeekend = $date->isWeekend();

                $daysWorked = 0;
                $absenceDays = 0;

                foreach (['morning','evening'] as $p) {
                    if ($day[$p]) {
                        $schedule = $day[$p];
                        if (($schedule->absence_days ?? 0) > 0) {
                            $absenceDays += 0.5;
                        } else {
                            $daysWorked += 0.5;
                        }
                    }
                }

                $weekendWork = ($isWeekend && $daysWorked > 0) ? $daysWorked : 0;

                $workType = ($day['morning'] && $day['morning']->workType)
                    ? $day['morning']->workType->name
                    : (($day['evening'] && $day['evening']->workType)
                        ? $day['evening']->workType->name
                        : '-');

                $leaveType = ($day['morning'] && $day['morning']->leaveType)
                    ? $day['morning']->leaveType->name
                    : (($day['evening'] && $day['evening']->leaveType)
                        ? $day['evening']->leaveType->name
                        : '-');
            @endphp

            <tr class="{{ $isWeekend ? 'day-weekend' : '' }}">
                <td>{{ $date->format('d/m/Y') }}</td>
                <td>{{ ucfirst($date->locale('fr')->dayName) }}</td>
                <td class="day-worked">
                    @if($daysWorked > 0)
                        {{ $daysWorked == (int)$daysWorked ? (int)$daysWorked : number_format($daysWorked, 1, ',', '') }}
                    @else
                        -
                    @endif
                </td>
                <td class="day-weekend-worked">
                    @if($weekendWork > 0)
                        {{ $weekendWork == (int)$weekendWork ? (int)$weekendWork : number_format($weekendWork, 1, ',', '') }}
                    @else
                        -
                    @endif
                </td>
                <td class="day-absence">
                    @if($absenceDays > 0)
                        {{ $absenceDays == (int)$absenceDays ? (int)$absenceDays : number_format($absenceDays, 1, ',', '') }}
                    @else
                        -
                    @endif
                </td>
                <td>{{ $workType }}</td>
                <td>{{ $leaveType }}</td>
               
            </tr>
        @empty
            <tr>
                <td colspan="7" style="text-align:center; color:#e74c3c;">
                    Aucun jour travaillé pour ce mois.
                </td>
            </tr>
        @endforelse
    </tbody>
</table>

<!-- SIGNATURES -->
<h2>Signatures</h2>

@foreach(['consultant'=>'Consultant','client'=>'Client','manager'=>'Manager'] as $key => $label)
    @if(!empty($signatures[$key]))
        <div class="signature-box">
            <strong>{{ $label }}</strong><br>
            <img src="{{ $signatures[$key]['signature_data'] }}" class="signature-image">
            <p>Signé le {{ \Carbon\Carbon::parse($signatures[$key]['signed_at'])->format('d/m/Y H:i') }}</p>
        </div>
    @endif
@endforeach



</body>
</html>