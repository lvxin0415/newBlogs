# 阿里云 CentOS 7.9 部署方案

> 适用于已有 Node.js + MySQL 环境的服务器，作为第二个项目部署

## ⚠️ 重要：Node.js 版本问题

**问题**：Next.js 14 需要 Node.js >= 18.17.0，但 CentOS 7.9 的 glibc 版本（2.17）太老，无法原生运行 Node.js 18+。

**解决方案**：使用 Docker 容器部署（推荐）

---

## 📋 项目架构

```
┌─────────────────────────────────────────────────────────────┐
│                         Nginx                                │
│                    (反向代理 80/443)                          │
├─────────────────────────────────────────────────────────────┤
│     ↓ blog.yourdomain.com        ↓ api.yourdomain.com       │
├──────────────────────┬──────────────────────────────────────┤
│   Next.js 前端        │         Express 后端                 │
│   (端口 3002)         │         (端口 3003)                  │
├──────────────────────┴──────────────────────────────────────┤
│                      MySQL 数据库                            │
│                   (数据库: tech_blog)                        │
└─────────────────────────────────────────────────────────────┘
```

**端口规划（避免与现有项目冲突）：**
- Next.js 前端：3002
- Express API：3003

---

# 🐳 Docker 部署方案（推荐）

## Docker 第一步：安装 Docker

```bash
# 安装 Docker
curl -fsSL https://get.docker.com | bash -s docker

# 启动 Docker 并设置开机自启
systemctl start docker
systemctl enable docker

# 验证安装
docker --version

# 安装 Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# 验证
docker-compose --version
```

---

## Docker 第二步：准备项目文件

```bash
# 创建项目目录
mkdir -p /www/blog
cd /www/blog

# 上传代码（使用 git 或 scp）
# git clone 你的仓库地址 .
```

---

## Docker 第三步：创建 Dockerfile

在项目根目录创建 `Dockerfile`：

```bash
cat > Dockerfile << 'EOF'
# ==================== 构建阶段 ====================
FROM node:20-alpine AS builder

WORKDIR /app

# 复制依赖文件
COPY package*.json ./

# 安装所有依赖（包括 devDependencies）
RUN npm ci

# 复制源代码
COPY . .

# 构建 Next.js
RUN npm run build

# ==================== 生产阶段 ====================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# 创建非 root 用户
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 复制构建产物
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# 复制后端文件
COPY --from=builder /app/server ./server
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# 创建上传目录
RUN mkdir -p public/uploads && chown -R nextjs:nodejs public/uploads

USER nextjs

EXPOSE 3000 3001

# 使用启动脚本
CMD ["node", "server.js"]
EOF
```

---

## Docker 第四步：修改 Next.js 配置支持 standalone

编辑 `next.config.js`：

```bash
cat > next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',  // 添加这行，支持 Docker 部署
  images: {
    domains: ['localhost', '你的域名'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://127.0.0.1:3003/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
EOF
```

---

## Docker 第五步：创建 docker-compose.yml

```bash
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  # Next.js 前端
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    container_name: blog-frontend
    restart: always
    ports:
      - "3002:3000"
    environment:
      - NODE_ENV=production
    depends_on:
      - backend
    networks:
      - blog-network

  # Express 后端
  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    container_name: blog-backend
    restart: always
    ports:
      - "3003:3001"
    environment:
      - NODE_ENV=production
      - DB_HOST=host.docker.internal  # 连接宿主机 MySQL
      - DB_PORT=3306
      - DB_NAME=tech_blog
      - DB_USER=blog_user
      - DB_PASSWORD=${DB_PASSWORD}
      - JWT_SECRET=${JWT_SECRET}
      - ADMIN_USERNAME=${ADMIN_USERNAME}
      - ADMIN_PASSWORD=${ADMIN_PASSWORD}
      - ADMIN_EMAIL=${ADMIN_EMAIL}
    extra_hosts:
      - "host.docker.internal:host-gateway"
    volumes:
      - ./public/uploads:/app/public/uploads  # 持久化上传文件
    networks:
      - blog-network

networks:
  blog-network:
    driver: bridge
EOF
```

---

## Docker 第六步：创建分离的 Dockerfile

### 前端 Dockerfile

```bash
cat > Dockerfile.frontend << 'EOF'
# 构建阶段
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 生产阶段
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
EOF
```

### 后端 Dockerfile

