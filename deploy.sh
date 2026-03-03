#!/bin/bash
set -e

echo "=== VetBook Deploy ==="

# 1. Backend
echo "[1/5] Installing backend dependencies..."
cd backend
composer install --no-dev --optimize-autoloader
php artisan config:cache
php artisan route:cache
php artisan view:cache
echo "  Backend OK"

# 2. Migrate
echo "[2/5] Running migrations..."
php artisan migrate --force
echo "  Migrations OK"

# 3. Frontend build
echo "[3/5] Building frontend..."
cd ../frontend
npm ci
npm run build
echo "  Frontend build OK"

# 4. Copy frontend dist to backend public
echo "[4/5] Deploying frontend assets..."
rm -rf ../backend/public/assets
cp -r dist/assets ../backend/public/assets
cp dist/index.html ../backend/public/app.html
echo "  Assets copied"

# 5. Set permissions
echo "[5/5] Setting permissions..."
cd ../backend
chmod -R 775 storage bootstrap/cache
echo "  Permissions OK"

echo ""
echo "=== Deploy complete ==="
echo "Cron: * * * * * cd $(pwd) && php artisan schedule:run >> /dev/null 2>&1"
