# 代码高亮测试

在 Markdown 编辑器中粘贴以下代码块来测试语法高亮：

## JavaScript

```javascript
// JavaScript 示例
const greeting = "Hello World";
console.log(greeting);

function calculate(a, b) {
  return a + b;
}

const result = calculate(5, 3);
console.log(`Result: ${result}`);
```

## TypeScript

```typescript
// TypeScript 示例
interface User {
  name: string;
  age: number;
  email?: string;
}

class UserManager {
  private users: User[] = [];

  addUser(user: User): void {
    this.users.push(user);
  }

  getUsers(): User[] {
    return this.users;
  }
}

const manager = new UserManager();
manager.addUser({ name: "Alice", age: 25 });
```

## Python

```python
# Python 示例
def fibonacci(n):
    """生成斐波那契数列"""
    if n <= 0:
        return []
    elif n == 1:
        return [0]
    elif n == 2:
        return [0, 1]
    
    fib = [0, 1]
    for i in range(2, n):
        fib.append(fib[i-1] + fib[i-2])
    return fib

# 使用示例
result = fibonacci(10)
print(f"Fibonacci sequence: {result}")
```

## React JSX

```jsx
// React 组件示例
import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div className="counter">
      <h1>Count: {count}</h1>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}

export default Counter;
```

## CSS

```css
/* CSS 样式示例 */
.button {
  background: linear-gradient(to right, #00d4ff, #8b5cf6);
  border-radius: 8px;
  padding: 12px 24px;
  color: white;
  font-weight: 600;
  transition: all 0.3s ease;
}

.button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 212, 255, 0.3);
}
```

## SQL

```sql
-- SQL 查询示例
SELECT 
    u.id,
    u.username,
    COUNT(a.id) as article_count
FROM users u
LEFT JOIN articles a ON u.id = a.user_id
WHERE u.created_at >= '2024-01-01'
GROUP BY u.id, u.username
HAVING COUNT(a.id) > 0
ORDER BY article_count DESC
LIMIT 10;
```

## JSON

```json
{
  "name": "Tech Blog",
  "version": "1.0.0",
  "features": [
    "Markdown Editor",
    "Code Highlighting",
    "Comments System"
  ],
  "config": {
    "theme": "dark",
    "language": "zh-CN"
  }
}
```

## Bash

```bash
#!/bin/bash

# 部署脚本示例
echo "Starting deployment..."

npm install
npm run build

pm2 stop tech-blog || true
pm2 start npm --name tech-blog -- start
pm2 save

echo "Deployment completed!"
```

## 验证清单

测试以上代码块后，检查是否有以下效果：

- [ ] **关键字高亮**：`function`, `const`, `class`, `import` 等显示为蓝色
- [ ] **字符串高亮**：引号中的文本显示为橙色
- [ ] **注释高亮**：注释显示为绿色（斜体）
- [ ] **数字高亮**：数字显示为浅绿色
- [ ] **函数名高亮**：函数名显示为黄色
- [ ] **代码块背景**：深色半透明背景
- [ ] **代码字体**：使用等宽字体（Fira Code/Consolas）

## 如果没有高亮

如果代码块没有语法高亮，请尝试：

1. **刷新页面**：清除缓存并重新加载
2. **重启开发服务器**：
   ```bash
   # Ctrl+C 停止
   npm run dev
   ```
3. **检查浏览器控制台**：查看是否有错误信息
4. **清理 node_modules**：
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

## 支持的语言

当前配置支持以下编程语言的语法高亮：

- JavaScript / TypeScript
- JSX / TSX
- Python
- Java
- C / C++ / C#
- Go
- Rust
- PHP
- Ruby
- Swift
- Kotlin
- SQL
- HTML / XML
- CSS / SCSS / Sass
- JSON / YAML
- Markdown
- Bash / Shell / PowerShell
- Docker
- Nginx
- Git
- GraphQL
