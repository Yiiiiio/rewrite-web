# 初始化数据库脚本
# 使用方法：在 PowerShell 中执行：
# $env:DATABASE_URL="你的_DATABASE_URL"
# .\init-db.ps1

Write-Host "开始初始化数据库..." -ForegroundColor Green

# 检查 DATABASE_URL 是否设置
if (-not $env:DATABASE_URL) {
    Write-Host "错误：请先设置 DATABASE_URL 环境变量" -ForegroundColor Red
    Write-Host "执行: `$env:DATABASE_URL='你的_DATABASE_URL'" -ForegroundColor Yellow
    exit 1
}

Write-Host "生成 Prisma Client..." -ForegroundColor Yellow
npm run db:generate

if ($LASTEXITCODE -ne 0) {
    Write-Host "Prisma Client 生成失败" -ForegroundColor Red
    exit 1
}

Write-Host "推送数据库 schema..." -ForegroundColor Yellow
npm run db:push

if ($LASTEXITCODE -ne 0) {
    Write-Host "数据库初始化失败" -ForegroundColor Red
    exit 1
}

Write-Host "数据库初始化成功！" -ForegroundColor Green

