<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>CRA Signé - {{ $monthName }}</title>
    <style>
        @page {
            size: A4 landscape;
            margin: 15mm;
        }
        
        * { 
            margin: 0; 
            padding: 0; 
            box-sizing: border-box; 
        }
        
        body { 
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; 
            font-size: 10px; 
            color: #2c3e50; 
            padding: 15px;
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
            border-radius: 6px;
            background: #f8f9fa;
            vertical-align: top;
        }
        
        .info-box h3 {
            font-size: 12px;
            font-weight: bold;
            margin-bottom: 10px;
            color: #34495e;
            border-bottom: 2px solid #3498db;
            padding-bottom: 5px;
        }
        
        .info-box p {
            margin: 5px 0;
            font-size: 10px;
        }
        
        .info-box strong {
            color: #2c3e50;
        }
        
        /* Section statistiques */
        .stats-section {
            margin: 25px 0;
            border: 2px solid #e0e6ed;
            border-radius: 6px;
            padding: 20px;
            background: #f8f9fa;
        }
        
        .stats-section h2 {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 15px;
            color: #2c3e50;
            border-bottom: 2px solid #3498db;
            padding-bottom: 8px;
        }
        
        .stats-grid {
            display: table;
            width: 100%;
            border-spacing: 10px;
        }
        
        .stat-item {
            display: table-cell;
            width: 33.33%;
            text-align: center;
            padding: 15px;
            background: #ffffff;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        
        .stat-label {
            font-size: 9px;
            color: #7f8c8d;
            margin-bottom: 5px;
            text-transform: uppercase;
        }
        
        .stat-value {
            font-size: 18px;
            font-weight: bold;
            color: #2c3e50;
        }
        
        /* Section signatures */
        .signatures-section {
            margin-top: 30px;
            page-break-inside: avoid;
        }
        
        .signatures-section h2 {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 20px;
            color: #2c3e50;
            border-bottom: 2px solid #3498db;
            padding-bottom: 8px;
        }
        
        .signatures-container {
            display: table;
            width: 100%;
            border-spacing: 10px;
        }
        
        .signature-box {
            display: table-cell;
            width: 33.33%;
            vertical-align: top;
            border: 2px solid #e0e6ed;
            border-radius: 6px;
            padding: 15px;
            background: #ffffff;
        }
        
        .signature-box h3 {
            font-size: 12px;
            font-weight: bold;
            margin-bottom: 10px;
            color: #34495e;
        }
        
        .signature-image {
            max-width: 200px;
            max-height: 80px;
            margin: 10px 0;
            border: 1px solid #ddd;
            padding: 5px;
            background: #f8f9fa;
        }
        
        .signature-info {
            font-size: 9px;
            color: #7f8c8d;
            margin-top: 5px;
        }
        
        /* Table calendrier */
        .calendar-section {
            margin: 20px 0;
            page-break-inside: avoid;
        }
        
        .calendar-section h2 {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 15px;
            color: #2c3e50;
            border-bottom: 2px solid #3498db;
            padding-bottom: 8px;
        }
        
        .calendar-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            margin-bottom: 20px;
            border-radius: 6px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .calendar-table th,
        .calendar-table td {
            border: 1px solid #dee2e6;
            padding: 4px 2px;
            text-align: center;
            font-size: 8px;
        }
        
        .calendar-table th {
            background-color: #667eea;
            color: white;
            font-weight: bold;
            font-size: 9px;
        }
        
        .calendar-table tbody tr:nth-child(even) {
            background-color: #f8f9fa;
        }
        
        .day-cell {
            width: 2.5%;
            height: 24px;
            font-size: 8px;
        }
        
        .day-cell.worked {
            background-color: #90EE90 !important;
            color: #000000 !important;
            font-weight: bold !important;
            border: 2px solid #37b24d !important;
        }
        
        .day-cell.weekend {
            background-color: #fff3cd !important;
        }
        
        .day-cell.weekend.worked {
            background-color: #ffd700 !important;
            border: 2px solid #ff8c00 !important;
        }
        
        /* Pied de page */
        .footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 2px solid #e0e6ed;
            text-align: center;
            font-size: 9px;
            color: #7f8c8d;
        }
    </style>
