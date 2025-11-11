# 前端（rewrite-frontend�?
基于 Vite + React + TypeScript 构建的改写工作台，覆盖需求文档中的前端关键能力：

- 左右分栏的原�?改写结果视图
- 三种改写级别与可调节参数（温度、篇幅策略、术语保护、引用保留）
- 调用后端 /api/rewrite/preview 接口，支持本地历史记录与加载状�?
## 快速开�?
`
cd frontend
npm install
npm run dev
`

默认开发服务器监听 http://localhost:5173，通过 Vite 代理�?/api 请求转发�?http://localhost:4000�?
## 主要目录

- src/App.tsx：顶层布局，组合设置面板、工作台与历史记录�?- src/components/：UI 组件（设置面板、改写工作区、历史记录、Spinner 等）�?- src/hooks/useRewrite.ts：封装改写调用、历史管理与 React Query 逻辑�?- src/services/apiClient.ts：Axios 客户端，统一处理 /api 请求�?- src/styles.css：全局样式，匹配需求文档的界面风格�?
如需自定义主题或接入真实后端，可通过修改 vite.config.ts 或环境变量配�?API 地址�?
