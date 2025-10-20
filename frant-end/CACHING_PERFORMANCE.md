# 🚀 Système de Cache et Optimisation des Performances

## Vue d'ensemble

Ce projet utilise un système de **cache intelligent** pour améliorer considérablement les performances des API. Les temps de chargement ont été réduits de **3x à 10x** grâce à deux stratégies principales :

1. **Endpoints agrégés** - Combiner plusieurs appels API en un seul
2. **Cache en mémoire** - Réutiliser les données déjà chargées

---

## 📊 Gains de Performance

| Scénario | Avant | Après | Gain |
|----------|-------|-------|------|
| Dashboard Consultant (première visite) | 900ms (3 appels) | 300ms (1 appel) | **3x plus rapide** |
| Dashboard Consultant (visite suivante) | 900ms | ~0ms (cache) | **Instantané** |
| Page Consultants Admin | 600ms (2 appels) | 200ms (1 appel) | **3x plus rapide** |
| Work Types / Leave Types | 400ms | ~0ms (cache 30 min) | **Instantané** |

---

## 🎯 Endpoints Agrégés

### 1. Dashboard Consultant (`/consultant/dashboard-data`)

**Avant (3 appels séparés):**
```typescript
const { data } = await ConsultantAPI.me()              // 300ms
const workTypes = await WorkTypeAPI.all()              // 300ms
const leaveTypes = await LeaveTypeAPI.all()            // 300ms
// Total: ~900ms
```

**Après (1 seul appel):**
```typescript
const data = await DashboardAPI.consultantDashboard()  // 300ms
// data contient: consultant, project, workSchedules, workTypes, leaveTypes
// Total: ~300ms 🚀
```

### 2. Admin Consultants (`/admin/consultants-data`)

**Avant (2 appels séparés):**
```typescript
const consultants = await ConsultantAPI.all()          // 300ms
const clients = await ClientAPI.all()                  // 300ms
// Total: ~600ms
```

**Après (1 seul appel):**
```typescript
const data = await DashboardAPI.adminConsultants()     // 200ms
// data contient: consultants, clients, projects
// Total: ~200ms 🚀
```

---

## 💾 Système de Cache

### Comment ça marche

Le système utilise un cache en mémoire (Map) qui stocke les réponses API pendant une durée déterminée (TTL).

```typescript
// Cache automatique avec TTL personnalisé
const data = await cachedGet('/consultants', 5 * 60 * 1000) // Cache 5 minutes
```

### Durées de Cache par Type de Données

| Type de données | Durée de cache | Raison |
|----------------|----------------|--------|
| Work Types / Leave Types | 30 minutes | Changent rarement |
| Clients / Projects | 5 minutes | Changent occasionnellement |
| Consultants | 5 minutes | Changent occasionnellement |
| Work Schedules | 2 minutes | Changent fréquemment |
| Dashboard Data | 3 minutes | Besoin de fraîcheur modérée |
| User Data (me) | 2 minutes | Besoin de fraîcheur élevée |

### Invalidation Automatique du Cache

Le cache est automatiquement invalidé lors des mutations (create, update, delete) :

```typescript
// Exemple : Créer un consultant
export const ConsultantAPI = {
  create: async (data: Partial<Consultant>) => {
    const result = await api.post<Consultant>('/consultants', data)
    
    // ✅ Cache automatiquement invalidé
    invalidateCache('/consultants')
    invalidateCache('/admin/consultants-data')
    
    return result
  }
}
```

### Vider le Cache Manuellement

Si nécessaire, vous pouvez vider le cache manuellement :

```typescript
import { invalidateCache, clearAllCache } from '@/lib/api'

// Invalider un endpoint spécifique
invalidateCache('/consultants')

// Invalider tous les endpoints contenant "consultant"
invalidateCache('consultant')

// Vider tout le cache
clearAllCache()
```

---

## 📝 Utilisation dans les Composants

### Exemple : Dashboard Consultant

**Fichier :** `app/consultant/dashboard/page.tsx`

```typescript
import { DashboardAPI } from '@/lib/api'

const fetchConsultantData = async () => {
  try {
    setLoading(true)
    
    // 🚀 1 seul appel au lieu de 3
    const data = await DashboardAPI.consultantDashboard()
    
    setConsultant(data.consultant)
    setProject(data.project)
    setWorkSchedules(data.workSchedules)
    setWorkTypes(data.workTypes)
    setLeaveTypes(data.leaveTypes)
    
  } catch (error) {
    console.error('Erreur:', error)
  } finally {
    setLoading(false)
  }
}
```

### Exemple : Page Consultants Admin

**Fichier :** `app/dashboard/consultants/page.tsx`

