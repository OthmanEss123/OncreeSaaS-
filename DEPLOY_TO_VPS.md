# Guide de Déploiement sur VPS via SSH

## 🚀 Déployer les changements sur le VPS

### Étape 1 : Connexion SSH au serveur
```bash
ssh root@31.97.197.2
```

### Étape 2 : Naviguer vers le projet
```bash
cd /path/to/OncreeSaaS
# Ou si vous ne connaissez pas le chemin exact :
# cd ~
# find . -name "OncreeSaaS" -type d 2>/dev/null
```

### Étape 3 : Vérifier l'état Git
```bash
git status
git branch
```

### Étape 4 : Sauvegarder les modifications locales (si nécessaire)
```bash
# Si vous avez des modifications locales non commitées :
git stash save "Backup avant pull"
```

### Étape 5 : Tirer les changements depuis GitHub
```bash
git pull origin main
```

**Résultat attendu :**
```
remote: Enumerating objects: 18, done.
remote: Counting objects: 100% (18/18), done.
...
From https://github.com/OthmanEss123/OncreeSaaS-
   50dbaea..7de8578  main -> main
Updating 50dbaea..7de8578
Fast-forward
 back-end/config/auth.php           | 5 +++++
 back-end/config/database.php       | 3 +++
 back-end/routes/api.php            | 50 ++++++++++++++++++++++++++++++++----
 docker-compose.yml                 | 10 +++----
 back-end/DATABASE_FIX_SUMMARY.md   | 93 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 5 files changed, 161 insertions(+), 28 deletions(-)
```

### Étape 6 : Créer/Vérifier le fichier .env (racine du projet)
```bash
# Vérifier si le fichier existe
ls -la .env

# Si le fichier n'existe pas, le créer :
nano .env
```

**Contenu du fichier `.env` (racine) :**
```env
# Docker Compose Environment Variables
APP_ENV=production
APP_DEBUG=false
APP_KEY=votre_app_key_ici

# Database Settings
DB_CONNECTION=mysql
DB_HOST=host.docker.internal
DB_PORT=3306
DB_DATABASE=back-end
DB_USERNAME=root
DB_PASSWORD=votre_mot_de_passe_mysql
```

**Important :** Copiez l'APP_KEY depuis `back-end/.env` :
```bash
cat back-end/.env | grep APP_KEY
```

Sauvegardez avec `Ctrl+O`, `Enter`, puis `Ctrl+X`

### Étape 7 : Vérifier les variables d'environnement du backend
```bash
cat back-end/.env | grep DB_
```

