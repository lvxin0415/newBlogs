# 个人技术博客系统 - 需求文档

## 一、项目概述

**项目名称:** 个人技术博客系统  
**项目定位:** 记录前端、后端、Web3 技术的踩坑经验和学习笔记,主要供个人查阅,同时分享给其他开发者  
**部署环境:** 自有服务器  

**技术栈:**
- 前端: Next.js + React
- 后端: Node.js
- 数据库: MySQL

---

## 二、功能需求

### 2.1 用户系统

#### 管理员功能
- 账号密码登录
- JWT 身份验证
- 单管理员账号
- 登录状态保持
- 退出登录

#### 权限控制
- **游客(未登录):** 只能查看部分公开文章
- **管理员:** 可查看所有文章,拥有完整管理权限

---

### 2.2 文章管理

#### 文章创建与编辑
**Markdown 编辑器:**
- 实时预览
- 代码高亮(支持多语言)
- 图片上传功能

**文章基本信息:**
- 标题
- 摘要/简介
- 分类(单选)
- 标签(多选)
- 封面图(可选)
- 是否公开(公开/私密)
- 是否置顶
- 是否推荐

#### 文章状态
- **草稿:** 保存但未发布
- **已发布:** 正式发布的文章
- 可在草稿和已发布之间切换

#### 文章列表管理
- 查看所有文章列表
- 筛选功能(按分类、标签、状态)
- 编辑文章
- 删除文章

---

### 2.3 分类和标签

#### 分类管理
- 创建/编辑/删除分类
- 分类名称、描述
- 一篇文章只属于一个分类

#### 标签管理
- 创建/编辑/删除标签
- 标签名称
- 一篇文章可以有多个标签

---

### 2.4 前台展示

#### 首页
- 展示公开文章列表(按发布时间倒序)
- 置顶文章优先显示
- 推荐文章板块(可选)
- 分页功能

#### 文章详情页
- 文章标题、发布时间、分类、标签
- Markdown 渲染的正文内容
- 代码高亮显示
- 文章目录导航(自动提取 h2、h3 等标题)
- 目录支持点击跳转和高亮当前阅读位置
- 评论区

#### 分类页面
- 显示某个分类下的所有公开文章
- 分类描述

#### 标签页面
- 显示某个标签下的所有公开文章

#### 搜索功能
- 全局搜索框
- 支持按标题、内容搜索
- 搜索结果页展示匹配的文章

---

### 2.5 评论系统

#### 方案选择
- 优先考虑集成第三方评论系统(Giscus/Gitalk/Waline 等)
- 选择标准: 接入简单、免费、稳定

#### 基本功能
- 游客和登录用户都可以评论
- 显示评论者昵称、头像、评论时间
- 管理员可删除评论

---

### 2.6 其他功能

#### 权限相关
- 私密文章只有管理员登录后可见
- 文章详情页需判断: 游客访问私密文章时跳转登录或显示 403

#### SEO 优化
- 文章页面 meta 信息(标题、描述、关键词)
- sitemap 生成

---

## 三、数据库设计(初步)

### 主要数据表

#### 1. users(用户表)
```
- id (PRIMARY KEY)
- username (唯一)
- password (加密存储)
- email
- created_at
```

#### 2. articles(文章表)
```
- id (PRIMARY KEY)
- title
- summary
- content (TEXT/LONGTEXT)
- cover_image
- category_id (FOREIGN KEY)
- is_public (BOOLEAN)
- is_top (BOOLEAN)
- is_recommended (BOOLEAN)
- status (ENUM: draft/published)
- view_count (INT, 默认0)
- created_at
- updated_at
```

#### 3. categories(分类表)
```
- id (PRIMARY KEY)
- name (唯一)
- description
- created_at
```

#### 4. tags(标签表)
```
- id (PRIMARY KEY)
- name (唯一)
- created_at
```

#### 5. article_tags(文章标签关联表)
```
- id (PRIMARY KEY)
- article_id (FOREIGN KEY)
- tag_id (FOREIGN KEY)
- UNIQUE(article_id, tag_id)
```

---

## 四、页面结构

### 前台页面
- 首页: 文章列表
- 文章详情页
- 分类页
- 标签页
- 搜索结果页
- 登录页

### 后台管理页面
- 仪表盘(可选,显示文章统计等)
- 文章管理: 列表、新建、编辑
- 分类管理
- 标签管理

