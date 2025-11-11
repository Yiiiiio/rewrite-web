#!/bin/bash
# 初始化数据库脚本（Linux/Mac）
# 使用方法：
# export DATABASE_URL="你的_DATABASE_URL"
# ./init-db.sh

echo "开始初始化数据库..."

# 检查 DATABASE_URL 是否设置
if [ -z "$DATABASE_URL" ]; then
    echo "错误：请先设置 DATABASE_URL 环境变量"
    echo "执行: export DATABASE_URL='你的_DATABASE_URL'"
    exit 1
fi

echo "生成 Prisma Client..."
npm run db:generate

if [ $? -ne 0 ]; then
    echo "Prisma Client 生成失败"
    exit 1
fi

echo "推送数据库 schema..."
npm run db:push

if [ $? -ne 0 ]; then
    echo "数据库初始化失败"
    exit 1
fi

echo "数据库初始化成功！"

