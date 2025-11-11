# 🚀 Vercel + Railway 部署检查清单

## ✅ 部署前准备

- [ ] 代码已推送到 GitHub 仓库
- [ ] 已注册 Vercel 账号
- [ ] 已注册 Railway 账号
- [ ] 已准备好 OpenAI API Key
- [ ] 已阅读 `DEPLOY.md` 完整文档

---

## 🔧 Railway 后端部署

### 步骤 1：创建项目
- [ ] 登录 Railway，点击 "New Project"
- [ ] 选择 "Deploy from GitHub repo"
- [ ] 选择仓库，**根目录选择 `backend` 文件夹**
- [ ] 等待首次部署完成

### 步骤 2：配置环境变量
在 Railway 项目 → "Variables" 标签页添加：

- [ ] `OPENAI_API_KEY` = 你的 OpenAI API Key
- [ ] `OPENAI_MODEL` = `gpt-4o-mini`（可选）
- [ ] `NODE_ENV` = `production`
- [ ] `ALLOW_MOCK` = `false`
- [ ] `LOG_LEVEL` = `info`
- [ ] `PORT` = `4000`（Railway 会自动设置，可不填）

**注意**：Railway 会自动提供 `DATABASE_URL`，无需手动设置。

### 步骤 3：添加 PostgreSQL 数据库
- [ ] 在 Railway 项目页面，点击 "+ New"
- [ ] 选择 "Database" → "Add PostgreSQL"
- [ ] Railway 会自动创建数据库并注入 `DATABASE_URL`

### 步骤 4：初始化数据库
- [ ] 在 Railway 项目 → "Variables" 中找到 `DATABASE_URL`
- [ ] 使用 Railway CLI 或通过 Railway 的 "Connect" 功能连接数据库
- [ ] 执行数据库迁移：

```bash
# 方式 1：使用 Railway CLI
railway link
railway run npm run db:push

# 方式 2：本地执行（需要 DATABASE_URL）
cd backend
npm install
export DATABASE_URL="你的_DATABASE_URL"
npm run db:generate
npm run db:push
```

### 步骤 5：获取后端域名
- [ ] 在 Railway 项目 → "Settings" → "Generate Domain"
- [ ] 记录后端域名：`https://your-app.up.railway.app`
- [ ] 测试健康检查：访问 `https://your-app.up.railway.app/api/health`

---

## 🎨 Vercel 前端部署

### 步骤 1：创建项目
- [ ] 登录 Vercel，点击 "Add New..." → "Project"
- [ ] 导入 GitHub 仓库
- [ ] **Root Directory 选择 `frontend` 文件夹**
- [ ] Framework Preset 选择 "Vite"（自动检测）

### 步骤 2：配置环境变量
在 Vercel 项目 → "Settings" → "Environment Variables" 添加：

- [ ] `VITE_API_BASE_URL` = `https://your-app.up.railway.app/api`
  - **重要**：将 `your-app.up.railway.app` 替换为你的 Railway 后端域名

### 步骤 3：更新 vercel.json
- [ ] 编辑 `frontend/vercel.json`
- [ ] 将 `destination` 中的 URL 替换为你的 Railway 后端域名

### 步骤 4：部署
- [ ] 点击 "Deploy"
- [ ] 等待构建完成
- [ ] 记录前端域名：`https://your-project.vercel.app`

---

## 🔗 连接前后端

### 步骤 1：更新后端 CORS
- [ ] 回到 Railway 项目 → "Variables"
- [ ] 添加环境变量：
  - `ALLOWED_ORIGINS` = `https://your-project.vercel.app,http://localhost:5173`
  - **重要**：将 `your-project.vercel.app` 替换为你的 Vercel 前端域名
- [ ] Railway 会自动重新部署

### 步骤 2：验证连接
- [ ] 访问前端：`https://your-project.vercel.app`
- [ ] 打开浏览器开发者工具（F12）→ Network 标签
- [ ] 尝试使用改写功能
- [ ] 检查 API 请求是否成功（状态码 200）

---

## ✅ 最终验证

### 功能测试
- [ ] 前端页面正常加载
- [ ] 可以粘贴文本
- [ ] 可以选择改写级别
- [ ] 点击"改写文本"后能正常返回结果
- [ ] 改写结果正确显示

### 后端验证
- [ ] 访问 `https://your-app.up.railway.app/api/health` 返回正常
- [ ] Railway 日志中没有错误信息
- [ ] 数据库中有新的 `RewritingTask` 记录

### 前端验证
- [ ] Vercel 构建日志无错误
- [ ] 浏览器控制台无 CORS 错误
- [ ] 网络请求正常（状态码 200）

---

## 🐛 常见问题排查

### CORS 错误
- [ ] 检查 Railway 的 `ALLOWED_ORIGINS` 是否包含前端域名
- [ ] 确保域名格式正确（包含 `https://`）
- [ ] 检查前端域名是否与 Vercel 分配的域名一致

### 数据库连接失败
- [ ] 检查 Railway 的 `DATABASE_URL` 是否存在
- [ ] 确认已执行 `npm run db:push` 初始化数据库
- [ ] 查看 Railway 日志中的数据库连接错误

### 前端无法连接后端
- [ ] 检查 `VITE_API_BASE_URL` 环境变量是否正确
- [ ] 确认 Railway 后端域名可访问
- [ ] 检查 `vercel.json` 中的代理配置

### OpenAI API 错误
- [ ] 检查 `OPENAI_API_KEY` 是否正确
- [ ] 确认 OpenAI 账户有余额
- [ ] 查看 Railway 日志中的详细错误信息

---

## 📝 部署完成后的优化

- [ ] 配置自定义域名（Vercel 和 Railway 都支持）
- [ ] 设置数据库自动备份（Railway 自动提供）
- [ ] 配置监控和告警
- [ ] 设置 CI/CD 自动部署（GitHub Actions）

---

## 🎉 完成！

如果所有检查项都已完成，你的网站已经成功部署！

- **前端地址**：`https://your-project.vercel.app`
- **后端地址**：`https://your-app.up.railway.app`
- **数据库**：Railway PostgreSQL（自动管理）

每次推送代码到 GitHub，Vercel 和 Railway 都会自动重新部署。

