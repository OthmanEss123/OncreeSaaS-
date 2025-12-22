<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>CRA Signé - {{ $monthName }}</title>
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
        
        .signature-box {
            margin-bottom: 30px;
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
        
        /* Pied de page */
        .footer {
            margin-top: 40px;
            padding-top: 20px;
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
    
    <!-- Signatures -->
    <div class="signatures-section">
        <h2>Signatures</h2>
        
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
    
    <!-- Pied de page -->
    <div class="footer">
        <p>Ce document a été généré automatiquement et certifie que les informations du CRA sont exactes.</p>
        <p>Toutes les parties (Consultant, Client, Manager) ont signé ce document.</p>
    </div>
</body>
</html>




