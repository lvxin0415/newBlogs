# 获取 Giscus 配置参数指南

## 方法一：使用 Giscus 官网（推荐）

### 1. 准备工作

确保你的 GitHub 仓库满足以下条件：
- ✅ 仓库是**公开的** (public)
- ✅ 已安装 [giscus app](https://github.com/apps/giscus)
- ✅ 仓库已开启 **Discussions** 功能

### 2. 开启 Discussions

1. 进入你的 GitHub 仓库
2. 点击 **Settings** (设置)
3. 滚动到 **Features** 部分
4. 勾选 **Discussions**

### 3. 安装 Giscus App

1. 访问：https://github.com/apps/giscus
2. 点击 **Install**
3. 选择你的仓库（或所有仓库）
4. 授权安装

### 4. 获取配置参数

1. 访问：**https://giscus.app/zh-CN**

2. 在"配置"部分输入：
   ```
   仓库：你的用户名/仓库名
   例如：lvxin0415/newBlogs
   ```

3. 等待验证通过（会显示绿色勾号 ✅）

4. 选择配置：
   - **页面 ↔️ discussion 映射关系**：pathname（推荐）
   - **Discussion 分类**：Announcements（或自定义）
   - **特性**：根据需要勾选
   - **主题**：dark（深色）

5. 在页面底部"启用 giscus"部分，你会看到类似这样的代码：

```html
<script src="https://giscus.app/client.js"
        data-repo="lvxin0415/newBlogs"
        data-repo-id="R_kgDOxxxxxxxx"          ⬅️ 这就是 repo-id
        data-category="Announcements"
        data-category-id="DIC_kwDOxxxxxxxx"    ⬅️ 这就是 category-id
        data-mapping="pathname"
        data-strict="0"
        data-reactions-enabled="1"
        data-emit-metadata="0"
        data-input-position="bottom"
        data-theme="dark"
        data-lang="zh-CN"
        crossorigin="anonymous"
        async>
</script>
```

## 方法二：使用 GitHub GraphQL API

如果你想通过 API 获取，可以使用以下步骤：

### 1. 获取 repo-id

**使用 GitHub CLI**:
```bash
gh api graphql -f query='
{
  repository(owner:"lvxin0415", name:"newBlogs") {
    id
  }
}'
```

**使用 curl**:
```bash
curl -H "Authorization: bearer YOUR_GITHUB_TOKEN" \
  -X POST \
  -d '{"query":"{ repository(owner:\"lvxin0415\", name:\"newBlogs\") { id } }"}' \
  https://api.github.com/graphql
```

### 2. 获取 category-id

**先列出所有分类**:
```bash
gh api graphql -f query='
{
  repository(owner:"lvxin0415", name:"newBlogs") {
    discussionCategories(first: 10) {
      nodes {
        id
        name
      }
    }
  }
}'
```

返回示例：
```json
{
  "data": {
    "repository": {
      "discussionCategories": {
        "nodes": [
          {
            "id": "DIC_kwDOxxxxxxxx",
            "name": "Announcements"
          },
          {
            "id": "DIC_kwDOyyyyyyyy",
            "name": "General"
          }
        ]
      }
    }
  }
}
```

找到对应分类的 `id` 即为 `category-id`。

## 方法三：浏览器开发者工具

1. 访问你的仓库 Discussions 页面
2. 打开浏览器开发者工具（F12）
3. 切换到 **Network** (网络) 标签
4. 刷新页面
5. 查找 GraphQL 请求
6. 在请求响应中找到 `repositoryId` 和 `categoryId`

## 配置示例

获取到参数后，在 `components/Comments.tsx` 中替换：

```typescript
script.setAttribute('data-repo', 'lvxin0415/newBlogs');
script.setAttribute('data-repo-id', 'R_kgDOQgRqKQ');        // 替换这里
script.setAttribute('data-category', 'Announcements');
script.setAttribute('data-category-id', 'DIC_kwDOQgRqKc4Ckq_U'); // 替换这里
```

## 常见问题

### Q: 显示"找不到仓库"
**A**: 确保：
1. 仓库是公开的
2. 已安装 giscus app
3. 仓库名拼写正确

### Q: 显示"未启用 Discussions"
**A**: 
1. 进入仓库 Settings
2. 勾选 Discussions 功能

### Q: 评论不显示
**A**: 检查：
1. repo-id 和 category-id 是否正确
2. 浏览器控制台是否有错误
3. giscus app 是否有访问权限

### Q: 如何创建新的分类
**A**:
1. 进入仓库的 Discussions 标签
2. 点击右侧的 ⚙️ (设置图标)
3. 管理分类
4. 添加新分类

## 推荐配置

```typescript
// 推荐的 giscus 配置
data-repo: "你的用户名/仓库名"
data-repo-id: "从 giscus.app 获取"
data-category: "Announcements"  // 或 "General"
data-category-id: "从 giscus.app 获取"
data-mapping: "pathname"        // 使用路径映射
data-strict: "0"                // 不严格模式
data-reactions-enabled: "1"     // 启用表情回应
data-emit-metadata: "0"         // 不发送元数据
data-input-position: "bottom"   // 输入框在底部
data-theme: "dark"              // 深色主题
data-lang: "zh-CN"              // 中文
```

## 相关链接

- Giscus 官网：https://giscus.app/zh-CN
- Giscus GitHub：https://github.com/giscus/giscus
- 安装 Giscus App：https://github.com/apps/giscus
- GitHub Discussions 文档：https://docs.github.com/en/discussions
