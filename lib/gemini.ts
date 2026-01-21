// Gemini 图像生成配置
// 注意：需要在 .env 中配置 GEMINI_API_KEY

interface GenerateImageOptions {
  prompt: string;
  style?: 'photorealistic' | 'illustration' | 'abstract' | 'minimalist';
  aspectRatio?: '16:9' | '4:3' | '1:1';
}

/**
 * 使用 Gemini 生成文章封面图
 * @param options 生成选项
 * @returns 图片 URL 或 Base64
 */
export async function generateArticleCover(options: GenerateImageOptions): Promise<string> {
  const { prompt } = options;
  
  // 使用本地 Canvas 生成（需要在客户端调用）
  // 这里返回一个标记，让组件知道使用 Canvas 生成
  return prompt;
}

/**
 * 根据文章标题和内容生成智能提示词
 */
export function generatePromptFromArticle(title: string, content: string): string {
  // 提取关键词
  const keywords = extractKeywords(title + ' ' + content);
  
  // 构建提示词
  return `Tech blog cover: ${title}. Key concepts: ${keywords.slice(0, 5).join(', ')}`;
}

/**
 * 简单的关键词提取
 */
function extractKeywords(text: string): string[] {
  // 移除 Markdown 语法
  const cleanText = text.replace(/[#*`]/g, '');
  
  // 分词并过滤
  const words = cleanText
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 3)
    .filter(word => !['this', 'that', 'with', 'from', 'have', 'will'].includes(word));
  
  // 统计词频
  const frequency: Record<string, number> = {};
  words.forEach(word => {
    frequency[word] = (frequency[word] || 0) + 1;
  });
  
  // 排序并返回
  return Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .map(([word]) => word);
}

/**
 * 预设的封面样式模板
 */
export const coverStyles = [
  {
    id: 'brutal-tech',
    name: 'Neo-Brutalist Tech',
    description: '粗重边框、霓虹色、几何图形',
    prompt: 'Neo-brutalist tech design with bold borders, neon colors (#ff3366, #00ffcc), geometric shapes, dark background, modern and edgy',
  },
  {
    id: 'minimal-code',
    name: 'Minimalist Code',
    description: '简约代码风格',
    prompt: 'Minimalist code-themed design, clean lines, monospace font, terminal aesthetic, dark mode, syntax highlighting colors',
  },
  {
    id: 'cyber-future',
    name: 'Cyberpunk Future',
    description: '赛博朋克未来感',
    prompt: 'Cyberpunk futuristic tech design, neon lights, digital grid, holographic effects, purple and cyan colors, high-tech atmosphere',
  },
  {
    id: 'abstract-data',
    name: 'Abstract Data',
    description: '抽象数据可视化',
    prompt: 'Abstract data visualization, flowing particles, network connections, gradient colors, dynamic composition, tech and science',
  },
  {
    id: 'editorial-bold',
    name: 'Editorial Bold',
    description: '编辑风格大标题',
    prompt: 'Bold editorial design, large typography, striking composition, magazine style, professional and modern, high contrast',
  },
];
