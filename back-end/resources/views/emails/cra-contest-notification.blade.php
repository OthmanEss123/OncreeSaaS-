<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contestation de CRA - OncreeSaaS</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f4f7fa;
            margin: 0;
            padding: 0;
        }
        .email-container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }
        .header {
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            padding: 40px 20px;
            text-align: center;
        }
        .logo {
            font-size: 32px;
            font-weight: bold;
            color: #ffffff;
            margin: 0;
            letter-spacing: 1px;
        }
        .content {
            padding: 40px 30px;
        }
        .greeting {
            font-size: 18px;
            color: #333333;
            margin-bottom: 20px;
        }
        .message {
            font-size: 16px;
            color: #555555;
            line-height: 1.6;
            margin-bottom: 30px;
        }
        .alert-box {
            background-color: #fef2f2;
            border-left: 4px solid #ef4444;
            padding: 20px;
            margin: 30px 0;
            border-radius: 4px;
        }
        .alert-title {
            font-size: 18px;
            font-weight: bold;
            color: #dc2626;
            margin-bottom: 10px;
        }
        .alert-text {
            font-size: 14px;
            color: #991b1b;
            margin: 0;
        }
        .info-box {
            background-color: #f3f4f6;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
        }
        .info-item {
            margin: 10px 0;
            font-size: 14px;
            color: #374151;
        }
        .info-label {
            font-weight: bold;
            color: #111827;
        }
        .justification-box {
            background-color: #fff7ed;
            border: 1px solid #fed7aa;
            padding: 15px;
            margin: 20px 0;
            border-radius: 6px;
        }
        .justification-label {
            font-size: 14px;
            font-weight: bold;
            color: #9a3412;
            margin-bottom: 8px;
        }
        .justification-text {
            font-size: 14px;
            color: #7c2d12;
            line-height: 1.6;
            margin: 0;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 25px 30px;
            text-align: center;
            border-top: 1px solid #e9ecef;
        }
        .footer-text {
            font-size: 13px;
            color: #6c757d;
            margin: 5px 0;
        }
        .support-link {
            color: #ef4444;
            text-decoration: none;
        }
        .support-link:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header with Logo -->
        <div class="header">
            <h1 class="logo">⚠️ OncreeSaaS</h1>
        </div>
        
        <!-- Main Content -->
        <div class="content">
            <p class="greeting">Bonjour {{ $consultant->first_name }} {{ $consultant->last_name }},</p>
            
            <p class="message">
                Nous vous informons qu'un client a contesté votre Compte Rendu d'Activité (CRA) pour la période suivante.
            </p>
            
            <!-- Alert Box -->
            <div class="alert-box">
                <div class="alert-title">⚠️ Contestation de CRA</div>
                <p class="alert-text">
                    Votre CRA a été contesté par le client. Veuillez prendre connaissance des détails ci-dessous.
                </p>
            </div>
            
            <!-- Info Box -->
            <div class="info-box">
                <div class="info-item">
                    <span class="info-label">Période concernée :</span> 
                    @if($workSchedule->month && $workSchedule->year)
                        {{ \Carbon\Carbon::create($workSchedule->year, $workSchedule->month, 1)->locale('fr')->isoFormat('MMMM YYYY') }}
                    @elseif($workSchedule->date)
                        {{ \Carbon\Carbon::parse($workSchedule->date)->locale('fr')->isoFormat('D MMMM YYYY') }}
                    @else
                        N/A
                    @endif
                </div>
                @if($workSchedule->days_worked)
                <div class="info-item">
                    <span class="info-label">Jours travaillés :</span> {{ $workSchedule->days_worked }}
                </div>
                @endif
                @if($workSchedule->weekend_worked)
                <div class="info-item">
                    <span class="info-label">Week-end travaillés :</span> {{ $workSchedule->weekend_worked }}
                </div>
                @endif
                @if($workSchedule->absence_days)
                <div class="info-item">
                    <span class="info-label">Jours d'absence :</span> {{ $workSchedule->absence_days }}
                </div>
                @endif
            </div>
            
            <!-- Justification Box -->
            <div class="justification-box">
                <div class="justification-label">📝 Justification de la contestation :</div>
                <p class="justification-text">{{ $justification }}</p>
            </div>
            
            <p class="message">
                Veuillez prendre contact avec le client ou votre responsable pour résoudre cette contestation.
            </p>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <p class="footer-text">
                <strong>OncreeSaaS</strong> - Votre plateforme de gestion
            </p>
            <p class="footer-text">
                Des questions ? Contactez-nous : 
                <a href="mailto:support@oncreesaas.com" class="support-link">support@oncreesaas.com</a>
            </p>
            <p class="footer-text" style="margin-top: 15px; color: #999;">
                © {{ date('Y') }} OncreeSaaS. Tous droits réservés.
            </p>
        </div>
    </div>
</body>
</html>





























