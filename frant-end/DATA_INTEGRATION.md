# Intégration des Données Backend - Frontend

## Vue d'ensemble

Ce guide explique comment les données des projets et consultants sont maintenant récupérées depuis le backend au lieu d'utiliser des données mock.

## Hooks créés

### 1. `useProjects` (`hooks/use-projects.ts`)

Hook pour récupérer la liste des projets depuis l'API.

```tsx
import { useProjects } from '@/hooks/use-projects'

function MyComponent() {
  const { projects, loading, error, refetch } = useProjects()
  
  if (loading) return <div>Chargement...</div>
  if (error) return <div>Erreur: {error}</div>
  
  return (
    <div>
      {projects.map(project => (
        <div key={project.id}>{project.name}</div>
      ))}
    </div>
  )
}
```

### 2. `useConsultants` (`hooks/use-consultants.ts`)

Hook pour récupérer la liste des consultants depuis l'API.

```tsx
import { useConsultants } from '@/hooks/use-consultants'

function MyComponent() {
  const { consultants, loading, error, refetch } = useConsultants()
  
  if (loading) return <div>Chargement...</div>
  if (error) return <div>Erreur: {error}</div>
  
  return (
    <div>
      {consultants.map(consultant => (
        <div key={consultant.id}>{consultant.name}</div>
      ))}
    </div>
  )
}
```

## Modifications du Dashboard

### Statistiques mises à jour

Les statistiques dans le header du dashboard utilisent maintenant les vraies données :

- **Projets actifs** : `projects.filter(p => p.start_date && !p.end_date).length`
- **Consultants actifs** : `consultants.filter(c => c.status === 'active').length`

### Tableau des consultants

Le tableau affiche maintenant :
- Nom et email du consultant
- Rôle (Consultant)
- Compétences
- Tarif journalier
- Statut (Actif/Inactif)
- Actions (Voir, Modifier, Supprimer)

### Section des projets

Les cartes de projets affichent :
- Nom du projet
- Description
- Date de début et fin
- Statut calculé automatiquement
- Client ID

## Gestion des états

### États de chargement
- Indicateurs de chargement pour chaque section
- Messages d'erreur avec boutons de retry
- États vides gérés proprement

### Gestion des erreurs
- Affichage des erreurs API
- Boutons pour réessayer les requêtes
- Fallback gracieux en cas d'erreur

## Données de test

### Seeders créés

1. **ClientSeeder** : Crée des clients de test
2. **ConsultantSeeder** : Crée des consultants avec différents statuts
3. **ProjectSeeder** : Crée des projets avec différents états

### Commandes pour les données de test

```bash
# Lancer les migrations et seeders
cd back-end
php artisan migrate
php artisan db:seed

# Ou lancer un seeder spécifique
php artisan db:seed --class=ClientSeeder
php artisan db:seed --class=ConsultantSeeder
php artisan db:seed --class=ProjectSeeder
```

### Données de test disponibles

**Consultants :**
- Marie Dubois (Design, UX/UI) - Actif
- Jean Martin (Développement) - Actif
- Sophie Laurent (Gestion de projet) - Actif
- Pierre Moreau (Analyse de données) - Inactif

**Projets :**
- Refonte E-commerce (Terminé)
- Développement Application Mobile (En cours)
- Analyse de Données (Terminé)
- Migration Cloud (En attente)

## API Endpoints utilisés

- `GET /api/projects` - Liste des projets
- `GET /api/consultants` - Liste des consultants
- `GET /api/client/me` - Informations du client connecté

## Authentification

Toutes les requêtes incluent automatiquement le token d'authentification via les intercepteurs Axios configurés dans `lib/api.ts`.

## Prochaines étapes

1. **Work Schedules** : Intégrer les données de planning de travail
2. **Assignments** : Afficher les assignations consultants-projets
3. **Factures** : Intégrer les données de facturation
4. **Filtres** : Ajouter des filtres par statut, date, etc.
5. **Pagination** : Gérer la pagination pour de grandes listes
