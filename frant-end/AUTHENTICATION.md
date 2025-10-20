# Guide d'Authentification - Frontend

## Vue d'ensemble

Ce guide explique comment utiliser le système d'authentification dans l'application frontend pour récupérer les informations du client connecté.

## Hook useAuth

Le hook `useAuth` est disponible dans `hooks/use-auth.ts` et fournit :

- `user`: Les informations du client connecté
- `loading`: État de chargement
- `error`: Message d'erreur éventuel
- `isAuthenticated`: Boolean indiquant si l'utilisateur est connecté
- `logout`: Fonction pour se déconnecter

## Utilisation dans les composants

```tsx
import { useAuth } from '@/hooks/use-auth'

export default function MyComponent() {
  const { user, loading, error, isAuthenticated, logout } = useAuth()

  if (loading) return <div>Chargement...</div>
  if (error) return <div>Erreur: {error}</div>
  if (!isAuthenticated) return <div>Non connecté</div>

  return (
    <div>
      <h1>Bonjour {user?.contact_name}</h1>
      <p>Entreprise: {user?.company_name}</p>
      <p>Email: {user?.contact_email}</p>
      <button onClick={logout}>Se déconnecter</button>
    </div>
  )
}
```

## API Backend

### Endpoints disponibles

- `POST /api/login` - Connexion
- `GET /api/client/me` - Informations du client connecté (protégé)
- `POST /api/logout` - Déconnexion (protégé)

### Structure de réponse pour `/api/client/me`

```json
{
  "id": 1,
  "company_name": "Trocair",
  "contact_name": "Jean Dupont",
  "contact_email": "jean.dupont@trocair.com",
  "contact_phone": "+33 1 23 45 67 89",
  "role": "Client",
  "address": "123 Rue de la Paix, 75001 Paris, France",
  "created_at": "2024-01-01T00:00:00.000000Z",
  "updated_at": "2024-01-01T00:00:00.000000Z"
}
```

## Configuration

### Variables d'environnement

Assurez-vous que `NEXT_PUBLIC_API_URL` est configuré dans votre fichier `.env.local` :

```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### Gestion des tokens

Les tokens d'authentification sont automatiquement :
- Ajoutés aux requêtes API via les intercepteurs Axios
- Supprimés en cas d'erreur 401 (token expiré)
- Stockés dans localStorage

## Exemple de données de test

Pour tester l'authentification, vous pouvez utiliser ces identifiants :

- **Email**: `jean.dupont@trocair.com`
- **Mot de passe**: `password123`
- **Type**: `client`

## Sécurité

- Les tokens sont automatiquement ajoutés aux requêtes
- Redirection automatique vers `/login` en cas de token expiré
- Les mots de passe ne sont jamais exposés côté client
- Utilisation de Laravel Sanctum pour la gestion des tokens













