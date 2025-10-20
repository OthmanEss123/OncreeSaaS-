# Docker Deployment Guide - OncreeSaaS

## ✅ Setup Complete!

Your application is now running in Docker containers and ready for deployment.

## 🚀 Running Services

| Service | Container Name | Port | Status |
|---------|---------------|------|--------|
| **Frontend** | oncree_frontend | 3000 | ✅ Running |
| **Backend API** | oncree_backend | (internal) | ✅ Running |
| **Nginx** | oncree_nginx | 8000 | ✅ Running |
| **MySQL** | oncree_mysql | 3307 | ✅ Running |

## 🌐 Access Your Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api
- **MySQL Database**: localhost:3307 (user: root, password: none)

## 📋 Important Configuration

### Database Settings
- **Database Name**: `oncree_db`
- **Username**: `root`
- **Password**: (empty - no password)
- **Port**: 3307 (external), 3306 (internal to Docker network)

### Docker Compose Services
All services are defined in `docker-compose.yml`:
- MySQL with empty password (MYSQL_ALLOW_EMPTY_PASSWORD)
- Laravel backend with PHP 8.2
- Next.js frontend with standalone output
- Nginx as reverse proxy for backend

## 🛠️ Common Docker Commands

### Start All Services
```bash
docker-compose up -d
```

### Stop All Services
```bash
docker-compose down
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f frontend
docker-compose logs -f backend
docker-compose logs -f mysql
```

### Restart a Service
```bash
docker-compose restart backend
docker-compose restart frontend
```

### Rebuild and Start
```bash
docker-compose up --build -d
```

### Check Service Status
```bash
docker-compose ps
```

### Execute Commands in Containers
```bash
# Laravel artisan commands
docker-compose exec backend php artisan migrate
docker-compose exec backend php artisan cache:clear
docker-compose exec backend php artisan config:cache

# Access MySQL
docker-compose exec mysql mysql -u root oncree_db

# Access backend shell
docker-compose exec backend bash
```

## 📦 For VPS Deployment (Hostinger)

### 1. Prepare VPS
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose (if not included)
sudo apt install docker-compose-plugin
```

### 2. Upload Your Code
```bash
# From local machine using rsync
rsync -avz --exclude 'node_modules' --exclude 'vendor' ./ user@your-vps-ip:/var/www/oncree/

# Or using Git
git clone your-repository.git /var/www/oncree
```

### 3. On VPS
```bash
cd /var/www/oncree

# Build and start
docker-compose up -d --build

# Generate Laravel key (if needed)
docker-compose exec backend php artisan key:generate

# Run migrations
docker-compose exec backend php artisan migrate --force
```

### 4. Configure Firewall
```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3000/tcp
sudo ufw allow 8000/tcp
```

### 5. Set Up Reverse Proxy (Optional)
For production, use Nginx on the host to proxy to your containers:

```nginx
# /etc/nginx/sites-available/oncree
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Then:
```bash
sudo ln -s /etc/nginx/sites-available/oncree /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 6. SSL Certificate (Let's Encrypt)
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## 🔧 Troubleshooting

### Container Won't Start
```bash
# Check logs
docker-compose logs [service-name]

# Rebuild from scratch
docker-compose down -v
docker-compose up --build -d
```

### Port Already in Use
```bash
# Find what's using the port
netstat -ano | findstr :3000

# Stop the process or change the port in docker-compose.yml
```

### Database Connection Issues
```bash
# Check MySQL is running
docker-compose exec mysql mysqladmin ping -h localhost

# Check database exists
docker-compose exec mysql mysql -u root -e "SHOW DATABASES;"
```

### Clear All Docker Data (CAUTION!)
```bash
# This will remove ALL containers, images, and volumes
docker-compose down -v
docker system prune -a --volumes
```

## 📝 Migration Conflicts

Note: There are some migration conflicts with the `work_schedules` table. To fix:

```bash
# Option 1: Fresh migrations (DELETES ALL DATA)
docker-compose exec backend php artisan migrate:fresh --force

# Option 2: Fix specific migrations
# Edit the conflicting migration files to resolve duplicates
```

## 🔐 Security Notes for Production

1. **Change MySQL Password**: Update docker-compose.yml to use a strong password
2. **Set APP_DEBUG=false**: In production
3. **Use HTTPS**: Set up SSL certificates
4. **Restrict Database Access**: Remove port mapping if not needed
5. **Regular Backups**: Set up automated backups for MySQL data

## 📄 Files Created/Modified

- ✅ `docker-compose.yml` - Main orchestration file
- ✅ `back-end/Dockerfile` - Backend container definition
- ✅ `frant-end/Dockerfile` - Frontend container definition
- ✅ `nginx/backend.conf` - Nginx configuration for backend
- ✅ `frant-end/next.config.mjs` - Next.js with standalone output
- ✅ `.dockerignore` files - Optimized build contexts

## 🎉 Success Indicators

Your deployment is successful if:
- ✅ All 4 containers are running (`docker-compose ps`)
- ✅ MySQL is healthy
- ✅ Frontend accessible at http://localhost:3000
- ✅ Backend API accessible at http://localhost:8000/api
- ✅ No critical errors in logs

---

**Need Help?** Check logs with `docker-compose logs -f` or restart services with `docker-compose restart [service-name]`

