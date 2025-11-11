# Vercel + Railway 部署指南

本指南将帮助你使用 **Vercel（前端）** + **Railway（后端）** 部署这个改写网站。

---

## 📋 前置准备

1. **GitHub 账号**：将代码推送到 GitHub 仓库
2. **Vercel 账号**：注册 [vercel.com](https://vercel.com)
3. **Railway 账号**：注册 [railway.app](https://railway.app)
4. **OpenAI API Key**：准备你的 OpenAI API 密钥
5. **数据库**：Railway 提供 PostgreSQL，或使用外部数据库（Supabase、Neon 等）

---

## 🚀 第一步：部署后端到 Railway

### 1.1 创建 Railway 项目

1. 登录 [Railway](https://railway.app)
2. 点击 **"New Project"** → **"Deploy from GitHub repo"**
3. 选择你的仓库，选择 `backend` 目录作为根目录

### 1.2 配置环境变量

在 Railway 项目设置中添加以下环境变量：

```env
# OpenAI 配置
OPENAI_API_KEY=你的_OpenAI_API_Key
OPENAI_MODEL=gpt-4o-mini

# 数据库配置（Railway 会自动提供 PostgreSQL）
# Railway 会自动注入 DATABASE_URL，无需手动设置
# 如果使用外部数据库，手动设置：
# DATABASE_URL=postgresql://user:password@host:5432/dbname?schema=public

# 服务器配置
PORT=4000
NODE_ENV=production
ALLOW_MOCK=false
LOG_LEVEL=info

# CORS 配置（稍后部署前端后更新）
ALLOWED_ORIGINS=https://your-frontend.vercel.app,http://localhost:5173
```

### 1.3 初始化数据库

Railway 部署后，需要初始化数据库表：

1. 在 Railway 项目页面，点击 **"View Logs"** 查看部署日志
2. 部署成功后，点击 **"Settings"** → **"Generate Domain"** 获取后端域名（如 `your-app.up.railway.app`）
3. 在 Railway 的 **"Variables"** 标签页，找到自动生成的 `DATABASE_URL`
4. 在本地或通过 Railway 的 **"Connect"** 功能连接到数据库，执行：

```bash
cd backend
npm install
npm run db:generate
npm run db:push
```

或者使用 Railway CLI：

```bash
# 安装 Railway CLI
npm i -g @railway/cli

# 登录
railway login

# 链接到项目
railway link

# 运行数据库迁移
railway run npm run db:push
```

### 1.4 验证后端部署

访问 `https://your-app.up.railway.app/api/health`，应该返回：

```json
{
  "status": "ok",
  "env": "production",
  "openAI": "ready"
}
```

**记录后端域名**：`https://your-app.up.railway.app`（稍后配置前端时需要）

---

## 🎨 第二步：部署前端到 Vercel

### 2.1 创建 Vercel 项目

1. 登录 [Vercel](https://vercel.com)
2. 点击 **"Add New..."** → **"Project"**
3. 导入你的 GitHub 仓库
4. 在 **"Root Directory"** 中选择 `frontend` 目录
5. 框架预设选择 **"Vite"**（Vercel 会自动检测）

### 2.2 配置环境变量

在 Vercel 项目设置 → **"Environment Variables"** 中添加：

```env
VITE_API_BASE_URL=https://your-app.up.railway.app/api
```

**重要**：将 `your-app.up.railway.app` 替换为你的 Railway 后端域名。

### 2.3 更新 Vercel 配置

编辑 `frontend/vercel.json`，将 `destination` 中的 URL 替换为你的 Railway 后端域名：

```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://your-app.up.railway.app/api/$1"
    }
  ]
}
```

### 2.4 部署

1. 点击 **"Deploy"**
2. 等待构建完成
3. Vercel 会自动分配一个域名（如 `your-project.vercel.app`）

**记录前端域名**：`https://your-project.vercel.app`

---

## 🔗 第三步：连接前后端

### 3.1 更新后端 CORS

回到 Railway，在环境变量中添加前端域名：

```env
ALLOWED_ORIGINS=https://your-project.vercel.app,http://localhost:5173
```

Railway 会自动重新部署。

### 3.2 更新 Vercel 代理配置（可选）

如果使用 Vercel 的 `rewrites` 代理，确保 `vercel.json` 中的 `destination` 指向正确的 Railway 后端地址。

或者，直接使用环境变量 `VITE_API_BASE_URL`，前端会直接请求 Railway 后端（推荐）。

---

## ✅ 第四步：验证部署

1. **访问前端**：打开 `https://your-project.vercel.app`
2. **测试改写功能**：
   - 粘贴一段文本
   - 选择改写级别
   - 点击"改写文本"
   - 检查是否正常返回结果
3. **检查后端日志**：在 Railway 的 **"View Logs"** 中查看请求日志
4. **检查数据库**：确认 `RewritingTask` 表中有新记录

---

## 🔧 常见问题

### 问题 1：CORS 错误

**症状**：浏览器控制台显示 CORS 错误

**解决**：
- 检查 Railway 的 `ALLOWED_ORIGINS` 是否包含前端域名
- 确保前端域名格式正确（包含 `https://`）

### 问题 2：数据库连接失败

**症状**：后端日志显示 "Database connection failed"

**解决**：
- 检查 Railway 的 `DATABASE_URL` 是否正确
- 确保已执行 `npm run db:push` 初始化数据库表

### 问题 3：前端无法连接后端

**症状**：前端显示网络错误或 404

**解决**：
- 检查 `VITE_API_BASE_URL` 环境变量是否正确
- 检查 Railway 后端域名是否可访问
- 查看 Vercel 构建日志，确认环境变量已注入

### 问题 4：OpenAI API 调用失败

**症状**：改写功能返回错误

**解决**：
- 检查 Railway 的 `OPENAI_API_KEY` 是否正确
- 检查 OpenAI 账户余额
- 查看 Railway 日志中的详细错误信息

---

## 📝 后续优化

### 自定义域名

1. **Vercel**：在项目设置 → **"Domains"** 添加自定义域名
2. **Railway**：在项目设置 → **"Settings"** → **"Generate Domain"** 或使用自定义域名

### 数据库备份

Railway 的 PostgreSQL 会自动备份，也可以：
- 使用 Railway 的 **"Backups"** 功能
- 定期导出数据到外部存储

### 监控和日志

- **Vercel**：查看 **"Analytics"** 和 **"Logs"**
- **Railway**：查看 **"Metrics"** 和 **"View Logs"**

### 环境变量管理

- 使用 Railway 的 **"Variables"** 管理所有环境变量
- 使用 Vercel 的 **"Environment Variables"** 管理前端变量
- 为不同环境（Production、Preview、Development）设置不同的变量

---

## 🎉 完成！

现在你的网站已经成功部署到 Vercel + Railway！

- **前端**：`https://your-project.vercel.app`
- **后端**：`https://your-app.up.railway.app`
- **数据库**：Railway PostgreSQL（自动管理）

每次推送代码到 GitHub，Vercel 和 Railway 都会自动重新部署。

