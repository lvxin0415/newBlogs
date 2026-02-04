'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Head from 'next/head';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import { fetchArticle } from '@/lib/api';
import Comments from '@/components/Comments';
import 'highlight.js/styles/github-dark.css';

export default function ArticlePage() {
  const params = useParams();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeHeading, setActiveHeading] = useState('');

  useEffect(() => {
    if (params.id) {
      loadArticle();
    }
  }, [params.id]);

  useEffect(() => {
    // 监听滚动，高亮当前标题
    const handleScroll = () => {
      const headings = document.querySelectorAll('.markdown-body h2, .markdown-body h3');
      let current = '';

      headings.forEach((heading) => {
        const rect = heading.getBoundingClientRect();
        if (rect.top <= 100) {
          current = heading.id;
        }
      });

      setActiveHeading(current);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [article]);

  const loadArticle = async () => {
    try {
      setLoading(true);
      const data = await fetchArticle(params.id as string);
      setArticle(data.article);

      // 生成目录 ID
      setTimeout(() => {
        const headings = document.querySelectorAll('.markdown-body h2, .markdown-body h3');
        headings.forEach((heading, index) => {
          heading.id = `heading-${index}`;
        });
      }, 100);
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError('该文章为私密文章，需要登录查看');
      } else {
        setError('文章加载失败');
      }
      console.error('Failed to load article:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="flex justify-center items-center h-64">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="text-center">
          <p className="text-2xl text-red-400 mb-4">{error || '文章不存在'}</p>
          <Link href="/" className="btn-primary">
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(article.createdAt).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const headings = [];
  if (article.content) {
    if (article.content.trim().startsWith('<')) {
      const htmlRegex = /<h([23])[^>]*>([^<]+)<\/h[23]>/gi;
      let match;
      let index = 0;
      while ((match = htmlRegex.exec(article.content)) !== null) {
        headings.push({
          level: parseInt(match[1]),
          text: match[2].trim(),
          id: `heading-${index}`,
        });
        index++;
      }
    } else {
      const mdRegex = /^(#{2,3})\s+(.+)$/gm;
      let match;
      let index = 0;
      while ((match = mdRegex.exec(article.content)) !== null) {
        headings.push({
          level: match[1].length,
          text: match[2],
          id: `heading-${index}`,
        });
        index++;
      }
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-[1fr_300px] gap-8">
          {/* Main Content */}
          <article className="animate-fade-in-up">
            {/* Header */}
            <header className="mb-8">
              <h1 className="text-4xl md:text-5xl font-display font-bold mb-6 gradient-text">
                {article.title}
              </h1>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 mb-6">
                <time>{formattedDate}</time>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  {article.viewCount} 次阅读
                </span>
              </div>

              {/* Category and Tags */}
              <div className="flex flex-wrap items-center gap-3">
                {article.category && (
                  <Link
                    href={`/categories/${article.category.id}`}
                    className="bg-blue-600/20 text-blue-400 px-3 py-1 rounded-lg text-sm hover:bg-blue-600/30 transition-colors"
                  >
                    {article.category.name}
                  </Link>
                )}
                {article.tags?.map((tag: any) => (
                  <Link
                    key={tag.id}
                    href={`/tags/${tag.id}`}
                    className="tag"
                  >
                    #{tag.name}
                  </Link>
                ))}
              </div>
            </header>

            {/* Summary */}
            {article.summary && (
              <div className="bg-slate-900/50 border-l-4 border-blue-500 rounded-r-lg p-6 mb-8">
                <p className="text-lg text-slate-300">{article.summary}</p>
              </div>
            )}

            {/* Content */}
            <div className="markdown-body prose prose-invert max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight, rehypeRaw]}
              >
                {article.content}
              </ReactMarkdown>
            </div>

            {/* Comments */}
            <Comments articleId={article.id} articleTitle={article.title} />

            {/* Footer */}
            <footer className="mt-12 pt-8 border-t border-slate-800">
              <Link href="/" className="btn-secondary">
                ← 返回首页
              </Link>
            </footer>
          </article>

          {/* Sidebar - Table of Contents */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">目录</h3>
                {headings.length > 0 ? (
                  <nav className="space-y-2">
                    {headings.map((heading) => (
                      <a
                        key={heading.id}
                        href={`#${heading.id}`}
                        className={`block text-sm transition-colors ${
                          activeHeading === heading.id
                            ? 'text-blue-400 font-medium'
                            : 'text-slate-400 hover:text-blue-400'
                        } ${heading.level === 3 ? 'ml-4' : ''}`}
                      >
                        {heading.text}
                      </a>
                    ))}
                  </nav>
                ) : (
                  <p className="text-sm text-slate-500">暂无目录</p>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
