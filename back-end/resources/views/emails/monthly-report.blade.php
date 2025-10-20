<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Rapport Mensuel - {{ $monthName }}</title>
    <style>
        body { font-family: Arial, sans-serif; font-size: 12px; color: #333; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; }
        .header h1 { color: #3b82f6; margin: 0; }
        .info-section { margin-bottom: 20px; }
        .info-section h2 { color: #3b82f6; font-size: 14px; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { padding: 8px; text-align: left; border: 1px solid #ddd; }
        th { background-color: #3b82f6; color: white; }
        .total-row { font-weight: bold; background-color: #f3f4f6; }
        .summary { background-color: #eff6ff; padding: 15px; border-radius: 5px; margin-top: 20px; }
        .summary-item { display: inline-block; width: 48%; margin-bottom: 10px; }
        .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Rapport de Travail Mensuel</h1>
        <p><strong>{{ $monthName }}</strong></p>
    </div>

    <div class="info-section">
        <h2>Informations du Consultant</h2>
        <p><strong>Nom :</strong> {{ $consultant->name }}</p>
        <p><strong>Email :</strong> {{ $consultant->email }}</p>
        <p><strong>Téléphone :</strong> {{ $consultant->phone }}</p>
    </div>

    <div class="info-section">
        <h2>Informations du Projet</h2>
        <p><strong>Projet :</strong> {{ $project->name }}</p>
        <p><strong>Client :</strong> {{ $client->company_name }}</p>
        <p><strong>Description :</strong> {{ $project->description }}</p>
    </div>

    <div class="info-section">
        <h2>Résumé du Mois</h2>
        <div class="summary">
            <div class="summary-item">
                <strong>Jours travaillés :</strong> {{ $totalDaysWorked }} jours
            </div>
            <div class="summary-item">
                <strong>Travail en W.E. :</strong> {{ $totalWeekendWork }} jours
            </div>
            <div class="summary-item">
                <strong>Absences :</strong> {{ $totalAbsences }} jours
            </div>
            <div class="summary-item">
                <strong>Type de travail :</strong> {{ $totalWorkTypeDays }} jours
            </div>
        </div>
    </div>

    @if($workTypes)
    <div class="info-section">
        <h2>Types de Travail</h2>
        <p>{{ $workTypes }}</p>
    </div>
    @endif

    @if($absenceTypes)
    <div class="info-section">
        <h2>Types d'Absence</h2>
        <p>{{ $absenceTypes }}</p>
    </div>
    @endif

    <div class="info-section">
        <h2>Détails des Journées</h2>
        <table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Période</th>
                    <th>Jours travaillés</th>
                    <th>Description</th>
                </tr>
            </thead>
            <tbody>
                @foreach($schedules as $schedule)
                    @php
                        $notes = $schedule->notes ? json_decode($schedule->notes, true) : [];
                        $travelExpenses = 0;
                        if (isset($notes['travelExpenses'])) {
                            if (is_array($notes['travelExpenses'])) {
                                $travelExpenses = array_reduce($notes['travelExpenses'], function($carry, $expense) {
                                    return $carry + ($expense['amount'] ?? 0);
                                }, 0);
                            } else {
                                $travelExpenses = (float) $notes['travelExpenses'];
                            }
                        }
                        $description = $notes['description'] ?? $notes['task'] ?? 'Travail enregistré';
                    @endphp
                    <tr>
                        <td>{{ \Carbon\Carbon::parse($schedule->date)->format('d/m/Y') }}</td>
                        <td>{{ $schedule->period === 'morning' ? 'Matin' : 'Après-midi' }}</td>
                        <td>{{ $schedule->days_worked }}</td>
                        <td>{{ $description }}</td>
                    </tr>
                @endforeach
                <tr class="total-row">
                    <td colspan="2">TOTAL</td>
                    <td>{{ $totalDaysWorked }}</td>
                    <td>-</td>
                    <td>{{ number_format($totalExpenses, 2) }}</td>
                </tr>
            </tbody>
        </table>
    </div>

    <div class="footer">
        <p>Document généré automatiquement le {{ \Carbon\Carbon::now()->format('d/m/Y à H:i') }}</p>
    </div>
</body>
</html>