```bash
cat > Dockerfile.backend << 'EOF'
FROM node:20-alpine

WORKDIR /app

# 只复制后端需要的文件
COPY package*.json ./
COPY server ./server

# 安装生产依赖
RUN npm ci --omit=dev

# 创建上传目录
RUN mkdir -p public/uploads

EXPOSE 3001

ENV PORT=3001

CMD ["node", "server/index.js"]
EOF
```

---

## Docker 第七步：创建环境变量文件

```bash
cat > .env << 'EOF'
# 数据库配置（容器会连接宿主机的 MySQL）
DB_PASSWORD=你的数据库密码

# JWT 密钥
JWT_SECRET=生成一个32位以上的随机字符串

# 管理员账户
ADMIN_USERNAME=admin
ADMIN_PASSWORD=你的管理员密码
ADMIN_EMAIL=admin@yourdomain.com
EOF

chmod 600 .env
```

---

## Docker 第八步：配置 MySQL 允许 Docker 连接

```bash
# 登录 MySQL
mysql -u root -p

# 创建数据库
CREATE DATABASE IF NOT EXISTS tech_blog CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 创建用户并允许 Docker 网络连接
CREATE USER 'blog_user'@'172.%' IDENTIFIED BY '你的密码';
GRANT ALL PRIVILEGES ON tech_blog.* TO 'blog_user'@'172.%';
FLUSH PRIVILEGES;

EXIT;
```

如果 MySQL 绑定了 127.0.0.1，需要修改配置：

```bash
# 编辑 MySQL 配置
vi /etc/my.cnf

# 修改或添加
[mysqld]
bind-address = 0.0.0.0

# 重启 MySQL
systemctl restart mysqld
```

---

## Docker 第九步：构建并启动

```bash
cd /www/blog

# 构建镜像
docker-compose build

# 启动服务（后台运行）
docker-compose up -d

# 查看状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 查看单个服务日志
docker-compose logs -f frontend
docker-compose logs -f backend
```

---

## Docker 常用命令

```bash
# 停止服务
docker-compose down

# 重启服务
docker-compose restart

# 重新构建并启动（代码更新后）
docker-compose up -d --build

# 进入容器调试
docker exec -it blog-frontend sh
docker exec -it blog-backend sh

# 查看容器资源使用
docker stats
```

---

## Docker + Nginx 配置

```bash
cat > /etc/nginx/conf.d/blog.conf << 'EOF'
server {
    listen 80;
    server_name blog.yourdomain.com;
    
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    
    # 上传文件
    location /uploads {
        alias /www/blog/public/uploads;
        expires 30d;
    }
    
    # API 代理到 Docker 容器
    location /api {
        proxy_pass http://127.0.0.1:3003;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # 前端代理到 Docker 容器
    location / {
        proxy_pass http://127.0.0.1:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

nginx -t && nginx -s reload
```

---

## Docker 更新部署流程

```bash
cd /www/blog

# 1. 拉取最新代码
git pull origin main

# 2. 重新构建并启动
docker-compose up -d --build

# 3. 清理旧镜像（可选）
docker image prune -f
```

---

# 📦 传统部署方案（备选）

> 如果不想用 Docker，可以尝试以下方案，但不推荐

### 方案 A：使用非官方 Node.js 构建

```bash
# 下载针对旧 glibc 的 Node.js 构建
cd /opt
wget https://unofficial-builds.nodejs.org/download/release/v18.20.0/node-v18.20.0-linux-x64-glibc-217.tar.gz
tar -xzf node-v18.20.0-linux-x64-glibc-217.tar.gz
ln -sf /opt/node-v18.20.0-linux-x64-glibc-217/bin/node /usr/local/bin/node18
ln -sf /opt/node-v18.20.0-linux-x64-glibc-217/bin/npm /usr/local/bin/npm18
```

### 方案 B：升级到 Rocky Linux 9 / AlmaLinux 9

如果是新服务器，建议直接使用 Rocky Linux 9 或 AlmaLinux 9，它们是 CentOS 的继任者，glibc 版本足够新。

---

# 📁 以下是原始的非 Docker 部署说明（仅供参考）

---

## 🚀 第一步：准备服务器目录

```bash
# SSH 登录服务器
ssh root@你的服务器IP

# 创建项目目录
mkdir -p /www/blog
cd /www/blog
```

---

## 🗄️ 第二步：创建 MySQL 数据库

