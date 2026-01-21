# 技术博客系统 - 安装配置指南

## 📋 环境要求

- Node.js 18.x 或更高版本
- MySQL 8.0 或更高版本
- npm 或 yarn 包管理器

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `env.example` 文件为 `.env`：

```bash
cp env.example .env
```

然后编辑 `.env` 文件，配置以下内容：

```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_NAME=tech_blog
DB_USER=root
DB_PASSWORD=your_password

# JWT 密钥（请修改为随机字符串）
JWT_SECRET=your_super_secret_jwt_key_here

# 服务器配置
PORT=3001
NODE_ENV=development

# 文件上传配置
UPLOAD_DIR=./public/uploads
MAX_FILE_SIZE=5242880

# 管理员账号（首次运行时会自动创建）
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
ADMIN_EMAIL=admin@example.com
```

### 3. 创建数据库

登录 MySQL，创建数据库：

```sql
CREATE DATABASE tech_blog CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. 启动后端服务器

```bash
npm run server:dev
```

后端服务将在 http://localhost:3001 启动

数据库表会自动创建，管理员账号也会自动初始化。

### 5. 启动前端开发服务器

打开新的终端窗口：

```bash
npm run dev
```

前端将在 http://localhost:3000 启动

## 🔑 默认管理员账号

- **用户名**: admin
- **密码**: admin123

⚠️ **重要**: 首次登录后请立即修改默认密码！

## 📁 项目结构

```
tech-blog/
├── app/                    # Next.js 页面
│   ├── layout.tsx         # 全局布局
│   ├── page.tsx           # 首页
│   ├── articles/          # 文章页面
│   ├── login/             # 登录页
│   ├── admin/             # 管理后台
│   └── about/             # 关于页面
├── components/            # React 组件
│   ├── Navigation.tsx     # 导航栏
│   ├── Footer.tsx         # 页脚
│   ├── ArticleCard.tsx    # 文章卡片
│   └── ...
├── lib/                   # 工具库
│   ├── api.ts            # API 请求封装
│   └── store.ts          # 状态管理
├── server/                # 后端服务器
│   ├── index.js          # 服务器入口
│   ├── config/           # 配置文件
│   ├── models/           # 数据模型
│   ├── routes/           # API 路由
│   └── middleware/       # 中间件
├── public/               # 静态资源
│   └── uploads/          # 上传文件目录
├── styles/               # 样式文件
└── package.json
```

## 🎨 功能特性

✅ **已实现功能**:
- ✨ 精美的现代化 UI 设计
- 🔐 管理员身份验证 (JWT)
- 📝 Markdown 文章编辑
- 🎨 代码语法高亮
- 🏷️ 分类和标签系统
- 🔍 文章搜索功能
- 📱 响应式设计
- 🌙 公开/私密文章权限控制
- 📊 文章置顶和推荐
- 👁️ 文章阅读量统计
- 📷 图片上传功能

## 🔧 常见问题

### 数据库连接失败

确保 MySQL 服务已启动，并且 `.env` 文件中的数据库配置正确。

```bash
# 检查 MySQL 服务状态
# Windows (以管理员身份运行):
net start MySQL80

# Linux/Mac:
sudo systemctl status mysql
```

### 端口被占用

如果 3000 或 3001 端口被占用，可以修改：
- 前端端口：在 `package.json` 中修改 `next dev` 命令
- 后端端口：在 `.env` 文件中修改 `PORT` 变量

### 图片上传失败

确保 `public/uploads` 目录存在并且有写入权限。

```bash
mkdir -p public/uploads
chmod 755 public/uploads
```

## 📝 开发指南

### 添加新的 API 路由

1. 在 `server/routes/` 目录创建新的路由文件
2. 在 `server/index.js` 中注册路由

### 添加新的页面

在 `app/` 目录下创建新的文件夹和 `page.tsx` 文件

### 修改样式

- 全局样式：修改 `app/globals.css`
- Tailwind 配置：修改 `tailwind.config.js`
- 组件样式：使用 Tailwind CSS 类名

## 🚀 生产环境部署

### 1. 构建前端

```bash
npm run build
```

### 2. 启动生产服务器

```bash
# 后端
npm run server

# 前端
npm run start
```

### 3. 使用 PM2 部署

```bash
# 安装 PM2
npm install -g pm2

# 启动服务
pm2 start server/index.js --name tech-blog-api
pm2 start npm --name tech-blog-web -- start

# 保存配置
pm2 save
pm2 startup
```

## 📚 技术文档

- [Next.js 文档](https://nextjs.org/docs)
- [React 文档](https://react.dev)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [Express.js 文档](https://expressjs.com)
- [Sequelize 文档](https://sequelize.org)

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📧 联系方式

如有问题，请联系：admin@example.com
