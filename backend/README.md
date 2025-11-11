# 后端（rewrite-backend）

基于 Express + TypeScript + Prisma 的 API 服务，提供需求文档中的改写接口能力：

- `/api/health`：健康检查，指示当前环境、OpenAI 配置状态与数据库连接。
- `/api/rewrite/preview`：接收原文、改写级别与参数，调用 OpenAI 并保存到数据库。
- `/api/rewrite/task/:id`：获取改写任务详情。
- `/api/rewrite/history`：获取用户的改写历史记录。

## 快速开始

### 1. 安装依赖

```bash
cd backend
npm install
```

### 2. 配置环境变量

创建 `.env` 文件，配置以下变量：

```env
# OpenAI 配置
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini

# 数据库配置（必填）
DATABASE_URL="postgresql://user:password@localhost:5432/rewrite_db?schema=public"
# 或使用 SQLite（开发环境）：
# DATABASE_URL="file:./dev.db"

# 服务器配置
PORT=4000
NODE_ENV=development
ALLOW_MOCK=false
```

### 3. 初始化数据库

```bash
# 生成 Prisma Client
npm run db:generate

# 创建数据库表
npm run db:push
```

### 4. 启动服务

```bash
npm run dev
```

默认监听 `http://localhost:4000`。

## 数据库

本项目使用 **Prisma ORM** 管理数据库，支持 PostgreSQL、MySQL 和 SQLite。

详细数据库配置和操作说明请参考 [DATABASE.md](./DATABASE.md)。

### 数据库相关命令

- `npm run db:generate` - 生成 Prisma Client
- `npm run db:push` - 推送 schema 到数据库（开发环境）
- `npm run db:migrate` - 创建数据库迁移（生产环境）
- `npm run db:studio` - 打开 Prisma Studio 可视化工具

## 环境变量说明

- `OPENAI_API_KEY`：OpenAI 密钥（必填，除非启用模拟模式）。
- `OPENAI_MODEL`：默认 `gpt-4o-mini`，可自定义。
- `DATABASE_URL`：数据库连接字符串（必填）。
- `PORT`：服务端口，默认 `4000`。
- `ALLOW_MOCK`：设置为 `true` 时，即使缺少密钥也返回模拟结果（仅用于开发测试）。

在生产环境需关闭模拟模式，确保改写流程真实调用模型并保留审计日志。
