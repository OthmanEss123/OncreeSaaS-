<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Rapport d'activité - {{ $monthName }}</title>
    <style>
        * { 
            margin: 0; 
            padding: 0; 
            box-sizing: border-box; 
        }
        
        body { 
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; 
            font-size: 11px; 
            color: #2c3e50; 
            padding: 25px;
            background: #ffffff;
            line-height: 1.4;
        }
        
        /* En-tête moderne */
        .report-header {
            text-align: center;
            background: #ffffff;
            color: #000000;
            padding: 20px;
            margin-bottom: 25px;
            font-size: 16px;
            font-weight: bold;
            border: 3px solid rgb(169, 183, 190);
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            letter-spacing: 0.5px;
        }
        
        /* Conteneur des informations */
        .info-container {
            display: table;
            width: 100%;
            margin-bottom: 25px;
            border-spacing: 15px 0;
        }
        
        /* Boîtes d'information stylisées */
        .info-box {
            display: table-cell;
            width: 48%;
            border: 2px solid #e0e6ed;
            padding: 18px;
            vertical-align: top;
            background: #f8f9fa;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        
        .info-box-title {
            text-align: center;
            font-weight: bold;
            font-size: 13px;
            margin-bottom: 12px;
            padding-bottom: 8px;
            border-bottom: 2px solid #667eea;
            color: #667eea;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .info-line {
            margin-bottom: 8px;
            padding: 4px 0;
        }
        
        .info-label {
            display: inline-block;
            width: 80px;
            font-weight: bold;
            color: #495057;
        }
        
        /* Titres de section élégants */
        .section-title {
            background-color: #667eea;
            color: white;
            padding: 10px 15px;
            font-weight: bold;
            font-size: 12px;
            margin-top: 25px;
            margin-bottom: 12px;
            border-radius: 5px;
            text-transform: uppercase;
            letter-spacing: 0.8px;
        }
        
        /* Table d'activité modernisée */
        .activity-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            margin-bottom: 20px;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        
        .activity-table th,
        .activity-table td {
            border: 1px solid #dee2e6;
            padding: 6px 4px;
            text-align: center;
            font-size: 9px;
        }
        
        .activity-table th {
            background-color: #e9ecef;
            font-weight: bold;
            color: #495057;
            border-bottom: 2px solid #667eea;
        }
        
        .activity-table tbody tr:hover {
            background-color: #f1f3f5;
        }
        
        .day-cell {
            width: 3%;
            height: 28px;
        }
        
        .day-cell.worked {
            background-color: #90EE90 !important;
            color: #000000 !important;
            font-weight: bold !important;
            border: 2px solid #37b24d !important;
        }
        
        /* Table exceptionnelle améliorée */
        .exceptional-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            margin-bottom: 15px;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        
        .exceptional-table th,
        .exceptional-table td {
            border: 1px solid #dee2e6;
            padding: 10px;
            text-align: left;
        }
        
        .exceptional-table th {
            background-color: #667eea;
            color: white;
            font-weight: bold;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .exceptional-table tbody tr:nth-child(even) {
            background-color: #f8f9fa;
        }
        
        .exceptional-table tbody tr:hover {
            background-color: #e7f5ff;
        }
        
        /* Ligne de total stylisée */
        .total-line {
            font-weight: bold;
            font-size: 13px;
            margin-top: 15px;
            padding: 12px 15px;
            background-color: #37b24d;
            color: white;
            border-radius: 5px;
            text-align: center;
        }
        
        /* Pied de page */
        .footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 2px solid #e0e6ed;
            text-align: center;
            color: #868e96;
            font-size: 9px;
        }
    </style>
</head>
<body>
    <!-- En-tête du rapport -->
    <div class="report-header">
        Rapport d'activité de {{ $consultant->name ?? 'Consultant' }} {{ $monthName }}
    </div>

    <!-- Informations Prestataire et Client -->
    <div class="info-container">
        <div class="info-box">
            <div class="info-box-title">Prestataire</div>
            <div class="info-line">
                <span class="info-label">Société :</span> 
                {{ $consultant->name ?? 'N/A' }}
            </div>
            <div class="info-line">
                <span class="info-label">Adresse :</span> 
                {{ $consultant->address ?? 'N/A' }}
            </div>
            <div class="info-line">
                <span class="info-label">Contact :</span> 
                {{ $consultant->email ?? 'N/A' }}
            </div>
        </div>
        
        <div class="info-box">
            <div class="info-box-title">Client</div>
            <div class="info-line">
                <span class="info-label">Société :</span> 
                {{ $client->company_name ?? 'N/A' }}
            </div>
            <div class="info-line">
                <span class="info-label">Adresse :</span> 
                {{ $client->address ?? 'N/A' }}
            </div>
            <div class="info-line">
                <span class="info-label">Contact :</span> 
                {{ $client->contact_name ?? 'N/A' }}
            </div>
        </div>
    </div>

    <!-- Activité normale -->
    <div class="section-title">Activité normale</div>
    <table class="activity-table">
        <thead>
            <tr>
                <th>Projet/Type d'activité</th>
                @php
                    $daysOfWeek = ['di', 'lu', 'ma', 'me', 'je', 've', 'sa'];
                @endphp
                @for($day = 1; $day <= 31; $day++)
                    @php
                        $date = \Carbon\Carbon::create($year, $month, $day);
                        $dayOfWeekIndex = $date->dayOfWeek;
                        $dayOfWeekName = $daysOfWeek[$dayOfWeekIndex];
                    @endphp
                    <th style="font-size: 8px;">{{ $dayOfWeekName }}</th>
                @endfor
            </tr>
            <tr>
                <th>Jour du mois</th>
                @for($day = 1; $day <= 31; $day++)
                    <th class="day-cell">{{ $day }}</th>
                @endfor
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>{{ $project->name ?? 'Projet' }}</td>
                @php
                    // Créer un tableau des jours travaillés à partir de selected_days
                    $workedDays = [];
                    $debugInfo = []; // Pour le debug
                    
                    foreach($schedules as $schedule) {
                        $debugInfo[] = [
                            'has_selected_days' => !empty($schedule->selected_days),
                            'has_date' => isset($schedule->date),
                            'month_field' => $schedule->month ?? 'N/A',
                            'year_field' => $schedule->year ?? 'N/A'
                        ];
                        
                        // Méthode 1: Essayer d'utiliser selected_days
                        if (!empty($schedule->selected_days)) {
                            $selectedDays = is_string($schedule->selected_days) 
                                ? json_decode($schedule->selected_days, true) 
                                : $schedule->selected_days;
                            
                            if (is_array($selectedDays) && count($selectedDays) > 0) {
                                foreach ($selectedDays as $dayPeriod) {
                                    if (isset($dayPeriod['date'])) {
                                        try {
                                            $dateObj = \Carbon\Carbon::parse($dayPeriod['date']);
                                            // Vérifier que la date est dans le bon mois/année
                                            if ($dateObj->month == $month && $dateObj->year == $year) {
                                                $day = $dateObj->day;
                                                $workedDays[$day] = true;
                                            }
                                        } catch (\Exception $e) {
                                            // Ignorer les dates invalides
                                        }
                                    }
                                }
                            }
                        }
                        
                        // Méthode 2: Fallback - utiliser la date du schedule directement
                        if (isset($schedule->date)) {
                            try {
                                $dateObj = \Carbon\Carbon::parse($schedule->date);
                                if ($dateObj->month == $month && $dateObj->year == $year) {
                                    $day = $dateObj->day;
                                    $workedDays[$day] = true;
                                }
                            } catch (\Exception $e) {
                                // Ignorer
                            }
                        }
                    }
                    
                    // Si aucun jour trouvé, utiliser les champs month/year de la base
                    if (empty($workedDays)) {
                        foreach($schedules as $schedule) {
                            // Si month et year sont directement dans le schedule
                            if ($schedule->month == $month && $schedule->year == $year && $schedule->days_worked > 0) {
                                // Marquer tous les jours du mois comme potentiellement travaillés
                                // Ou utiliser une logique plus simple
                                if (isset($schedule->date)) {
                                    $day = \Carbon\Carbon::parse($schedule->date)->day;
                                    $workedDays[$day] = true;
                                }
                            }
                        }
                    }
                @endphp
                @for($day = 1; $day <= 31; $day++)
                    <td class="day-cell {{ isset($workedDays[$day]) ? 'worked' : '' }}">
                        {{ isset($workedDays[$day]) ? '1' : '' }}
                    </td>
                @endfor
            </tr>
        </tbody>
    </table>
  

    <!-- Activité exceptionnelle -->
    <div class="section-title">Activité exceptionnelle</div>
    <table class="exceptional-table">
        <thead>
            <tr>
                <th style="width: 30%;">Projet/Type d'activité</th>
                <th style="width: 50%;">Description</th>
            </tr>
        </thead>
        <tbody>
            @foreach($schedules as $schedule)
                @php
                    $notes = $schedule->notes ? json_decode($schedule->notes, true) : [];
                    $description = $notes['description'] ?? $notes['task'] ?? '';
                @endphp
                @if($description)
                <tr>
                    <td>{{ $project->name ?? 'N/A' }}</td>
                    <td>{{ $description }}</td>
                </tr>
                @endif
            @endforeach
        </tbody>
    </table>

    <!-- Total -->
    
    <!-- Pied de page -->
    <div class="footer">
        <p>Document généré automatiquement le {{ \Carbon\Carbon::now()->format('d/m/Y à H:i') }}</p>
        <p>Ce rapport est confidentiel et destiné uniquement à l'usage du destinataire mentionné ci-dessus.</p>
    </div>
</body>
</html>