```bash
# 登录 MySQL
mysql -u root -p

# 创建数据库
CREATE DATABASE tech_blog CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 创建专用用户（推荐，更安全）
CREATE USER 'blog_user'@'localhost' IDENTIFIED BY '你的强密码';
GRANT ALL PRIVILEGES ON tech_blog.* TO 'blog_user'@'localhost';
FLUSH PRIVILEGES;

# 退出
EXIT;
```

---

## 📦 第三步：上传项目代码

### 方式一：Git 拉取（推荐）

```bash
cd /www/blog

# 如果有 Git 仓库
git clone 你的仓库地址 .

# 或者如果已经 clone 过
git pull origin main
```

### 方式二：本地打包上传

在本地 Windows 执行：
```powershell
# 进入项目目录
cd C:\Users\58455\Desktop\临时文件\newBlogs

# 删除不需要的文件夹后打包
# 注意：不要包含 node_modules 和 .next 文件夹

# 使用 scp 上传（需要安装 OpenSSH）
scp -r ./* root@你的服务器IP:/www/blog/
```

或使用 **FileZilla / WinSCP** 等工具上传。

---

## ⚙️ 第四步：配置环境变量

```bash
cd /www/blog

# 创建生产环境配置文件
cat > .env << 'EOF'
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=tech_blog
DB_USER=blog_user
DB_PASSWORD=你的数据库密码

# JWT Secret（生成一个随机字符串）
JWT_SECRET=生成一个32位以上的随机字符串

# Server Configuration
PORT=3003
NODE_ENV=production

# Upload Configuration
UPLOAD_DIR=./public/uploads
MAX_FILE_SIZE=5242880

# Admin Account
ADMIN_USERNAME=admin
ADMIN_PASSWORD=你的管理员密码
ADMIN_EMAIL=admin@yourdomain.com
EOF

# 设置文件权限
chmod 600 .env
```

**生成随机 JWT_SECRET：**
```bash
openssl rand -base64 32
```

---

## 📥 第五步：安装依赖并构建

```bash
cd /www/blog

# 安装依赖
npm install --production=false

# 构建 Next.js 前端
npm run build

# 确保上传目录存在
mkdir -p public/uploads
chmod 755 public/uploads
```

---

## 🔧 第六步：修改 Next.js 配置

编辑 `next.config.js`，修改 API 代理地址：

```bash
cat > next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', '你的域名'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://127.0.0.1:3003/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
EOF
```

修改后需要重新构建：
```bash
npm run build
```

---

## 🔄 第七步：PM2 进程管理

### 创建 PM2 配置文件

```bash
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'blog-frontend',
      script: 'npm',
      args: 'start',
      cwd: '/www/blog',
      env: {
        NODE_ENV: 'production',
        PORT: 3002
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      error_file: '/www/blog/logs/frontend-error.log',
      out_file: '/www/blog/logs/frontend-out.log',
    },
    {
      name: 'blog-backend',
      script: 'server/index.js',
      cwd: '/www/blog',
      env: {
        NODE_ENV: 'production',
        PORT: 3003
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      error_file: '/www/blog/logs/backend-error.log',
      out_file: '/www/blog/logs/backend-out.log',
    }
  ]
};
EOF

# 创建日志目录
mkdir -p logs
```

### 启动应用

```bash
# 启动所有服务
pm2 start ecosystem.config.js

# 查看状态
pm2 status

# 保存进程列表（开机自启）
pm2 save

# 如果之前没有设置开机自启
pm2 startup
```

### PM2 常用命令

```bash
# 查看日志
pm2 logs blog-frontend
pm2 logs blog-backend

# 重启服务
pm2 restart blog-frontend
pm2 restart blog-backend

# 停止服务
pm2 stop blog-frontend

# 删除服务
pm2 delete blog-frontend
```

---

## 🌐 第八步：Nginx 配置

### 方式一：使用子域名（推荐）

```bash
# 创建配置文件
cat > /etc/nginx/conf.d/blog.conf << 'EOF'
# 博客前端
server {
    listen 80;
    server_name blog.yourdomain.com;  # 改成你的域名
    
    # 开启 gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    
    # 静态文件缓存
    location /_next/static {
        proxy_pass http://127.0.0.1:3002;
        proxy_cache_valid 60m;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
    
    # 上传文件目录
    location /uploads {
        alias /www/blog/public/uploads;
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
    }
    
    # API 代理
    location /api {
        proxy_pass http://127.0.0.1:3003;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # 前端代理
    location / {
        proxy_pass http://127.0.0.1:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF
```

### 方式二：使用路径前缀

如果不想用子域名，可以用路径区分：