Assurez-vous que :
- `DB_HOST=127.0.0.1` (si MySQL sur l'hôte)
- `DB_DATABASE=back-end`
- `DB_USERNAME=root`
- `DB_PASSWORD=...` (votre mot de passe)

### Étape 8 : Redémarrer les containers Docker
```bash
# Arrêter les containers
docker-compose down

# Reconstruire et redémarrer (si nécessaire)
docker-compose build --no-cache

# Démarrer les containers
docker-compose up -d
```

### Étape 9 : Vérifier les logs
```bash
# Logs du backend
docker logs oncree_backend -f

# Si vous voyez des erreurs, appuyez sur Ctrl+C et continuez
```

**Vérifier que le serveur démarre sans erreur 404**

### Étape 10 : Vider les caches Laravel (dans le container)
```bash
docker exec -it oncree_backend bash

# Une fois dans le container :
php artisan config:clear
php artisan route:clear
php artisan cache:clear
php artisan route:list | grep "rh/me"

exit
```

**Vous devriez voir :**
```
GET|HEAD  api/rh/me ... AuthController@me
```

### Étape 11 : Tester l'endpoint
```bash
# Test de login
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "rh@oncree.com",
    "password": "password123",
    "type": "rh"
  }'
```

**Copiez le token retourné**, puis testez `/rh/me` :
```bash
curl -X GET http://localhost:8000/api/rh/me \
  -H "Authorization: Bearer VOTRE_TOKEN_ICI" \
  -H "Accept: application/json"
```

**Résultat attendu :** Code 200 avec les données RH

### Étape 12 : Vérifier depuis l'extérieur
```bash
# Depuis votre machine locale (Windows), tester :
curl http://31.97.197.2:8000/api/login
```

## 🔧 Résolution de Problèmes

### Problème 1 : Git pull échoue avec "uncommitted changes"
```bash
git stash
git pull origin main
git stash pop
```

### Problème 2 : Docker containers ne démarrent pas
```bash
# Vérifier les logs
docker-compose logs backend

# Vérifier que MySQL est accessible
docker exec -it oncree_backend bash
php artisan migrate:status
```

### Problème 3 : Erreur 404 persiste
```bash
# Dans le container backend
docker exec -it oncree_backend bash
php artisan route:clear
php artisan config:clear
php artisan cache:clear

# Vérifier les routes
php artisan route:list | grep me
```

### Problème 4 : Connection database timeout
```bash
# Vérifier que MySQL tourne sur l'hôte
systemctl status mysql
# ou
service mysql status

# Si MySQL n'est pas installé, ajoutez un container MySQL au docker-compose.yml
```

### Problème 5 : Frontend ne peut pas se connecter
Vérifiez que le frontend utilise la bonne URL :
```bash
docker exec -it oncree_frontend env | grep API_URL
```

Devrait montrer :
```
NEXT_PUBLIC_API_URL=http://31.97.197.2:8000/api
```

## ✅ Checklist de Déploiement

- [ ] Connexion SSH réussie
- [ ] `git pull origin main` terminé
- [ ] Fichier `.env` à la racine créé/vérifié
- [ ] `back-end/.env` vérifié (DB_HOST, DB_DATABASE, etc.)
- [ ] `docker-compose down` exécuté
- [ ] `docker-compose up -d` exécuté
- [ ] Logs backend vérifiés (pas d'erreurs)
- [ ] Caches Laravel vidés
- [ ] Route `/api/rh/me` existe (`php artisan route:list`)
- [ ] Test login fonctionne (200 OK)
- [ ] Test `/api/rh/me` fonctionne (200 OK)
- [ ] Frontend accessible depuis navigateur
- [ ] Login RH fonctionne depuis le frontend

## 🎯 Commandes Complètes (Copier-Coller)

```bash
# 1. Connexion
ssh root@31.97.197.2

# 2. Aller au projet (ajustez le chemin)
cd /root/OncreeSaaS  # ou votre chemin

# 3. Pull
git pull origin main

# 4. Redémarrer Docker
docker-compose down
docker-compose up -d

# 5. Vider les caches
docker exec -it oncree_backend php artisan config:clear
docker exec -it oncree_backend php artisan route:clear
docker exec -it oncree_backend php artisan cache:clear

# 6. Vérifier les routes
docker exec -it oncree_backend php artisan route:list | grep "rh/me"

# 7. Vérifier les logs
docker logs oncree_backend --tail=50

# 8. Test rapide
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"rh@oncree.com","password":"password123","type":"rh"}'
```

## 📝 Notes Importantes

1. **MySQL sur l'hôte :** Si MySQL tourne sur l'hôte (pas dans Docker), assurez-vous que `host.docker.internal` est accessible depuis le container.

2. **Firewall :** Vérifiez que les ports 3000 (frontend) et 8000 (backend) sont ouverts :
```bash
ufw status
ufw allow 3000/tcp
ufw allow 8000/tcp
```

3. **HTTPS/SSL :** Pour la production, configurez un reverse proxy (Nginx) avec SSL/TLS.

4. **Backup :** Avant tout déploiement majeur, faites un backup de la database :
```bash
mysqldump -u root -p back-end > backup_$(date +%Y%m%d_%H%M%S).sql
```

## 🚀 Résultat Final

Après ces étapes :
- ✅ Code mis à jour sur le VPS
- ✅ Dashboard RH fonctionne sans erreur 404
- ✅ Database connection optimisée (5s timeout)
- ✅ Routes correctement configurées
- ✅ Authentification Sanctum fonctionnelle

**Votre application est maintenant déployée avec tous les correctifs !**

