# Guide MFA - Diagnostic et Résolution

## Problème: Le login passe directement sans demander le code MFA

### Étape 1: Vérifier le statut MFA pour un utilisateur

```bash
cd back-end
php check-mfa-status.php email@example.com
```

Ou de manière interactive:
```bash
php check-mfa-status.php
# Entrer l'email quand demandé
```

### Étape 2: Activer le MFA pour un utilisateur

Si le MFA n'est pas activé, exécutez:

```bash
cd back-end
php enable-mfa.php email@example.com
```

Ou de manière interactive:
```bash
php enable-mfa.php
# Entrer l'email quand demandé
```

### Étape 3: Vérifier les logs lors du login

En développement, les logs MFA sont écrits dans `storage/logs/laravel.log`:

```bash
cd back-end
tail -f storage/logs/laravel.log
```

Puis essayez de vous connecter. Vous devriez voir:
```
MFA Check: {
    "user_type": "client",
    "user_id": 1,
    "user_email": "email@example.com",
    "setting_exists": true,
    "setting_enabled": true
}
```

### Étape 4: Vérifier directement dans la base de données

```bash
cd back-end
php artisan tinker
```

Puis dans tinker:
```php
// Pour un Client
$user = App\Models\Client::where('contact_email', 'email@example.com')->first();
$setting = $user->twoFactorSetting()->first();
dd($setting);

// Vérifier directement dans la DB
$setting = App\Models\TwoFactorSetting::where('mfaable_type', 'App\Models\Client')
    ->where('mfaable_id', $user->id)
    ->first();
dd($setting);
```

### Étape 5: Créer manuellement un setting MFA

Si nécessaire, vous pouvez créer manuellement:

```bash
cd back-end
php artisan tinker
```

```php
// Pour un Client
$user = App\Models\Client::where('contact_email', 'email@example.com')->first();
App\Models\TwoFactorSetting::create([
    'mfaable_type' => get_class($user),
    'mfaable_id' => $user->id,
    'channel' => 'email',
    'enabled' => true,
]);

// Vérifier
$user->twoFactorSetting()->first();
```

### Étape 6: Vérifier la configuration email

Assurez-vous que la configuration email est correcte dans `.env`:

```env
MAIL_MAILER=smtp
MAIL_HOST=sandbox.smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=votre_username
MAIL_PASSWORD=votre_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="noreply@oncreesaas.com"
MAIL_FROM_NAME="OncreeSaaS"
```

Puis vider le cache:
```bash
php artisan config:clear
php artisan cache:clear
```

### Étape 7: Tester le login

1. Se connecter avec un utilisateur ayant MFA activé
2. Vérifier la console du navigateur (F12) pour voir la réponse de l'API
3. En développement, le code MFA peut être retourné dans la réponse JSON
4. Vérifier les logs Laravel pour voir si le code est envoyé

### Problèmes courants

#### 1. Le MFA n'est pas activé pour l'utilisateur
**Solution:** Utiliser `php enable-mfa.php email@example.com`

#### 2. Le setting existe mais `enabled = false`
**Solution:** Mettre à jour le setting:
```php
$setting = $user->twoFactorSetting()->first();
$setting->enabled = true;
$setting->save();
```

#### 3. La relation `twoFactorSetting()` ne fonctionne pas
**Solution:** Vérifier que le modèle a bien la méthode:
```php
public function twoFactorSetting()
{
    return $this->morphOne(TwoFactorSetting::class, 'mfaable');
}
```

#### 4. L'email n'est pas envoyé
**Solution:** 
- Vérifier la configuration email dans `.env`
- Vérifier les logs Laravel: `storage/logs/laravel.log`
- En développement, le code est loggé dans les logs

#### 5. Le code MFA n'apparaît pas dans la réponse
**Solution:** 
- En développement (`APP_ENV=local`), le code est retourné dans la réponse JSON
- Vérifier la console du navigateur (F12) → Network → Login request → Response
- Vérifier les logs Laravel pour voir le code

### Commandes rapides

```bash
# Vérifier le statut MFA
php check-mfa-status.php email@example.com

# Activer le MFA
php enable-mfa.php email@example.com

# Vérifier les logs
tail -f storage/logs/laravel.log

# Vider le cache
php artisan config:clear
php artisan cache:clear
```