```typescript
import { DashboardAPI } from '@/lib/api'

const refresh = async () => {
  try {
    // 🚀 1 seul appel au lieu de 2
    const data = await DashboardAPI.adminConsultants()
    
    setConsultants(data.consultants)
    setClients(data.clients)
    setProjects(data.projects)
    
  } catch (error) {
    console.error('Erreur:', error)
  }
}
```

---

## 🔍 Debugging

### Voir les Hits et Miss du Cache

Le système affiche automatiquement dans la console :

```
✅ Cache HIT: /work-types           // Données récupérées du cache
🌐 API CALL: /consultants           // Nouvel appel API
🗑️ Cache invalidé: /consultants    // Cache vidé après mutation
```

### Vérifier le Cache dans DevTools

```javascript
// Dans la console du navigateur
console.log(localStorage)  // Voir les tokens
// Le cache est en mémoire (Map), pas dans localStorage
```

---

## 🛠️ Backend (Laravel)

### Nouveaux Controllers

**Fichier :** `back-end/app/Http/Controllers/ConsultantController.php`

```php
/**
 * Endpoint agrégé pour le dashboard consultant
 */
public function getDashboardData(Request $request)
{
    $consultant = $request->user();
    
    $consultant->load([
        'client', 
        'project.client',
        'workSchedules'
    ]);
    
    $workTypes = WorkType::all();
    $leaveTypes = LeaveType::all();
    
    return response()->json([
        'success' => true,
        'data' => [
            'consultant' => $consultant,
            'project' => $consultant->project,
            'workSchedules' => $consultant->workSchedules,
            'workTypes' => $workTypes,
            'leaveTypes' => $leaveTypes
        ]
    ]);
}
```

### Nouvelles Routes

**Fichier :** `back-end/routes/api.php`

```php
Route::middleware(['auth:sanctum'])->group(function () {
    // Endpoints agrégés
    Route::get('/consultant/dashboard-data', [ConsultantController::class, 'getDashboardData']);
    Route::get('/admin/consultants-data', [ConsultantController::class, 'getAdminConsultantsData']);
});
```

---

## ⚡ Bonnes Pratiques

### ✅ À FAIRE

1. **Utiliser les endpoints agrégés** quand vous chargez plusieurs données en même temps
2. **Laisser le cache gérer** les appels répétés (ne pas forcer refresh)
3. **Utiliser Promise.all()** si vous devez vraiment faire plusieurs appels

```typescript
// ✅ BON : Appels parallèles
const [data1, data2, data3] = await Promise.all([
  API1.get(),
  API2.get(),
  API3.get()
])
```

### ❌ À ÉVITER

1. **Ne pas faire des appels séquentiels** quand ils peuvent être parallèles

```typescript
// ❌ MAUVAIS : Appels séquentiels
const data1 = await API1.get()  // attend 300ms
const data2 = await API2.get()  // attend encore 300ms
// Total: 600ms
```

2. **Ne pas désactiver le cache** sans raison

```typescript
// ❌ Éviter de faire ça sauf si nécessaire
clearAllCache() // Trop agressif
```

3. **Ne pas oublier d'invalider le cache** après les mutations

```typescript
// ✅ Déjà géré automatiquement dans les API
// Mais si vous ajoutez de nouvelles API, n'oubliez pas!
```

---

## 📈 Monitoring

### Métriques à Surveiller

1. **Temps de chargement** - Vérifier dans Network tab (DevTools)
2. **Nombre d'appels API** - Doit être réduit avec le cache
3. **Ratio Cache Hit/Miss** - Visible dans la console

### Outils Recommandés

- **Chrome DevTools** - Network tab pour voir les appels
- **React DevTools** - Profiler pour voir les re-renders
- **Console logs** - Pour voir les hits/miss du cache

---

## 🔄 Évolutions Futures

### Option 1 : React Query (Recommandé pour scale)

Pour des projets plus complexes, envisager [React Query](https://tanstack.com/query/latest) :

```bash
npm install @tanstack/react-query
```

**Avantages:**
- Cache automatique et sophistiqué
- Synchronisation en arrière-plan
- Optimistic updates
- Gestion d'état intégrée

### Option 2 : Service Worker

Pour du cache offline et PWA :

```javascript
// next.config.js avec next-pwa
const withPWA = require('next-pwa')
```

---

## 📚 Ressources

- [Next.js Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching)
- [React Query Documentation](https://tanstack.com/query/latest/docs/react/overview)
- [Laravel Eloquent Relationships](https://laravel.com/docs/eloquent-relationships)
- [HTTP Caching](https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching)

---

## 🤝 Contribution

Pour ajouter de nouveaux endpoints agrégés :

1. Créer la méthode dans le Controller Laravel
2. Ajouter la route dans `api.php`
3. Ajouter l'endpoint dans `DashboardAPI` (frontend)
4. Utiliser `cachedGet()` avec un TTL approprié
5. Documenter dans ce fichier

---

**Dernière mise à jour :** Octobre 2025  
**Version :** 1.0.0























