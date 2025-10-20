# Test de la Récupération de Mot de Passe

## 🚀 **Démarrage rapide**

### 1. **Démarrer le backend Laravel**
```bash
cd back-end
php artisan serve
# Le serveur sera disponible sur http://localhost:8000
```

### 2. **Démarrer le frontend Next.js**
```bash
cd frant-end
npm run dev
# Le serveur sera disponible sur http://localhost:3000
```

### 3. **S'assurer que la base de données est configurée**
```bash
cd back-end
php artisan migrate
php artisan db:seed
```

## 🧪 **Tests à effectuer**

### **Test 1: Page de mot de passe oublié**

1. **Accéder à la page** : `http://localhost:3000/forgot-password`
2. **Tester avec un email valide** : `jean.dupont@trocair.com`
3. **Vérifier** :
   - ✅ Le formulaire se soumet sans erreur
   - ✅ Un message de succès s'affiche
   - ✅ L'URL de réinitialisation est loggée dans Laravel (console)

### **Test 2: Page de réinitialisation**

1. **Obtenir un token** : Vérifier les logs Laravel pour l'URL de réinitialisation
2. **Accéder à l'URL** : `http://localhost:3000/reset-password?token=VOTRE_TOKEN`
3. **Tester la réinitialisation** :
   - ✅ Saisir un nouveau mot de passe
   - ✅ Confirmer le mot de passe
   - ✅ Vérifier que la réinitialisation fonctionne

### **Test 3: Gestion des erreurs**

1. **Email inexistant** : `inexistant@example.com`
   - ✅ Message d'erreur approprié
2. **Token invalide** : `http://localhost:3000/reset-password?token=invalid`
   - ✅ Message d'erreur approprié
3. **Mots de passe différents** : Dans le formulaire de réinitialisation
   - ✅ Validation côté client

## 🔍 **Vérification des logs**

### **Backend Laravel**
```bash
cd back-end
tail -f storage/logs/laravel.log
```

**Logs attendus** :
```
[2024-01-XX XX:XX:XX] local.INFO: Password reset email sent to jean.dupont@trocair.com
[2024-01-XX XX:XX:XX] local.INFO: Reset URL: http://localhost:3000/reset-password?token=XXXXX
```

### **Frontend Next.js**
Ouvrir la console du navigateur (F12) et vérifier :
- ✅ Pas d'erreurs JavaScript
- ✅ Requêtes API réussies (Network tab)
- ✅ Messages d'erreur appropriés

## 🐛 **Dépannage**

### **Problème : "Network Error" ou "CORS Error"**

**Solution** :
1. Vérifier que le backend Laravel est démarré sur le port 8000
2. Vérifier la configuration CORS dans `back-end/config/cors.php`
3. Vérifier l'URL de l'API dans `frant-end/lib/api.ts`

### **Problème : "Token invalide"**

**Solution** :
1. Vérifier que le token n'a pas expiré (1 heure)
2. Vérifier que le token n'a pas déjà été utilisé
3. Vérifier les logs Laravel pour voir si le token est stocké

### **Problème : "Email non trouvé"**

**Solution** :
1. Vérifier que les seeders ont été exécutés : `php artisan db:seed`
2. Vérifier que l'email existe dans la base de données
3. Vérifier que le champ email est correct (contact_email pour les clients)

## 📧 **Emails de test disponibles**

Après avoir exécuté les seeders, ces emails sont disponibles :

| Email | Type | Mot de passe |
|-------|------|--------------|
| `jean.dupont@trocair.com` | Client | `password123` |
| `marie.martin@techcorp.com` | Client | `password123` |

## 🔧 **Configuration avancée**

### **Variables d'environnement**

**Backend** (`.env`) :
```env
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000
CACHE_DRIVER=file
```

**Frontend** (`.env.local`) :
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### **Configuration email (optionnel)**

Pour un vrai envoi d'email, configurer dans `.env` :
```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
```

## ✅ **Checklist de validation**

- [ ] Backend Laravel démarré sur port 8000
- [ ] Frontend Next.js démarré sur port 3000
- [ ] Base de données migrée et seedée
- [ ] Page `/forgot-password` accessible
- [ ] Formulaire d'email fonctionne
- [ ] Email valide retourne un succès
- [ ] Email invalide retourne une erreur
- [ ] Page `/reset-password` accessible avec token
- [ ] Réinitialisation de mot de passe fonctionne
- [ ] Gestion des erreurs appropriée
- [ ] Logs Laravel fonctionnent
- [ ] Console frontend sans erreurs

## 🎯 **Prochaines étapes**

1. **Intégration email réelle** : Configurer SMTP pour l'envoi d'emails
2. **Tests automatisés** : Créer des tests unitaires
3. **Sécurité** : Ajouter rate limiting et validation
4. **Monitoring** : Ajouter des métriques et alertes
5. **Documentation** : Guide utilisateur final













