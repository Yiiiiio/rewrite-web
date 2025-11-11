# 故障排查指南

如果服务显示 "CRASHED" 状态，请按以下步骤排查：

## 1. 查看 Railway 日志

在 Railway 项目页面：
1. 点击 **"View Logs"** 或 **"Deployments"** → 选择失败的部署 → **"View Logs"**
2. 查看最后的错误信息

## 2. 常见错误及解决方案

### 错误：`Cannot find module '@prisma/client'`

**原因**：Prisma Client 没有正确生成

**解决**：
1. 在 Railway 项目 → **"Variables"** 中确认 `DATABASE_URL` 存在
2. 使用 Railway CLI 手动生成：
   ```bash
   railway login
   railway link
   railway run npm run db:generate
   ```
3. 或者重新部署（Railway 会自动运行 `postinstall` 脚本）

### 错误：`Database connection failed`

**原因**：数据库未配置或连接字符串错误

**解决**：
1. 在 Railway 项目页面，点击 **"+ New"** → **"Database"** → **"Add PostgreSQL"**
2. Railway 会自动注入 `DATABASE_URL` 环境变量
3. 初始化数据库表：
   ```bash
   railway run npm run db:push
   ```

### 错误：`Port already in use` 或端口相关错误

**原因**：端口配置问题

**解决**：
- Railway 会自动设置 `PORT` 环境变量，无需手动配置
- 确保代码中使用 `process.env.PORT`

### 错误：`Module not found` 或导入错误

**原因**：构建失败或依赖未安装

**解决**：
1. 检查构建日志，确认 `npm install` 成功
2. 确认所有依赖都在 `package.json` 中
3. 重新部署

### 错误：TypeScript 编译错误

**原因**：代码中有类型错误

**解决**：
1. 在本地运行 `npm run build` 检查错误
2. 修复所有 TypeScript 错误
3. 提交并推送代码

## 3. 验证服务是否正常运行

### 检查健康端点

部署成功后，访问：
```
https://你的Railway域名/api/health
```

应该返回：
```json
{
  "status": "ok",
  "env": "production",
  "openAI": "ready" 或 "mock"
}
```

### 检查日志输出

正常启动时，日志应该显示：
- "Starting server..."
- "Rewrite backend server is running"
- "Database connection successful"（如果数据库配置正确）

## 4. 手动重启服务

如果服务崩溃：
1. 在 Railway 项目页面，点击 **"Restart"** 按钮
2. 或者在 **"Deployments"** 页面，点击 **"Redeploy"**

## 5. 检查环境变量

在 Railway 项目 → **"Variables"** 中，确保有以下变量：

**必需**：
- `DATABASE_URL`（添加 PostgreSQL 数据库后自动生成）

**可选**（用于真实 OpenAI 调用）：
- `OPENAI_API_KEY`（如果不设置，会使用模拟模式）
- `OPENAI_MODEL`（默认：`gpt-4o-mini`）

**其他**：
- `NODE_ENV=production`
- `ALLOW_MOCK=false`（如果设置了 OPENAI_API_KEY）
- `ALLOWED_ORIGINS`（前端域名，用于 CORS）

## 6. 如果仍然无法解决

1. **查看完整日志**：在 Railway 的日志页面，查看完整的错误堆栈
2. **检查构建日志**：确认构建阶段没有错误
3. **本地测试**：
   ```bash
   cd backend
   npm install
   npm run build
   npm run start
   ```
4. **联系支持**：如果问题持续，可以在 Railway 的 Discord 或 GitHub 寻求帮助

## 7. 快速检查清单

- [ ] 代码已推送到 GitHub
- [ ] Railway 已连接到 GitHub 仓库
- [ ] Root Directory 设置为 `backend`
- [ ] 已添加 PostgreSQL 数据库
- [ ] 已初始化数据库表（`npm run db:push`）
- [ ] 环境变量已正确配置
- [ ] 构建日志没有错误
- [ ] 服务日志显示 "server is running"
- [ ] 健康检查端点返回正常