```bash
# 在现有 nginx 配置中添加 location 块
# 编辑 /etc/nginx/conf.d/你的配置.conf

location /blog {
    rewrite ^/blog(.*)$ $1 break;
    proxy_pass http://127.0.0.1:3002;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}

location /blog-api {
    rewrite ^/blog-api(.*)$ /api$1 break;
    proxy_pass http://127.0.0.1:3003;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

### 重启 Nginx

```bash
# 测试配置
nginx -t

# 重载配置
nginx -s reload
# 或
systemctl reload nginx
```

---

## 🔒 第九步：配置 HTTPS（推荐）

使用免费的 Let's Encrypt 证书：

```bash
# 安装 certbot（如果没有）
yum install -y epel-release
yum install -y certbot python2-certbot-nginx

# 申请证书
certbot --nginx -d blog.yourdomain.com

# 设置自动续期
echo "0 0,12 * * * root python -c 'import random; import time; time.sleep(random.random() * 3600)' && certbot renew -q" | sudo tee -a /etc/crontab > /dev/null
```

---

## 🛡️ 第十步：防火墙配置

```bash
# 查看当前规则
firewall-cmd --list-all

# 如果需要开放端口（通常只需要 80/443）
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-service=https
firewall-cmd --reload

# 阿里云控制台也需要配置安全组
# 入方向规则：开放 80 和 443 端口
```

---

## ✅ 第十一步：验证部署

```bash
# 1. 检查 PM2 进程状态
pm2 status

# 2. 检查端口监听
netstat -tlnp | grep -E '3002|3003'

# 3. 测试后端 API
curl http://127.0.0.1:3003/api/health

# 4. 测试前端
curl -I http://127.0.0.1:3002

# 5. 检查 Nginx
curl -I http://blog.yourdomain.com
```

---

## 🔄 日常维护命令

### 更新代码

```bash
cd /www/blog

# 拉取最新代码
git pull origin main

# 安装新依赖
npm install

# 重新构建前端
npm run build

# 重启服务
pm2 restart all
```

### 查看日志

```bash
# PM2 日志
pm2 logs

# Nginx 访问日志
tail -f /var/log/nginx/access.log

# Nginx 错误日志
tail -f /var/log/nginx/error.log
```

### 数据库备份

```bash
# 创建备份脚本
cat > /www/blog/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/www/backups/blog"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# 备份数据库
mysqldump -u blog_user -p你的密码 tech_blog > $BACKUP_DIR/db_$DATE.sql

# 备份上传文件
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz /www/blog/public/uploads

# 删除7天前的备份
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup completed: $DATE"
EOF

chmod +x /www/blog/backup.sh

# 添加定时任务（每天凌晨3点备份）
echo "0 3 * * * /www/blog/backup.sh >> /var/log/blog-backup.log 2>&1" >> /etc/crontab
```

---

## 📁 最终目录结构

```
/www/
├── blog/                    # 博客项目（新项目）
│   ├── .env                 # 环境变量
│   ├── .next/               # Next.js 构建输出
│   ├── app/                 # Next.js 页面
│   ├── components/          # React 组件
│   ├── ecosystem.config.js  # PM2 配置
│   ├── logs/                # 应用日志
│   ├── node_modules/        # 依赖
│   ├── public/uploads/      # 上传文件
│   ├── server/              # Express 后端
│   └── ...
├── 你的第一个项目/           # 现有项目
└── backups/                 # 备份目录
    └── blog/
```

---

## ⚠️ 注意事项

1. **端口冲突**：确保 3002、3003 端口未被占用
2. **内存**：两个 Node.js 项目建议服务器至少 2GB 内存
3. **域名解析**：记得在阿里云 DNS 添加 A 记录指向服务器 IP
4. **安全组**：阿里云控制台需要开放 80/443 端口
5. **环境变量**：生产环境务必使用强密码

---

## 🆘 常见问题

### Q: 启动报错 "EADDRINUSE"
端口被占用，检查并修改端口：
```bash
lsof -i :3002
lsof -i :3003
```

### Q: 数据库连接失败
检查 .env 配置和 MySQL 用户权限：
```bash
mysql -u blog_user -p -e "SELECT 1"
```

### Q: 前端页面白屏
检查构建日志和 PM2 日志：
```bash
npm run build
pm2 logs blog-frontend
```

### Q: 上传文件失败
检查目录权限：
```bash
chown -R nobody:nobody /www/blog/public/uploads
chmod 755 /www/blog/public/uploads
```
