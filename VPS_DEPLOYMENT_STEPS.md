# VPS Deployment Steps - Hostinger

## ✅ Connected to SSH - What's Next?

Follow these steps in order on your VPS terminal.

---

## Step 1: Update System & Install Docker

```bash
# Update package list
sudo apt update
sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add your user to docker group (replace 'root' with your username if different)
sudo usermod -aG docker $USER

# Install Docker Compose plugin
sudo apt install docker-compose-plugin -y

# Verify installation
docker --version
docker compose version
```

**Note**: After adding user to docker group, logout and login again for changes to take effect.

---

## Step 2: Create Application Directory

```bash
# Create directory for your app
sudo mkdir -p /var/www/oncree
sudo chown -R $USER:$USER /var/www/oncree
cd /var/www/oncree
```

---

## Step 3: Upload Your Code to VPS

### Option A: Using Git (Recommended)

```bash
# If you have a Git repository
cd /var/www/oncree
git clone https://github.com/yourusername/your-repo.git .

# Or if using SSH
git clone git@github.com:yourusername/your-repo.git .
```

### Option B: Using rsync from your local machine

**Run this from your LOCAL Windows machine (PowerShell):**

```powershell
# Navigate to your project
cd "C:\Users\ROG STRIX\Documents\OncreeSaaS"

# Upload to VPS (replace user@31.97.197.2 with your details)
scp -r * root@31.97.197.2:/var/www/oncree/

# Or if you have rsync installed (via WSL or Git Bash):
rsync -avz --exclude 'node_modules' --exclude 'vendor' --exclude '.git' ./ root@31.97.197.2:/var/www/oncree/
```

### Option C: Using FileZilla or WinSCP

1. Open FileZilla/WinSCP
2. Connect to your VPS (IP: 31.97.197.2)
3. Navigate to `/var/www/oncree`
4. Upload all your project files

---

## Step 4: Set Up Database on VPS

You have two options:

### Option A: Use Docker MySQL (Recommended for VPS)

Update your `docker-compose.yml` to include MySQL service (uncomment MySQL section).

### Option B: Install MySQL directly on VPS

```bash
# Install MySQL
sudo apt install mysql-server -y

# Secure MySQL
sudo mysql_secure_installation

# Create database
sudo mysql -u root -p
```

Then in MySQL:
```sql
CREATE DATABASE oncree_db;
CREATE USER 'oncree_user'@'%' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON oncree_db.* TO 'oncree_user'@'%';
FLUSH PRIVILEGES;
EXIT;
```

---

## Step 5: Configure Environment Variables

```bash
cd /var/www/oncree

# Create .env file
nano .env
```

Add this content (adjust as needed):

```env
# Database Configuration
DB_DATABASE=oncree_db
DB_USERNAME=oncree_user
DB_PASSWORD=your_secure_password

# App Configuration
APP_ENV=production
APP_DEBUG=false
APP_KEY=

# Frontend Configuration
NEXT_PUBLIC_API_URL=http://31.97.197.2:8000/api
```

Save and exit (Ctrl+X, then Y, then Enter).

---

## Step 6: Update docker-compose.yml for Production

If using Docker MySQL, update the MySQL section in `docker-compose.yml`:

```bash
nano docker-compose.yml
```

Uncomment/add MySQL service:

```yaml
services:
  # MySQL Database
  mysql:
    image: mysql:8.0
    container_name: oncree_mysql
    restart: unless-stopped
    environment:
      MYSQL_DATABASE: oncree_db
      MYSQL_ROOT_PASSWORD: your_root_password
      MYSQL_USER: oncree_user
      MYSQL_PASSWORD: your_secure_password
    volumes:
      - mysql_data:/var/lib/mysql
    networks:
      - oncree_network
    ports:
      - "3306:3306"

  # Then update backend to connect to mysql instead of host.docker.internal
  backend:
    # ... other config
    environment:
      DB_HOST: mysql  # Change from host.docker.internal
      DB_PORT: 3306
      DB_DATABASE: oncree_db
      DB_USERNAME: oncree_user
      DB_PASSWORD: your_secure_password
```

Also add mysql_data to volumes at the bottom:

```yaml
volumes:
  backend_storage:
  mysql_data:
```

---

## Step 7: Build and Start Docker Containers

```bash
cd /var/www/oncree

# Build and start all containers
docker compose up -d --build

# This will take several minutes...
# Watch the build progress
docker compose logs -f
```

Press `Ctrl+C` to stop watching logs.

