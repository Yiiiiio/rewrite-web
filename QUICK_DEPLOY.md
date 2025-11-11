# 🚀 Paperrewrite 快速上线指南

## 第一步：部署后端到 Railway

### 1. 创建 Railway 项目
1. 访问 [railway.app](https://railway.app)，使用 GitHub 账号登录
2. 点击 **"New Project"** → **"Deploy from GitHub repo"**
3. 选择你的仓库 `Yiiiiio/rewrite-web`
4. 点击 **"Deploy"**（先部署一次，然后设置根目录）

### 1.1 设置 Root Directory（重要！）
部署后，需要设置根目录为 `backend`：

**方式 A：在项目设置中设置（推荐）**
1. 在 Railway 项目页面，点击项目名称或右上角的 **"Settings"** 图标
2. 在左侧菜单找到 **"Settings"** → **"Service"** 或 **"Build & Deploy"**
3. 找到 **"Root Directory"** 或 **"Source Root"** 选项
4. 输入 `backend`（不要带斜杠，不要带引号）
5. 点击 **"Save"** 或 **"Update"**
6. Railway 会自动触发重新部署

**方式 B：在部署页面设置**
1. 如果第一次部署失败（显示检测到多个目录），点击失败的部署
2. 在部署详情页面，找到 **"Configure"** 或 **"Settings"** 按钮
3. 在 **"Root Directory"** 中输入 `backend`
4. 保存后重新部署

**验证设置是否成功：**
- 重新部署后，构建日志应该显示从 `backend/` 目录开始构建
- 日志中应该能看到 `package.json` 在 `backend/` 目录下

### 2. 添加 PostgreSQL 数据库
1. 在 Railway 项目页面，点击 **"+ New"**
2. 选择 **"Database"** → **"Add PostgreSQL"**
3. Railway 会自动创建数据库并注入 `DATABASE_URL` 环境变量

### 3. 配置环境变量
在 Railway 项目 → **"Variables"** 标签页，添加以下环境变量：

```env
OPENAI_API_KEY=你的_OpenAI_API_Key
OPENAI_MODEL=gpt-4o-mini
NODE_ENV=production
ALLOW_MOCK=false
LOG_LEVEL=info
PORT=4000
```

**注意**：`DATABASE_URL` 会自动由 Railway 提供，无需手动添加。

### 4. 初始化数据库
部署完成后，需要初始化数据库表：

**方式 1：使用 Railway CLI（推荐）**
```bash
# 安装 Railway CLI
npm install -g @railway/cli

# 登录
railway login

# 链接到项目（选择你刚创建的 Railway 项目）
railway link

# 运行数据库迁移
railway run npm run db:push
```

**方式 2：手动执行（如果 CLI 不可用）**
1. 在 Railway 项目页面，点击 **"Variables"** 标签
2. 复制 `DATABASE_URL` 的值
3. 在本地执行：
```bash
cd backend
export DATABASE_URL="你复制的_DATABASE_URL"
npm install
npm run db:generate
npm run db:push
```

### 5. 获取后端域名
1. 在 Railway 项目页面，点击 **"Settings"** 标签
2. 找到 **"Generate Domain"** 或 **"Domains"** 部分
3. 点击生成域名，记录下你的后端地址，例如：`https://paperrewrite-backend.up.railway.app`
4. 测试健康检查：访问 `https://你的后端域名/api/health`，应该返回 JSON 响应

---

## 第二步：部署前端到 Vercel

### 1. 创建 Vercel 项目
1. 访问 [vercel.com](https://vercel.com)，使用 GitHub 账号登录
2. 点击 **"Add New..."** → **"Project"**
3. 导入你的仓库 `Yiiiiio/rewrite-web`
4. **重要**：在 **Root Directory** 中选择 `frontend`
5. Framework Preset 会自动检测为 **"Vite"**

### 2. 配置环境变量
在 Vercel 项目设置 → **"Environment Variables"** 中添加：

```env
VITE_API_BASE_URL=https://你的Railway后端域名/api
```

**重要**：将 `你的Railway后端域名` 替换为第一步第5步中获取的后端域名（例如：`https://paperrewrite-backend.up.railway.app/api`）

### 3. 更新 vercel.json（可选）
如果需要使用 Vercel 的代理功能，编辑 `frontend/vercel.json`，将 `destination` 中的 URL 替换为你的 Railway 后端域名。

### 4. 部署
1. 点击 **"Deploy"**
2. 等待构建完成（通常 1-2 分钟）
3. Vercel 会自动分配一个域名，例如：`https://rewrite-web.vercel.app`
4. **记录前端域名**：`https://你的前端域名.vercel.app`

---

## 第三步：连接前后端

### 1. 更新后端 CORS 配置
回到 Railway 项目 → **"Variables"**，添加：

```env
ALLOWED_ORIGINS=https://你的Vercel前端域名,http://localhost:5173
```

**重要**：将 `你的Vercel前端域名` 替换为第二步第4步中获取的前端域名（例如：`https://rewrite-web.vercel.app`）

Railway 会自动重新部署。

### 2. 验证连接
1. 访问你的前端域名：`https://你的前端域名.vercel.app`
2. 打开浏览器开发者工具（F12）→ **Network** 标签
3. 尝试使用改写功能：
   - 粘贴一段文本
   - 选择改写级别
   - 点击"改写文本"
4. 检查 Network 标签中的 API 请求是否成功（状态码 200）

---

## 第四步：配置自定义域名（可选）

### Vercel 自定义域名
1. 在 Vercel 项目 → **"Settings"** → **"Domains"**
2. 添加你的域名，例如：`paperrewrite.com` 或 `www.paperrewrite.com`
3. 按照 Vercel 的提示配置 DNS 记录
4. 等待 DNS 生效（通常几分钟到几小时）

### Railway 自定义域名
1. 在 Railway 项目 → **"Settings"** → **"Domains"**
2. 添加自定义域名，例如：`api.paperrewrite.com`
3. 配置 DNS CNAME 记录指向 Railway 提供的地址

### 更新环境变量
配置自定义域名后，记得更新：
- Vercel 的 `VITE_API_BASE_URL`（如果后端使用了自定义域名）
- Railway 的 `ALLOWED_ORIGINS`（添加新的前端域名）

---

## ✅ 验证部署

### 功能测试清单
- [ ] 前端页面正常加载
- [ ] 可以粘贴文本到左侧输入框
- [ ] 可以选择改写级别（轻度/平衡/重度）
- [ ] 点击"改写文本"后能正常返回结果
- [ ] 改写结果正确显示在右侧
- [ ] 浏览器控制台无错误信息
- [ ] Network 标签中 API 请求成功

### 后端验证
- [ ] 访问 `https://你的后端域名/api/health` 返回正常
- [ ] Railway 日志中没有错误信息
- [ ] 数据库中有新的 `RewritingTask` 记录（使用改写功能后）

---

## 🐛 常见问题

### CORS 错误
**症状**：浏览器控制台显示 "CORS policy" 错误

**解决**：
1. 检查 Railway 的 `ALLOWED_ORIGINS` 是否包含前端域名
2. 确保域名格式正确（包含 `https://`）
3. 等待 Railway 重新部署完成（通常 1-2 分钟）

### 数据库连接失败
**症状**：Railway 日志显示 "Database connection failed"

**解决**：
1. 确认已添加 PostgreSQL 数据库服务
2. 检查 `DATABASE_URL` 环境变量是否存在
3. 确认已执行 `npm run db:push` 初始化数据库

### 前端无法连接后端
**症状**：前端显示网络错误或 404

**解决**：
1. 检查 Vercel 的 `VITE_API_BASE_URL` 环境变量是否正确
2. 确认 Railway 后端域名可访问（访问 `/api/health`）
3. 检查 `vercel.json` 中的代理配置（如果使用）

### OpenAI API 错误
**症状**：改写功能返回错误

**解决**：
1. 检查 Railway 的 `OPENAI_API_KEY` 是否正确
2. 确认 OpenAI 账户有余额
3. 查看 Railway 日志中的详细错误信息

---

## 📝 部署后的维护

### 自动部署
- 每次推送代码到 GitHub 的 `main` 分支，Vercel 和 Railway 都会自动重新部署
- 可以在各自的平台查看部署日志和状态

### 监控和日志
- **Vercel**：项目页面 → **"Analytics"** 和 **"Logs"**
- **Railway**：项目页面 → **"Metrics"** 和 **"View Logs"**

### 数据库备份
- Railway 的 PostgreSQL 会自动备份
- 可以在 Railway 项目 → **"Data"** → **"Backups"** 查看和管理

---

## 🎉 完成！

现在你的 **Paperrewrite** 网站已经成功上线！

- **前端地址**：`https://你的Vercel域名.vercel.app`
- **后端地址**：`https://你的Railway域名.up.railway.app`
- **数据库**：Railway PostgreSQL（自动管理）

如果需要帮助，请查看详细的 `DEPLOY.md` 文档。

