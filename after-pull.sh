#!/bin/bash
echo "🔄 Mise à jour depuis GitHub..."
git pull origin main

echo "🧹 Nettoyage des caches Laravel..."
docker exec -it oncree_backend php artisan config:clear
docker exec -it oncree_backend php artisan cache:clear
docker exec -it oncree_backend php artisan route:clear
docker exec -it oncree_backend php artisan view:clear

echo "🔨 Recréation des caches..."
docker exec -it oncree_backend php artisan config:cache
docker exec -it oncree_backend php artisan route:cache

echo "🔄 Redémarrage du backend..."
docker restart oncree_backend

echo "✅ Mise à jour terminée !"
