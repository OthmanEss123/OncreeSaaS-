# Connexion du Journal de Travail avec le Backend

## 📋 Vue d'ensemble

Le tableau "Journal de Travail" dans le dashboard consultant est connecté au backend avec une **méthode normale et directe** utilisant l'API REST.

## 🔄 Flux de données

### 1. Frontend → Backend

```typescript
// Méthode normale avec fetch()
const loadWorkLogsFromBackend = async () => {
  const token = localStorage.getItem('authToken')
  
  const response = await fetch('http://localhost:8000/api/work-logs-grouped', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  })
  
  const result = await response.json()
  const workLogsData = result.data
  
  setWorkLogs(workLogsData)
}
```

### 2. Backend (Laravel)

**Endpoint:** `GET /api/work-logs-grouped`

**Contrôleur:** `WorkScheduleController@getWorkLogsGroupedByMonth`

**Fichier:** `back-end/app/Http/Controllers/WorkScheduleController.php`

```php
public function getWorkLogsGroupedByMonth(Request $request)
{
    $consultant = $request->user();
    
    // Récupérer tous les work schedules du consultant
    $schedules = WorkSchedule::where('consultant_id', $consultant->id)
        ->with(['workType', 'leaveType'])
        ->orderBy('year', 'desc')
        ->orderBy('month', 'desc')
        ->get();

    // Grouper par mois
    $groupedData = $schedules->groupBy(function ($schedule) {
        return $schedule->year . '-' . str_pad($schedule->month, 2, '0', STR_PAD_LEFT);
    });

    // Retourner les données groupées
    return response()->json([
        'success' => true,
        'data' => $result
    ]);
}
```

## 📊 Structure des données

### Réponse de l'API

```json
{
  "success": true,
  "data": [
    {
      "id": "2025-10",
      "month": 10,
      "year": 2025,
      "monthName": "octobre 2025",
      "daysWorked": 20.5,
      "weekendWork": 2.0,
      "absences": 1.0,
      "workTypeDays": 5.5,
      "absenceType": "Congé payé",
      "workType": "Développement projet client",
      "details": [...]
    }
  ]
}
```

### Affichage dans le tableau

| Colonne | Donnée source |
|---------|---------------|
| Mois | `monthName` |
| Jours de travail | `daysWorked` |
| Weekend travaillé | `weekendWork` |
| Type d'absence | `absenceType` |
| Jours d'absence | `absences` |
| Type de travail | `workType` |
| Jours de type de travail | `workTypeDays` |

## 🔐 Authentification

- **Méthode:** Bearer Token
- **Token:** Stocké dans `localStorage.getItem('authToken')`
- **Header:** `Authorization: Bearer ${token}`

## 🔄 Rafraîchissement des données

### Automatique
1. Au chargement de la page (`useEffect` au montage)
2. Quand la fenêtre regagne le focus (`window focus event`)

### Manuel
- Bouton "Actualiser" dans l'interface
- Appelle directement `loadWorkLogsFromBackend()`

## 📝 Avantages de cette méthode

✅ **Simple et directe** - Utilise fetch() natif
✅ **Pas de cache complexe** - Données toujours à jour
✅ **Facile à déboguer** - Console logs clairs
✅ **Contrôle total** - Gestion manuelle des erreurs
✅ **Transparente** - Voir exactement ce qui est envoyé/reçu

## 🛠️ Comment tester

1. **Ouvrir la console du navigateur** (F12)
2. **Aller sur le dashboard consultant**
3. **Observer les logs:**
   ```
   📥 Chargement du Journal de Travail depuis le backend...
   ✅ Données reçues: [...]
   ✅ Journal de Travail chargé: X mois
   ```
4. **Cliquer sur "Actualiser"** pour recharger manuellement

## 🔧 Fichiers concernés

### Frontend
- `frant-end/app/consultant/dashboard/page.tsx` - Composant principal
- Fonction: `loadWorkLogsFromBackend()`

### Backend
- `back-end/app/Http/Controllers/WorkScheduleController.php` - Contrôleur
- Méthode: `getWorkLogsGroupedByMonth()`
- Route: `back-end/routes/api.php` - Route API

### Route API
```php
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/work-logs-grouped', [WorkScheduleController::class, 'getWorkLogsGroupedByMonth']);
});
```

## 🚨 Gestion des erreurs

```typescript
try {
  // Appel API
} catch (error) {
  console.error('❌ Erreur lors du chargement:', error)
  setWorkLogs([]) // Tableau vide en cas d'erreur
}
```

## 📌 Notes importantes

- Les données sont groupées par mois côté backend
- Le consultant ne voit que ses propres données
- L'authentification est requise (middleware `auth:sanctum`)
- Les données incluent les détails de chaque jour du mois

















