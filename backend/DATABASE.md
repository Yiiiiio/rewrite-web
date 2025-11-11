# 数据库配置说明

本项目使用 **Prisma ORM** 管理数据库，支持 PostgreSQL、MySQL 和 SQLite。

## 快速开始

### 1. 安装依赖

```bash
cd backend
npm install
```

### 2. 配置数据库连接

创建 `.env` 文件（参考 `.env.example`），设置 `DATABASE_URL`：

**PostgreSQL 示例：**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/rewrite_db?schema=public"
```

**MySQL 示例：**
```env
DATABASE_URL="mysql://user:password@localhost:3306/rewrite_db"
```

**SQLite 示例（开发环境）：**
```env
DATABASE_URL="file:./dev.db"
```

### 3. 生成 Prisma Client

```bash
npm run db:generate
```

### 4. 创建数据库表

**方式一：直接推送 schema（开发环境）**
```bash
npm run db:push
```

**方式二：使用迁移（生产环境推荐）**
```bash
npm run db:migrate
```

### 5. 查看数据库（可选）

使用 Prisma Studio 可视化查看和编辑数据：
```bash
npm run db:studio
```

## 数据库模型

根据需求文档，数据库包含以下主要表：

- **User** - 用户表
- **Document** - 文稿表
- **DocumentVersion** - 文稿版本表
- **Suggestion** - 改写建议表
- **SimilarityFinding** - 相似度发现表
- **Citation** - 引用表
- **BillingUsage** - 计费用量表
- **AuditLog** - 审计日志表
- **RewritingTask** - 改写任务表（核心功能）
- **PromptTemplate** - Prompt 模板表

详细模型定义见 `prisma/schema.prisma`。

## 数据库操作

### 在代码中使用数据库

```typescript
import { getPrismaClient } from "./db/client.js";

const prisma = getPrismaClient();
const task = await prisma.rewritingTask.create({
  data: {
    originalText: "原文内容",
    level: "balanced",
    status: "pending"
  }
});
```

### 修改数据库结构

1. 编辑 `prisma/schema.prisma`
2. 运行 `npm run db:push`（开发）或 `npm run db:migrate`（生产）
3. 运行 `npm run db:generate` 更新 Prisma Client

## 注意事项

- 生产环境请使用 PostgreSQL 或 MySQL，不要使用 SQLite
- 定期备份数据库
- 敏感信息（如密码）应加密存储
- 大文本内容（如文稿内容）可考虑存储到对象存储（S3），数据库中只存 URI

