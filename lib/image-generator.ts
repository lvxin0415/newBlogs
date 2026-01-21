/**
 * 图像生成工具 - 使用 Canvas 生成封面图
 */

interface ImageOptions {
  width?: number;
  height?: number;
  text: string;
  style?: 'brutal' | 'minimal' | 'gradient' | 'cyber';
}

/**
 * 使用 Canvas 生成封面图
 */
export function GenerateImage(options: ImageOptions): Promise<string> {
  const {
    width = 1200,
    height = 675,
    text,
    style = 'brutal',
  } = options;

  return new Promise((resolve) => {
    // 创建 Canvas
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      resolve('');
      return;
    }

    // 根据样式绘制不同背景
    switch (style) {
      case 'brutal':
        drawBrutalStyle(ctx, width, height, text);
        break;
      case 'minimal':
        drawMinimalStyle(ctx, width, height, text);
        break;
      case 'gradient':
        drawGradientStyle(ctx, width, height, text);
        break;
      case 'cyber':
        drawCyberStyle(ctx, width, height, text);
        break;
    }

    // 转换为 Data URL
    resolve(canvas.toDataURL('image/png'));
  });
}

function drawBrutalStyle(ctx: CanvasRenderingContext2D, width: number, height: number, text: string) {
  // 背景
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, width, height);

  // 几何装饰
  ctx.strokeStyle = '#00d4ff';
  ctx.lineWidth = 12;
  ctx.strokeRect(50, 50, 250, 250);

  ctx.strokeStyle = '#8b5cf6';
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.arc(width - 150, 150, 120, 0, Math.PI * 2);
  ctx.stroke();

  // 网格背景
  ctx.strokeStyle = '#1a1a1a';
  ctx.lineWidth = 2;
  for (let i = 0; i < width; i += 60) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, height);
    ctx.stroke();
  }
  for (let i = 0; i < height; i += 60) {
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(width, i);
    ctx.stroke();
  }

  // 文字
  drawText(ctx, text, width, height, '#00d4ff', 'bold');
}

function drawMinimalStyle(ctx: CanvasRenderingContext2D, width: number, height: number, text: string) {
  // 渐变背景
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#1a1a1a');
  gradient.addColorStop(1, '#0a0a0a');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // 简单装饰线
  ctx.strokeStyle = '#00d4ff';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(50, height - 100);
  ctx.lineTo(300, height - 100);
  ctx.stroke();

  // 文字
  drawText(ctx, text, width, height, '#ffffff', 'normal');
}

function drawGradientStyle(ctx: CanvasRenderingContext2D, width: number, height: number, text: string) {
  // 彩色渐变背景
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#8b5cf6');
  gradient.addColorStop(0.5, '#00d4ff');
  gradient.addColorStop(1, '#ec4899');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // 半透明黑色叠加
  ctx.fillStyle = 'rgba(10, 10, 10, 0.7)';
  ctx.fillRect(0, 0, width, height);

  // 文字
  drawText(ctx, text, width, height, '#ffffff', 'bold');
}

function drawCyberStyle(ctx: CanvasRenderingContext2D, width: number, height: number, text: string) {
  // 深色背景
  ctx.fillStyle = '#0a0e27';
  ctx.fillRect(0, 0, width, height);

  // 数字网格效果
  ctx.strokeStyle = '#00d4ff';
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.3;
  
  for (let i = 0; i < width; i += 40) {
    for (let j = 0; j < height; j += 40) {
      if (Math.random() > 0.7) {
        ctx.beginPath();
        ctx.arc(i, j, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  
  ctx.globalAlpha = 1;

  // 霓虹光效
  ctx.fillStyle = '#00d4ff';
  ctx.shadowColor = '#00d4ff';
  ctx.shadowBlur = 40;
  ctx.fillRect(0, height - 20, width, 20);

  // 文字
  ctx.shadowBlur = 0;
  drawText(ctx, text, width, height, '#00d4ff', 'bold');
}

function drawText(ctx: CanvasRenderingContext2D, text: string, width: number, height: number, color: string, weight: string) {
  ctx.fillStyle = color;
  ctx.font = `${weight === 'bold' ? 'bold' : ''} 72px "Orbitron", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // 文字阴影
  ctx.shadowColor = color;
  ctx.shadowBlur = 30;
  
  // 分行显示
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  
  words.forEach((word) => {
    const testLine = currentLine + word + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > width - 200 && currentLine) {
      lines.push(currentLine);
      currentLine = word + ' ';
    } else {
      currentLine = testLine;
    }
  });
  lines.push(currentLine);

  // 绘制文字
  const lineHeight = 90;
  const startY = height / 2 - ((lines.length - 1) * lineHeight) / 2;
  
  lines.forEach((line, i) => {
    ctx.fillText(line.trim().toUpperCase(), width / 2, startY + i * lineHeight);
  });
}

/**
 * 根据样式ID生成封面
 */
export async function generateCoverByStyle(title: string, styleId: string): Promise<string> {
  const styleMap: Record<string, 'brutal' | 'minimal' | 'gradient' | 'cyber'> = {
    'brutal-tech': 'brutal',
    'minimal-code': 'minimal',
    'cyber-future': 'cyber',
    'abstract-data': 'gradient',
    'editorial-bold': 'brutal',
  };

  const style = styleMap[styleId] || 'brutal';
  return GenerateImage({ text: title, style });
}
