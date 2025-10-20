# Pages de Récupération de Mot de Passe

## Vue d'ensemble

Ce guide explique les pages de récupération de mot de passe créées pour l'application.

## Pages créées

### 1. **Page Mot de Passe Oublié** (`/forgot-password`)

**Fichier** : `app/forgot-password/page.tsx`

#### Fonctionnalités
- **Formulaire d'email** : Saisie de l'adresse email
- **Validation** : Vérification du format email
- **Simulation API** : Appel simulé pour l'envoi d'email
- **Page de succès** : Confirmation d'envoi avec instructions
- **Navigation** : Liens vers login et possibilité de réessayer

#### États
- **Formulaire** : Saisie de l'email
- **Envoi** : Indicateur de chargement pendant l'envoi
- **Succès** : Confirmation avec instructions
- **Erreur** : Affichage des erreurs

#### Design
- **Icône** : `Mail` pour l'email
- **Couleurs** : Thème principal avec `bg-primary`
- **Animations** : Transitions fluides avec Framer Motion

### 2. **Page Réinitialisation** (`/reset-password`)

**Fichier** : `app/reset-password/page.tsx`

#### Fonctionnalités
- **Token validation** : Vérification du token dans l'URL
- **Nouveau mot de passe** : Saisie du nouveau mot de passe
- **Confirmation** : Vérification de la correspondance des mots de passe
- **Visibilité** : Basculement show/hide pour les mots de passe
- **Validation** : Minimum 6 caractères, correspondance des mots de passe

#### États
- **Token invalide** : Message d'erreur si token manquant
- **Formulaire** : Saisie des mots de passe
- **Envoi** : Indicateur de chargement
- **Succès** : Confirmation et redirection vers login

#### Design
- **Icône** : `Lock` pour la sécurité
- **Couleurs** : Thème principal avec `bg-primary`
- **Animations** : Transitions fluides avec Framer Motion

## Flux utilisateur

### 1. **Demande de réinitialisation**
```
Login → "Mot de passe oublié ?" → /forgot-password
```

### 2. **Processus de réinitialisation**
```
/forgot-password → Email envoyé → Email reçu → /reset-password?token=xxx
```

### 3. **Finalisation**
```
/reset-password → Mot de passe mis à jour → /login
```

## Intégration avec le backend

### **Endpoints nécessaires**

#### 1. **Demande de réinitialisation**
```http
POST /api/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Réponse** :
```json
{
  "message": "Email de réinitialisation envoyé",
  "success": true
}
```

#### 2. **Réinitialisation du mot de passe**
```http
POST /api/reset-password
Content-Type: application/json

{
  "token": "reset_token_here",
  "password": "new_password"
}
```

**Réponse** :
```json
{
  "message": "Mot de passe mis à jour avec succès",
  "success": true
}
```

### **Variables d'environnement nécessaires**

```env
# Configuration email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Configuration JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1h

# URL frontend
FRONTEND_URL=http://localhost:3000
```

## Sécurité

### **Token de réinitialisation**
- **Expiration** : 1 heure maximum
- **Usage unique** : Token invalidé après utilisation
- **Format** : JWT avec payload minimal
- **Stockage** : Base de données avec timestamp

### **Validation des mots de passe**
- **Longueur minimum** : 6 caractères
- **Correspondance** : Vérification côté client et serveur
- **Hachage** : Utilisation de bcrypt ou équivalent

### **Protection contre les attaques**
- **Rate limiting** : Limitation des tentatives par IP
- **Validation email** : Vérification de l'existence de l'email
- **Logs** : Enregistrement des tentatives de réinitialisation

## Personnalisation

### **Emails**
- **Template** : Personnalisable avec variables
- **Design** : Responsive et professionnel
- **Contenu** : Instructions claires et lien sécurisé

### **Pages**
- **Thème** : Cohérent avec l'application
- **Responsive** : Adaptation mobile/desktop
- **Accessibilité** : Support des lecteurs d'écran

## Tests

### **Scénarios de test**
1. **Email valide** : Envoi réussi
2. **Email invalide** : Gestion des erreurs
3. **Token valide** : Réinitialisation réussie
4. **Token expiré** : Gestion de l'expiration
5. **Mots de passe différents** : Validation côté client

### **Tests automatisés**
```javascript
// Exemple de test
describe('Password Recovery', () => {
  it('should send reset email for valid email', async () => {
    const response = await request(app)
      .post('/api/forgot-password')
      .send({ email: 'test@example.com' })
      .expect(200)
    
    expect(response.body.success).toBe(true)
  })
})
```

## Déploiement

### **Configuration production**
- **HTTPS** : Obligatoire pour la sécurité
- **CORS** : Configuration appropriée
- **Rate limiting** : Protection contre les abus
- **Monitoring** : Surveillance des tentatives

### **Maintenance**
- **Nettoyage** : Suppression des tokens expirés
- **Logs** : Rotation et archivage
- **Monitoring** : Alertes en cas d'anomalies

## Prochaines étapes

1. **Implémentation backend** : Création des endpoints API
2. **Configuration email** : Intégration SMTP
3. **Tests** : Tests unitaires et d'intégration
4. **Monitoring** : Surveillance et alertes
5. **Documentation** : Guide utilisateur













