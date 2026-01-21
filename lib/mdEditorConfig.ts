// MDEditor 代码高亮配置
import rehypePrism from 'rehype-prism-plus';

// 支持的编程语言
export const supportedLanguages = [
  'javascript',
  'typescript',
  'jsx',
  'tsx',
  'python',
  'java',
  'c',
  'cpp',
  'csharp',
  'go',
  'rust',
  'php',
  'ruby',
  'swift',
  'kotlin',
  'sql',
  'html',
  'css',
  'scss',
  'sass',
  'json',
  'xml',
  'yaml',
  'markdown',
  'bash',
  'shell',
  'powershell',
  'docker',
  'nginx',
  'apache',
];

// MDEditor 预览选项配置
export const previewOptions = {
  rehypePlugins: [
    [rehypePrism, { ignoreMissing: true, showLineNumbers: false }],
  ],
};

// 编辑器默认配置
export const editorConfig = {
  height: 600,
  preview: 'live' as const,
  previewOptions,
  textareaProps: {
    placeholder: `在这里输入 Markdown 内容...

支持代码高亮，例如：

\`\`\`javascript
const greeting = "Hello World";
console.log(greeting);
\`\`\`

\`\`\`python
def hello():
    print("Hello World")
    return True
\`\`\`

\`\`\`typescript
interface User {
  name: string;
  age: number;
}
\`\`\`
`,
  },
};
