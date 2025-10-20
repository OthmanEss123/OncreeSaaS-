<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Code de réinitialisation - OncreeSaaS</title>
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
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
        .code-container {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 10px;
            padding: 30px;
            text-align: center;
            margin: 30px 0;
        }
        .code-label {
            font-size: 14px;
            color: rgba(255, 255, 255, 0.9);
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .code {
            font-size: 42px;
            font-weight: bold;
            color: #ffffff;
            letter-spacing: 8px;
            font-family: 'Courier New', monospace;
            margin: 10px 0;
        }
        .expiry-info {
            font-size: 13px;
            color: rgba(255, 255, 255, 0.85);
            margin-top: 15px;
        }
        .warning {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .warning-text {
            font-size: 14px;
            color: #856404;
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
            color: #667eea;
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
            <h1 class="logo">🚀 OncreeSaaS</h1>
        </div>
        
        <!-- Main Content -->
        <div class="content">
            <p class="greeting">Bonjour {{ $userName }},</p>
            
            <p class="message">
                Vous avez demandé à réinitialiser votre mot de passe. 
                Utilisez le code ci-dessous pour continuer le processus de réinitialisation :
            </p>
            
            <!-- Code Display -->
            <div class="code-container">
                <div class="code-label">Votre code de réinitialisation</div>
                <div class="code">{{ $code }}</div>
                <div class="expiry-info">⏰ Ce code expire dans {{ $expiresIn }}</div>
            </div>
            
            <p class="message">
                Entrez ce code dans l'application pour créer un nouveau mot de passe.
            </p>
            
            <!-- Warning Box -->
            <div class="warning">
                <p class="warning-text">
                    <strong>⚠️ Important :</strong> Si vous n'avez pas demandé cette réinitialisation, 
                    veuillez ignorer cet email. Votre mot de passe restera inchangé.
                </p>
            </div>
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














