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
        
        <h3 style="color: #34495e; margin-top: 30px; border-top: 2px solid #3498db; padding-top: 15px;">Signatures:</h3>
        
        <div style="margin-top: 20px;">
            @if(isset($signatures['consultant']) && $signatures['consultant'])
            <div style="margin-bottom: 25px; padding: 15px; background: #f8f9fa; border-left: 4px solid #3498db; border-radius: 4px;">
                <h4 style="color: #2c3e50; margin-bottom: 10px;">✓ Signature du Consultant</h4>
                @if($signatures['consultant']['signature_data'])
                <div style="margin: 10px 0;">
                    <img src="{{ $signatures['consultant']['signature_data'] }}" alt="Signature Consultant" style="max-width: 250px; max-height: 100px; border: 1px solid #ddd; padding: 5px; background: #fff;" />
                </div>
                @endif
                <p style="color: #7f8c8d; font-size: 12px; margin-top: 5px;">
                    Signé le: <strong>{{ \Carbon\Carbon::parse($signatures['consultant']['signed_at'])->locale('fr')->isoFormat('D MMMM YYYY à HH:mm') }}</strong>
                </p>
            </div>
            @endif
            
            @if(isset($signatures['client']) && $signatures['client'])
            <div style="margin-bottom: 25px; padding: 15px; background: #f8f9fa; border-left: 4px solid #27ae60; border-radius: 4px;">
                <h4 style="color: #2c3e50; margin-bottom: 10px;">✓ Signature du Client</h4>
                @if($signatures['client']['signature_data'])
                <div style="margin: 10px 0;">
                    <img src="{{ $signatures['client']['signature_data'] }}" alt="Signature Client" style="max-width: 250px; max-height: 100px; border: 1px solid #ddd; padding: 5px; background: #fff;" />
                </div>
                @endif
                <p style="color: #7f8c8d; font-size: 12px; margin-top: 5px;">
                    Signé le: <strong>{{ \Carbon\Carbon::parse($signatures['client']['signed_at'])->locale('fr')->isoFormat('D MMMM YYYY à HH:mm') }}</strong>
                </p>
            </div>
            @endif
            
            @if(isset($signatures['manager']) && $signatures['manager'])
            <div style="margin-bottom: 25px; padding: 15px; background: #f8f9fa; border-left: 4px solid #e74c3c; border-radius: 4px;">
                <h4 style="color: #2c3e50; margin-bottom: 10px;">✓ Signature du Manager</h4>
                @if($signatures['manager']['signature_data'])
                <div style="margin: 10px 0;">
                    <img src="{{ $signatures['manager']['signature_data'] }}" alt="Signature Manager" style="max-width: 250px; max-height: 100px; border: 1px solid #ddd; padding: 5px; background: #fff;" />
                </div>
                @endif
                <p style="color: #7f8c8d; font-size: 12px; margin-top: 5px;">
                    Signé le: <strong>{{ \Carbon\Carbon::parse($signatures['manager']['signed_at'])->locale('fr')->isoFormat('D MMMM YYYY à HH:mm') }}</strong>
                </p>
            </div>
            @endif
        </div>
        
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



