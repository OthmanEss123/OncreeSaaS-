# Formulaire d'Ajout de Consultant

## Vue d'ensemble

Le formulaire d'ajout de consultant a été modifié pour intégrer l'authentification et l'API backend. Il utilise maintenant l'ID du client connecté pour créer des consultants associés à ce client.

## Modifications apportées

### 1. **Authentification intégrée**
- Utilisation du hook `useAuth` pour récupérer les informations du client connecté
- Redirection automatique vers `/login` si non authentifié
- Affichage du nom de l'entreprise dans le header

### 2. **Interface adaptée au modèle Consultant**
- **Ancien modèle** : `UserFormData` avec des champs génériques
- **Nouveau modèle** : `ConsultantFormData` correspondant au modèle backend

### 3. **Champs du formulaire**

#### Informations Personnelles
- **Nom complet** : `name` (requis)
- **Email** : `email` (requis, validation)
- **Téléphone** : `phone` (requis)
- **Mot de passe** : `password` (requis, min 6 caractères)
- **Adresse** : `address` (optionnel)

#### Informations Professionnelles
- **Rôle** : `role` (fixé à "Consultant")
- **Tarif journalier** : `daily_rate` (requis, > 0)
- **Statut** : `status` (actif/inactif)

#### Compétences
- **Saisie manuelle** : Zone de texte pour saisir les compétences séparées par des virgules
- **Sélection rapide** : Boutons pour sélectionner des compétences prédéfinies
- **Compétences sélectionnées** : Affichage des compétences choisies avec possibilité de suppression

### 4. **Soumission du formulaire**

```typescript
const consultantData = {
  ...formData,
  client_id: user?.id, // ID du client connecté
  skills: selectedSkills.length > 0 ? selectedSkills.join(', ') : formData.skills
}

await ConsultantAPI.create(consultantData)
```

### 5. **Gestion des états**
- **Loading** : Indicateur de chargement pendant la soumission
- **Succès** : Message de confirmation avec redirection automatique
- **Erreurs** : Affichage des erreurs de validation et d'API

## Validation

### Champs requis
- Nom complet
- Email (format valide)
- Téléphone
- Mot de passe (minimum 6 caractères)
- Tarif journalier (> 0)
- Compétences

### Messages d'erreur
- Validation côté client avant soumission
- Gestion des erreurs API avec messages utilisateur
- Affichage des erreurs de validation en temps réel

## API Integration

### Endpoint utilisé
- `POST /api/consultants` - Création d'un nouveau consultant

### Données envoyées
```json
{
  "name": "Marie Dubois",
  "email": "marie.dubois@example.com",
  "phone": "+33 6 12 34 56 78",
  "role": "Consultant",
  "skills": "React, Node.js, UI/UX Design",
  "daily_rate": 450,
  "status": "active",
  "address": "123 Rue de la Paix, 75001 Paris",
  "password": "motdepasse123",
  "client_id": 1
}
```

## Compétences disponibles

### Technologies
- React, Vue.js, Angular
- Node.js, Python, Java, PHP
- UI/UX Design, Figma, Adobe XD
- Photoshop, Illustrator

### Méthodologies
- Project Management, Agile, Scrum
- Data Analysis, SQL
- DevOps, AWS, Docker, Kubernetes
- Mobile Development

## Utilisation

1. **Accès** : Se connecter en tant que client
2. **Navigation** : Aller sur `/client/users/add`
3. **Remplissage** : Compléter le formulaire avec les informations du consultant
4. **Soumission** : Cliquer sur "Créer le Consultant"
5. **Confirmation** : Message de succès et redirection vers le dashboard

## Sécurité

- Authentification requise
- Validation côté client et serveur
- Mot de passe haché côté backend
- Association automatique au client connecté

## Prochaines étapes

1. **Validation email** : Vérification de l'unicité de l'email
2. **Upload d'avatar** : Possibilité d'ajouter une photo de profil
3. **Notifications** : Envoi d'email de bienvenue au consultant
4. **Import CSV** : Possibilité d'importer plusieurs consultants
5. **Templates** : Modèles de consultants prédéfinis













