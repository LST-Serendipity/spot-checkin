# Spot Check-in Website

景点打卡评分网站 - 每5天评选优秀作品

## 功能特性

- 浏览景点列表
- 上传景点图片（每景点最多10张）
- 5天上传窗口期
- 评分和评论系统
- 每5天自动评选TOP2图片永久保留

## 技术栈

- **前端**: Vue 3 + Vite + Tailwind CSS + Pinia
- **后端**: Supabase (PostgreSQL + Storage)
- **部署**: Vercel + Supabase

## 项目结构

```
spot-checkin/
├── src/
│   ├── components/     # Vue 组件
│   ├── views/          # 页面视图
│   ├── composables/    # 组合式函数
│   ├── stores/         # Pinia 状态
│   ├── lib/            # Supabase 配置
│   └── router/         # 路由配置
├── supabase/
│   ├── migrations/    # 数据库迁移
│   └── functions/     # Edge Functions
└── ...
```

## 快速开始

### 1. 配置 Supabase

1. 创建 Supabase 项目
2. 运行数据库迁移 `supabase/migrations/001_initial.sql`
3. 获取 Project URL 和 anon key

### 2. 环境变量

创建 `.env` 文件：

```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 3. 安装依赖

```bash
npm install
```

### 4. 本地开发

```bash
npm run dev
```

### 5. 部署

推送到 GitHub，连接 Vercel 自动部署。

## 数据库表

- `spots`: 景点信息
- `images`: 图片（包含是否永久保留标记）
- `ratings`: 评分和评论

## 定时任务

评选函数 `supabase/functions/evaluate-cycle/` 每6小时执行一次，检查并处理到期的周期。

## License

MIT