</head>
<body>
    <!-- En-tête -->
    <div class="report-header">
        COMPTE RENDU D'ACTIVITÉ (CRA) SIGNÉ<br>
        {{ $monthName }}
    </div>
    
    <!-- Informations du consultant -->
    <div class="info-container">
        <div class="info-box">
            <h3>Informations du Consultant</h3>
            <p><strong>Nom:</strong> {{ $consultant->name }}</p>
            <p><strong>Email:</strong> {{ $consultant->email }}</p>
            @if($project)
            <p><strong>Projet:</strong> {{ $project->name }}</p>
            @endif
        </div>
        
        <div class="info-box">
            <h3>Période</h3>
            <p><strong>Mois:</strong> {{ $monthName }}</p>
            <p><strong>Date de génération:</strong> {{ \Carbon\Carbon::now()->locale('fr')->isoFormat('D MMMM YYYY à HH:mm') }}</p>
        </div>
    </div>
    
    <!-- Statistiques -->
    <div class="stats-section">
        <h2>Résumé du CRA</h2>
        <div class="stats-grid">
            <div class="stat-item">
                <div class="stat-label">Jours travaillés</div>
                <div class="stat-value">{{ $workLog->daysWorked }}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Week-end</div>
                <div class="stat-value">{{ $workLog->weekendWork }}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Absences</div>
                <div class="stat-value">{{ $workLog->absences }}</div>
            </div>
        </div>
        
        @if($workLog->absenceType)
        <p style="margin-top: 15px; font-size: 10px;"><strong>Type d'absence:</strong> {{ $workLog->absenceType }}</p>
        @endif
        
        @if($workLog->workType)
        <p style="margin-top: 5px; font-size: 10px;"><strong>Type de travail:</strong> {{ $workLog->workType }}</p>
        @endif
        
        @if($workLog->workTypeDays > 0)
        <p style="margin-top: 5px; font-size: 10px;"><strong>Jours de type de travail:</strong> {{ $workLog->workTypeDays }}</p>
        @endif
    </div>
    
    <!-- Tableau calendrier -->
    <div class="calendar-section">
        <h2>Calendrier des jours travaillés</h2>
        <table class="calendar-table">
            <thead>
                <tr>
                    <th style="width: 15%;">Projet/Type d'activité</th>
                    @php
                        $daysOfWeek = ['di', 'lu', 'ma', 'me', 'je', 've', 'sa'];
                    @endphp
                    @for($day = 1; $day <= 31; $day++)
                        @php
                            try {
                                $date = \Carbon\Carbon::create($year, $month, $day);
                                $dayOfWeekIndex = $date->dayOfWeek;
                                $dayOfWeekName = $daysOfWeek[$dayOfWeekIndex];
                            } catch (\Exception $e) {
                                $dayOfWeekName = '';
                            }
                        @endphp
                        @if($day <= \Carbon\Carbon::create($year, $month, 1)->daysInMonth)
                        <th style="font-size: 7px;">{{ $dayOfWeekName }}</th>
                        @endif
                    @endfor
                </tr>
                <tr>
                    <th>Jour du mois</th>
                    @for($day = 1; $day <= 31; $day++)
                        @if($day <= \Carbon\Carbon::create($year, $month, 1)->daysInMonth)
                        <th class="day-cell">{{ $day }}</th>
                        @endif
                    @endfor
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="font-weight: bold; text-align: left; padding: 8px;">{{ $project->name ?? 'Projet' }}</td>
                    @php
                        // Créer un tableau des jours travaillés à partir de selected_days
                        $workedDays = [];
                        
                        foreach($schedules as $schedule) {
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
                                if ($schedule->month == $month && $schedule->year == $year && $schedule->days_worked > 0) {
                                    if (isset($schedule->date)) {
                                        try {
                                            $day = \Carbon\Carbon::parse($schedule->date)->day;
                                            $workedDays[$day] = true;
                                        } catch (\Exception $e) {
                                            // Ignorer
                                        }
                                    }
                                }
                            }
                        }
                    @endphp
                    @for($day = 1; $day <= 31; $day++)
                        @if($day <= \Carbon\Carbon::create($year, $month, 1)->daysInMonth)
                            @php
                                $isWorked = isset($workedDays[$day]);
                                $date = \Carbon\Carbon::create($year, $month, $day);
                                $isWeekend = $date->isWeekend();
                                $cellClass = 'day-cell';
                                if ($isWorked) {
                                    $cellClass .= ' worked';
                                }
                                if ($isWeekend) {
                                    $cellClass .= ' weekend';
                                }
                            @endphp
                            <td class="{{ $cellClass }}">
                                {{ $isWorked ? '1' : '' }}
                            </td>
                        @endif
                    @endfor
                </tr>
            </tbody>
        </table>
    </div>
    
    <!-- Signatures -->
    <div class="signatures-section">
        <h2>Signatures</h2>
        
        <div class="signatures-container">
            @if(isset($signatures['consultant']) && $signatures['consultant'])
            <div class="signature-box">
                <h3>Signature du Consultant</h3>
                @if($signatures['consultant']['signature_data'])
                <img src="{{ $signatures['consultant']['signature_data'] }}" alt="Signature Consultant" class="signature-image" />
                @endif
                <div class="signature-info">
                    Signé le: {{ \Carbon\Carbon::parse($signatures['consultant']['signed_at'])->locale('fr')->isoFormat('D MMMM YYYY à HH:mm') }}
                </div>
            </div>
            @endif
            
            @if(isset($signatures['client']) && $signatures['client'])
            <div class="signature-box">
                <h3>Signature du Client</h3>
                @if($signatures['client']['signature_data'])
                <img src="{{ $signatures['client']['signature_data'] }}" alt="Signature Client" class="signature-image" />
                @endif
                <div class="signature-info">
                    Signé le: {{ \Carbon\Carbon::parse($signatures['client']['signed_at'])->locale('fr')->isoFormat('D MMMM YYYY à HH:mm') }}
                </div>
            </div>
            @endif
            
            @if(isset($signatures['manager']) && $signatures['manager'])
            <div class="signature-box">
                <h3>Signature du Manager</h3>
                @if($signatures['manager']['signature_data'])
                <img src="{{ $signatures['manager']['signature_data'] }}" alt="Signature Manager" class="signature-image" />
                @endif
                <div class="signature-info">
                    Signé le: {{ \Carbon\Carbon::parse($signatures['manager']['signed_at'])->locale('fr')->isoFormat('D MMMM YYYY à HH:mm') }}
                </div>
            </div>
            @endif
        </div>
    </div>
    
    <!-- Pied de page -->
    <div class="footer">
        <p>Ce document a été généré automatiquement et certifie que les informations du CRA sont exactes.</p>
        <p>Toutes les parties (Consultant, Client, Manager) ont signé ce document.</p>
    </div>
</body>
</html>









