# PowerShell script to fix frontend issues
Write-Host "🔧 Fixing Frontend Issues..." -ForegroundColor Yellow

# Step 1: Clean install
Write-Host "1. Cleaning node_modules and package-lock.json..." -ForegroundColor Cyan
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force "node_modules"
    Write-Host "   ✅ Removed node_modules" -ForegroundColor Green
}

if (Test-Path "package-lock.json") {
    Remove-Item -Force "package-lock.json"
    Write-Host "   ✅ Removed package-lock.json" -ForegroundColor Green
}

# Step 2: Install with legacy peer deps
Write-Host "2. Installing dependencies with --legacy-peer-deps..." -ForegroundColor Cyan
npm install --legacy-peer-deps

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Dependencies installed successfully" -ForegroundColor Green
} else {
    Write-Host "   ❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Step 3: Start dev server
Write-Host "3. Starting development server..." -ForegroundColor Cyan
Write-Host "🚀 Frontend will be available at: http://localhost:3000" -ForegroundColor Green
Write-Host "📝 Make sure backend is running at: http://localhost:8080" -ForegroundColor Yellow

npm run dev
