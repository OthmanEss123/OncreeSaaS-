<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #3b82f6;">Rapport de Travail Mensuel</h2>
        
        <p>Bonjour,</p>
        
        <p>Veuillez trouver ci-joint le rapport de travail de <strong>{{ $consultant->name }}</strong> pour le mois de <strong>{{ $monthName }}</strong>.</p>
        
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #3b82f6;">Résumé</h3>
            <ul style="list-style: none; padding: 0;">
                <li>📅 Jours travaillés : <strong>{{ $totalDaysWorked }}</strong></li>
                <li>📁 Projet : <strong>{{ $project->name }}</strong></li>
            </ul>
        </div>
        
        <p>Pour plus de détails, veuillez consulter le document PDF joint.</p>
        
        <p>Cordialement,<br>
        {{ $consultant->name }}</p>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="font-size: 12px; color: #666;">Ce message a été généré automatiquement.</p>
    </div>
</body>
</html>