---

## 五、技术实现要点

### 前端(Next.js + React)
- 使用 Next.js App Router 或 Pages Router
- **Markdown 渲染:** react-markdown 或 marked
- **代码高亮:** Prism.js 或 highlight.js
- **编辑器:** react-md-editor 或 toast-ui-editor
- **样式:** Tailwind CSS(推荐)或其他 CSS 方案
- **状态管理:** Context API 或 Zustand(按需)

### 后端(Node.js)
- **框架:** Express 或 Koa 或 Nest.js
- **ORM:** Sequelize 或 TypeORM 或 Prisma
- **身份验证:** JWT (jsonwebtoken)
- **密码加密:** bcrypt
- **图片上传:** 本地存储或对象存储(OSS/S3)
- **参数验证:** Joi 或 class-validator

### 数据库
- MySQL 8.0+
- 字符集: utf8mb4

---

## 六、开发优先级

### 第一阶段(MVP - 核心功能)
1. 用户登录系统
2. 文章基本 CRUD(创建、编辑、删除、列表)
3. Markdown 编辑和渲染
4. 代码高亮
5. 分类和标签基础功能
6. 前台文章列表和详情页
7. 搜索功能

### 第二阶段(完善功能)
1. 草稿功能
2. 文章置顶和推荐
3. 公开/私密文章权限控制
4. 文章目录导航
5. 评论系统集成

### 第三阶段(优化增强)
1. SEO 优化
2. 性能优化(缓存、CDN)
3. UI/UX 完善
4. 移动端适配
5. 文章阅读统计

---

## 七、部署方案

### 服务器配置建议
- **操作系统:** Linux (Ubuntu/CentOS)
- **Node.js:** v18+ LTS
- **MySQL:** 8.0+
- **Nginx:** 反向代理和静态资源服务

### 部署步骤
1. **前端部署:**
   - 方案A: Next.js SSR 模式,使用 PM2 运行
   - 方案B: 构建为静态站点,用 Nginx 托管

2. **后端部署:**
   - 使用 PM2 守护进程管理
   - 配置环境变量(.env)

3. **数据库:**
   - MySQL 独立部署
   - 配置定期备份

4. **Nginx 配置:**
   - 反向代理 Next.js 和 API
   - 配置 HTTPS(Let's Encrypt)
   - 静态资源缓存

---

## 八、其他建议

### 开发规范
- **代码管理:** Git + GitHub/GitLab
- **分支策略:** main(生产) + dev(开发) + feature 分支
- **代码规范:** ESLint + Prettier
- **提交规范:** Conventional Commits

### 安全建议
- SQL 注入防护(使用 ORM 参数化查询)
- XSS 防护(前端输出转义)
- CSRF 防护
- 接口限流
- 敏感信息环境变量化

### 备份策略
- 数据库每日自动备份
- 上传的图片文件定期备份
- 保留至少 7 天的备份数据

### 日志管理
- 使用 winston 或 pino 记录日志
- 记录用户操作、错误信息、API 访问
- 日志按日期轮转

---

## 九、可选扩展功能(未来考虑)

- 多语言支持
- 暗黑模式
- 文章导出(PDF/Markdown)
- RSS 订阅
- 文章系列/专栏
- 访客统计分析
- 站内通知系统
- 友情链接管理
- 关于页面/简历页面

---

## 十、项目时间规划(参考)

- **第一阶段:** 2-3 周(核心功能开发)
- **第二阶段:** 1-2 周(功能完善)
- **第三阶段:** 持续优化

**总计:** 约 1-1.5 个月可完成基本可用版本

---

## 附录

### 推荐的技术选型组合

#### 方案一(简单快速)
- Next.js 14 (App Router)
- Express.js
- Prisma ORM
- Tailwind CSS
- Giscus 评论

#### 方案二(功能完善)
- Next.js 14 (App Router)
- Nest.js
- TypeORM
- Ant Design / shadcn/ui
- Waline 评论

### 参考资源
- Next.js 官方文档: https://nextjs.org/docs
- Prisma 文档: https://www.prisma.io/docs
- Markdown 规范: https://commonmark.org/
- Giscus: https://giscus.app/zh-CN

---

**文档版本:** v1.0  
**最后更新:** 2026-01-20