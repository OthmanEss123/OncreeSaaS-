<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>CRA Signé - {{ $monthName }}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px;">
            CRA Signé - {{ $monthName }}
        </h2>
        
        <p>Bonjour,</p>
        
        <p>Le Compte Rendu d'Activité (CRA) pour la période <strong>{{ $monthName }}</strong> a été signé par toutes les parties concernées.</p>
        
        <p><strong>Consultant:</strong> {{ $consultant->name }}</p>
        @if($project)
        <p><strong>Projet:</strong> {{ $project->name }}</p>
        @endif
        
        <h3 style="color: #34495e; margin-top: 20px;">Résumé:</h3>
        <ul>
            <li>Jours travaillés: {{ $workLog->daysWorked }}</li>
            <li>Jours travaillés en week-end: {{ $workLog->weekendWork }}</li>
            <li>Jours d'absence: {{ $workLog->absences }}</li>
        </ul>
        
        <h3 style="color: #34495e; margin-top: 30px; border-top: 2px solid #3498db; padding-top: 15px;">Détails du CRA:</h3>
        <table style="width: 100%; margin-top: 15px; border-collapse: collapse; background: #ffffff; border: 1px solid #ddd; border-radius: 6px; overflow: hidden;">
            <thead>
                <tr style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff;">
                    <th style="padding: 12px; text-align: left; font-size: 13px; font-weight: bold; border-bottom: 2px solid #5568d3;">Informations</th>
                    <th style="padding: 12px; text-align: left; font-size: 13px; font-weight: bold; border-bottom: 2px solid #5568d3;">Valeurs</th>
                </tr>
            </thead>
            <tbody>
                <tr style="background: #f8f9fa;">
                    <td style="padding: 10px; border-bottom: 1px solid #e0e6ed; font-weight: 600; color: #2c3e50;">Période</td>
                    <td style="padding: 10px; border-bottom: 1px solid #e0e6ed; color: #495057;">{{ $monthName }}</td>
                </tr>
                <tr style="background: #ffffff;">
                    <td style="padding: 10px; border-bottom: 1px solid #e0e6ed; font-weight: 600; color: #2c3e50;">Consultant</td>
                    <td style="padding: 10px; border-bottom: 1px solid #e0e6ed; color: #495057;">{{ $consultant->name }}</td>
                </tr>
                @if($project)
                <tr style="background: #f8f9fa;">
                    <td style="padding: 10px; border-bottom: 1px solid #e0e6ed; font-weight: 600; color: #2c3e50;">Projet</td>
                    <td style="padding: 10px; border-bottom: 1px solid #e0e6ed; color: #495057;">{{ $project->name }}</td>
                </tr>
                @endif
                <tr style="background: #ffffff;">
                    <td style="padding: 10px; border-bottom: 1px solid #e0e6ed; font-weight: 600; color: #2c3e50;">Jours travaillés</td>
                    <td style="padding: 10px; border-bottom: 1px solid #e0e6ed; color: #27ae60; font-weight: bold;">{{ $workLog->daysWorked }} jour(s)</td>
                </tr>
                <tr style="background: #f8f9fa;">
                    <td style="padding: 10px; border-bottom: 1px solid #e0e6ed; font-weight: 600; color: #2c3e50;">Jours travaillés en week-end</td>
                    <td style="padding: 10px; border-bottom: 1px solid #e0e6ed; color: #495057;">{{ $workLog->weekendWork > 0 ? $workLog->weekendWork . ' jour(s)' : 'Aucun' }}</td>
                </tr>
                <tr style="background: #ffffff;">
                    <td style="padding: 10px; border-bottom: 1px solid #e0e6ed; font-weight: 600; color: #2c3e50;">Jours d'absence</td>
                    <td style="padding: 10px; border-bottom: 1px solid #e0e6ed; color: #495057;">{{ $workLog->absences > 0 ? $workLog->absences . ' jour(s)' : 'Aucun' }}</td>
                </tr>
                @if($workLog->absenceType)
                <tr style="background: #f8f9fa;">
                    <td style="padding: 10px; border-bottom: 1px solid #e0e6ed; font-weight: 600; color: #2c3e50;">Type d'absence</td>
                    <td style="padding: 10px; border-bottom: 1px solid #e0e6ed; color: #495057;">{{ $workLog->absenceType }}</td>
                </tr>
                @endif
                @if($workLog->workType)
                <tr style="background: #ffffff;">
                    <td style="padding: 10px; border-bottom: 1px solid #e0e6ed; font-weight: 600; color: #2c3e50;">Type de travail</td>
                    <td style="padding: 10px; border-bottom: 1px solid #e0e6ed; color: #495057;">{{ $workLog->workType }}</td>
                </tr>
                @endif
                @if($workLog->workTypeDays > 0)
                <tr style="background: #f8f9fa;">
                    <td style="padding: 10px; border-bottom: 1px solid #e0e6ed; font-weight: 600; color: #2c3e50;">Jours de type de travail</td>
                    <td style="padding: 10px; border-bottom: 1px solid #e0e6ed; color: #495057;">{{ $workLog->workTypeDays }} jour(s)</td>
                </tr>
                @endif
                <tr style="background: #e8f5e9; border-top: 2px solid #4caf50;">
                    <td style="padding: 12px; font-weight: bold; color: #2c3e50; font-size: 14px;">Statut</td>
                    <td style="padding: 12px; font-weight: bold; color: #27ae60; font-size: 14px;">✅ CRA Signé et validé</td>
                </tr>
            </tbody>
        </table>
        
        <h3 style="color: #34495e; margin-top: 30px; border-top: 2px solid #3498db; padding-top: 15px;">Signatures:</h3>
        
        <table style="width: 100%; margin-top: 20px; border-collapse: separate; border-spacing: 10px;">
            <tr>
                @if(isset($signatures['consultant']) && $signatures['consultant'])
                <td style="width: 33.33%; padding: 15px; background: #f8f9fa; border-left: 4px solid #3498db; border-radius: 4px; vertical-align: top;">
                    <h4 style="color: #2c3e50; margin-bottom: 10px; margin-top: 0;">✓ Signature du Consultant</h4>
                    @if($signatures['consultant']['signature_data'])
                    <div style="margin: 10px 0;">
                        <img src="{{ $signatures['consultant']['signature_data'] }}" alt="Signature Consultant" style="max-width: 100%; max-height: 100px; border: 1px solid #ddd; padding: 5px; background: #fff;" />
                    </div>
                    @endif
                    <p style="color: #7f8c8d; font-size: 12px; margin-top: 5px; margin-bottom: 0;">
                        Signé le: <strong>{{ \Carbon\Carbon::parse($signatures['consultant']['signed_at'])->locale('fr')->isoFormat('D MMMM YYYY à HH:mm') }}</strong>
                    </p>
                </td>
                @endif
                
                @if(isset($signatures['client']) && $signatures['client'])
                <td style="width: 33.33%; padding: 15px; background: #f8f9fa; border-left: 4px solid #27ae60; border-radius: 4px; vertical-align: top;">
                    <h4 style="color: #2c3e50; margin-bottom: 10px; margin-top: 0;">✓ Signature du Client</h4>
                    @if($signatures['client']['signature_data'])
                    <div style="margin: 10px 0;">
                        <img src="{{ $signatures['client']['signature_data'] }}" alt="Signature Client" style="max-width: 100%; max-height: 100px; border: 1px solid #ddd; padding: 5px; background: #fff;" />
                    </div>
                    @endif
                    <p style="color: #7f8c8d; font-size: 12px; margin-top: 5px; margin-bottom: 0;">
                        Signé le: <strong>{{ \Carbon\Carbon::parse($signatures['client']['signed_at'])->locale('fr')->isoFormat('D MMMM YYYY à HH:mm') }}</strong>
                    </p>
                </td>
                @endif
                
                @if(isset($signatures['manager']) && $signatures['manager'])
                <td style="width: 33.33%; padding: 15px; background: #f8f9fa; border-left: 4px solid #e74c3c; border-radius: 4px; vertical-align: top;">
                    <h4 style="color: #2c3e50; margin-bottom: 10px; margin-top: 0;">✓ Signature du Manager</h4>
                    @if($signatures['manager']['signature_data'])
                    <div style="margin: 10px 0;">
                        <img src="{{ $signatures['manager']['signature_data'] }}" alt="Signature Manager" style="max-width: 100%; max-height: 100px; border: 1px solid #ddd; padding: 5px; background: #fff;" />
                    </div>
                    @endif
                    <p style="color: #7f8c8d; font-size: 12px; margin-top: 5px; margin-bottom: 0;">
                        Signé le: <strong>{{ \Carbon\Carbon::parse($signatures['manager']['signed_at'])->locale('fr')->isoFormat('D MMMM YYYY à HH:mm') }}</strong>
                    </p>
                </td>
                @endif
            </tr>
        </table>
        
        <p style="margin-top: 30px; padding: 15px; background: #e8f5e9; border-left: 4px solid #4caf50; border-radius: 4px;">
            <strong>✅ Toutes les signatures sont complètes!</strong><br>
            Le document signé complet est disponible en pièce jointe de cet email.
        </p>
        
        <p style="margin-top: 20px;">
            Cordialement,<br>
            L'équipe OncreeSaaS
        </p>
    </div>
</body>
</html>