---

## Step 8: Generate Laravel Key & Run Migrations

```bash
# Generate application key
docker compose exec backend php artisan key:generate

# Run migrations
docker compose exec backend php artisan migrate --force

# Cache config
docker compose exec backend php artisan config:cache
docker compose exec backend php artisan route:cache

# Check status
docker compose ps
```

All containers should show "Up" status.

---

## Step 9: Configure Firewall

```bash
# Install UFW if not installed
sudo apt install ufw -y

# Allow SSH (IMPORTANT - do this first!)
sudo ufw allow 22/tcp
sudo ufw allow OpenSSH

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow your application ports
sudo ufw allow 3000/tcp  # Frontend
sudo ufw allow 8000/tcp  # Backend API

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

---

## Step 10: Test Your Application

From your browser:

- Frontend: `http://31.97.197.2:3000`
- Backend API: `http://31.97.197.2:8000/api`

---

## Step 11 (Optional): Set Up Domain & Reverse Proxy

### Install Nginx on Host

```bash
sudo apt install nginx -y
```

### Create Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/oncree
```

Add this content:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
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

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/oncree /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Set Up SSL (HTTPS)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

---

## Step 12: Set Up Automatic Backups (Optional)

### Database Backup Script

```bash
# Create backup directory
sudo mkdir -p /backups/mysql

# Create backup script
sudo nano /usr/local/bin/backup-mysql.sh
```

Add this content:

```bash
#!/bin/bash
BACKUP_DIR="/backups/mysql"
DATE=$(date +%Y%m%d_%H%M%S)
docker compose -f /var/www/oncree/docker-compose.yml exec -T mysql mysqldump -u root -p${MYSQL_ROOT_PASSWORD} oncree_db > $BACKUP_DIR/backup_$DATE.sql
# Keep only last 7 days
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete
```

Make it executable:

```bash
sudo chmod +x /usr/local/bin/backup-mysql.sh
```

### Set Up Cron Job

```bash
sudo crontab -e
```

Add this line (backup daily at 2 AM):

```
0 2 * * * /usr/local/bin/backup-mysql.sh
```

---

## Troubleshooting

### Check Container Status
```bash
docker compose ps
docker compose logs backend
docker compose logs frontend
docker compose logs mysql
```

### Restart Services
```bash
docker compose restart
docker compose restart backend
```

### View Real-time Logs
```bash
docker compose logs -f
```

### Check Disk Space
```bash
df -h
```

### Check Memory Usage
```bash
free -h
docker stats
```

### Clean Up Docker
```bash
# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune
```

### If Port is Taken
```bash
# Check what's using port 3000
sudo lsof -i :3000
sudo netstat -tlnp | grep 3000

# Kill process if needed
sudo kill -9 <PID>
```

---

## Useful Commands

### Docker Management
```bash
# Start all services
docker compose up -d

# Stop all services
docker compose down

# Rebuild specific service
docker compose up -d --build backend

# View logs
docker compose logs -f [service_name]

# Execute commands in container
docker compose exec backend php artisan [command]
```

### Laravel Commands
```bash
# Clear cache
docker compose exec backend php artisan cache:clear
docker compose exec backend php artisan config:clear
docker compose exec backend php artisan route:clear

# Run migrations
docker compose exec backend php artisan migrate

# Create admin user
docker compose exec backend php artisan tinker
```

### System Monitoring
```bash
# Check system resources
htop

# Check Docker resources
docker stats

# Check disk usage
du -sh /var/www/oncree/*
```

---

## Security Checklist

- [ ] Changed default MySQL passwords
- [ ] Set APP_DEBUG=false in production
- [ ] Configured firewall (UFW)
- [ ] Set up SSL certificate
- [ ] Regular backups configured
- [ ] Updated all packages
- [ ] Disabled root SSH login (optional)
- [ ] Set up fail2ban (optional)

---

## Next Steps After Deployment

1. Test all functionality
2. Set up monitoring (optional)
3. Configure email settings
4. Set up regular backups
5. Monitor logs regularly
6. Keep Docker images updated

---

## Support

If you encounter issues:
1. Check logs: `docker compose logs -f`
2. Verify all containers are running: `docker compose ps`
3. Check firewall: `sudo ufw status`
4. Verify domain DNS settings (if using domain)

---

**Deployment complete!** 🎉

Your application should now be accessible at:
- Direct IP: http://31.97.197.2:3000
- With domain: https://yourdomain.com (after DNS propagation)











