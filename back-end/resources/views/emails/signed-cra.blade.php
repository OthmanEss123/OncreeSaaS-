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

        .day-worked { color: #27ae60; font-weight: bold; }
        .day-weekend-worked { color: #f39c12; font-weight: bold; }
        .day-absence { color: #e74c3c; font-weight: bold; }
        .day-weekend { background: #fff3cd; }

        .signature-box {
            border: 1px solid #ddd;
            padding: 10px;
            width: 30%;
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

<p><strong>Consultant :</strong> {{ $consultant->name }} ({{ $consultant->email }})</p>
@if($project)
<p><strong>Projet :</strong> {{ $project->name }}</p>
@endif
<p><strong>Date de génération :</strong> {{ now()->locale('fr')->isoFormat('D MMMM YYYY HH:mm') }}</p>

@php
    /**
     * ===============================
     * 1️⃣ EXTRAIRE LE MOIS RÉEL
     * ===============================
     */
    $detectedMonth = null;
    $detectedYear = null;

    foreach ($schedules as $schedule) {
        $selectedDays = is_array($schedule->selected_days)
            ? $schedule->selected_days
            : json_decode($schedule->selected_days, true);

        if (!$selectedDays) continue;

        $first = \Carbon\Carbon::parse($selectedDays[0]['date']);
        $detectedMonth = $first->month;
        $detectedYear = $first->year;
        break;
    }

    // 🔒 Fallback si aucun jour trouvé
    $month = $detectedMonth ?? $month;
    $year = $detectedYear ?? $year;

    /**
     * ===============================
     * 2️⃣ CONSTRUIRE LES JOURS
     * ===============================
     */
    $daysData = [];

    foreach ($schedules as $schedule) {
        $selectedDays = is_array($schedule->selected_days)
            ? $schedule->selected_days
            : json_decode($schedule->selected_days, true);

        if (!$selectedDays) continue;

        foreach ($selectedDays as $selectedDay) {
            if (!isset($selectedDay['date'], $selectedDay['period'])) continue;

            $date = \Carbon\Carbon::parse($selectedDay['date']);
            if ($date->month != $month || $date->year != $year) continue;

            $key = $date->format('Y-m-d');

            if (!isset($daysData[$key])) {
                $daysData[$key] = [
                    'date' => $date,
                    'morning' => null,
                    'evening' => null
                ];
            }

            $daysData[$key][$selectedDay['period']] = $schedule;
        }
    }

    ksort($daysData);
@endphp

<!-- TABLE -->
<h2>Détail des jours travaillés</h2>

<table>
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
                        if ($day[$p]->absence_days > 0) {
                            $absenceDays += 0.5;
                        } else {
                            $daysWorked += 0.5;
                        }
                    }
                }

                $weekendWork = ($isWeekend && $daysWorked > 0) ? $daysWorked : 0;

                $workType = $day['morning']->workType->name
                    ?? $day['evening']->workType->name
                    ?? '-';

                $leaveType = $day['morning']->leaveType->name
                    ?? $day['evening']->leaveType->name
                    ?? '-';

                $note = $day['morning']->notes
                    ?? $day['evening']->notes
                    ?? '-';
            @endphp

            <tr class="{{ $isWeekend ? 'day-weekend' : '' }}">
                <td>{{ $date->format('d/m/Y') }}</td>
                <td>{{ ucfirst($date->locale('fr')->dayName) }}</td>
                <td class="day-worked">{{ $daysWorked ?: '-' }}</td>
                <td class="day-weekend-worked">{{ $weekendWork ?: '-' }}</td>
                <td class="day-absence">{{ $absenceDays ?: '-' }}</td>
                <td>{{ $workType }}</td>
                <td>{{ $leaveType }}</td>
               
            </tr>
        @empty
            <tr>
                <td colspan="8" style="text-align:center; color:#e74c3c;">
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

<div class="footer">
    <p>Ce document a été généré automatiquement et certifie l'exactitude du CRA.</p>
    <p>Toutes les parties ont signé ce document.</p>
    <p style="margin-top: 10px; padding: 8px; background: #e8f4f8; border: 1px solid #3498db; border-radius: 4px;">
        <strong>💾 Télécharger ce PDF :</strong> Utilisez le bouton de téléchargement disponible dans l'application pour obtenir une copie de ce document.
    </p>
</div>

</body>
</html>
