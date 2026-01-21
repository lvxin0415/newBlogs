'use client';

import { useEffect, useRef } from 'react';

interface CommentsProps {
  articleId: number;
  articleTitle: string;
}

export default function Comments({ articleId, articleTitle }: CommentsProps) {
  const commentsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!commentsRef.current) return;

    // 配置 Giscus
    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.setAttribute('data-repo', 'lvxin0415/newBlogs'); // 替换为你的仓库
    script.setAttribute('data-repo-id', 'R_kgDOQ-GyAA'); // 从 https://giscus.app/zh-CN 获取
    script.setAttribute('data-category', 'Announcements'); // 选择合适的分类
    script.setAttribute('data-category-id', 'DIC_kwDOQ-GyAM4C1Onl'); // 从 https://giscus.app/zh-CN 获取
    script.setAttribute('data-mapping', 'pathname');
    script.setAttribute('data-strict', '0');
    script.setAttribute('data-reactions-enabled', '1');
    script.setAttribute('data-emit-metadata', '0');
    script.setAttribute('data-input-position', 'bottom');
    script.setAttribute('data-theme', 'dark');
    script.setAttribute('data-lang', 'zh-CN');
    script.setAttribute('crossorigin', 'anonymous');
    script.async = true;

    commentsRef.current.appendChild(script);

    return () => {
      if (commentsRef.current) {
        commentsRef.current.innerHTML = '';
      }
    };
  }, [articleId]);

  return (
    <div className="mt-16 pt-8 border-t border-slate-800">
      <h2 className="text-2xl font-display font-bold mb-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
        </div>
        <span className="gradient-text">评论区</span>
      </h2>

      {/* Giscus 评论 */}
      <div ref={commentsRef} className="giscus-comments"></div>

    </div>
  );
}
