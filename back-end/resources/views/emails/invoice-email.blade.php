<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .email-container {
            background-color: #ffffff;
            border: 1px solid #e0e6ed;
            border-radius: 8px;
            padding: 30px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 3px solid #667eea;
        }
        .header h1 {
            color: #667eea;
            margin: 0;
            font-size: 24px;
        }
        .content {
            margin-bottom: 30px;
        }
        .invoice-info {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .info-row {
            margin-bottom: 10px;
        }
        .info-label {
            font-weight: bold;
            color: #495057;
            display: inline-block;
            width: 150px;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e0e6ed;
            text-align: center;
            color: #868e96;
            font-size: 12px;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #667eea;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>Facture #{{ $facture->id }}</h1>
        </div>
        
        <div class="content">
            <p>Bonjour,</p>
            
            <p>Veuillez trouver ci-joint la facture <strong>#{{ $facture->id }}</strong> pour votre société <strong>{{ $client->company_name }}</strong>.</p>
            
            <div class="invoice-info">
                <div class="info-row">
                    <span class="info-label">Date de facture :</span>
                    {{ $factureDate }}
                </div>
                @if($dueDate)
                <div class="info-row">
                    <span class="info-label">Date d'échéance :</span>
                    {{ $dueDate }}
                </div>
                @endif
                <div class="info-row">
                    <span class="info-label">Montant total :</span>
                    <strong>{{ number_format($total ?? 0, 2) }} €</strong>
                </div>
                @if($items && $items->count() > 0)
                <div class="info-row">
                    <span class="info-label">Nombre d'articles :</span>
                    {{ $items->count() }}
                </div>
                @endif
            </div>
            
            <p>Le document PDF de la facture est joint à cet email. Pour toute question concernant cette facture, n'hésitez pas à nous contacter.</p>
            
            <p>Cordialement,<br>
            L'équipe OncreeSaaS</p>
        </div>
        
        <div class="footer">
            <p>Ce message a été généré automatiquement.</p>
            <p>© {{ date('Y') }} OncreeSaaS - Tous droits réservés</p>
        </div>
    </div>
</body>
</html>






















