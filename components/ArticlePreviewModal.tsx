'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import 'highlight.js/styles/github-dark.css';

interface ArticlePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  summary: string;
  content: string;
}

export default function ArticlePreviewModal({
  isOpen,
  onClose,
  title,
  summary,
  content,
}: ArticlePreviewModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 flex-shrink-0">
          <h3 className="text-lg font-semibold text-white">文章预览</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <article>
            <header className="mb-6">
              <h1 className="text-3xl font-display font-bold gradient-text mb-4">
                {title || '无标题'}
              </h1>
              {summary && (
                <div className="bg-slate-800/50 border-l-4 border-blue-500 rounded-r-lg p-4 mb-6">
                  <p className="text-slate-300">{summary}</p>
                </div>
              )}
            </header>
            <div className="markdown-body prose prose-invert max-w-none">
              {content ? (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight, rehypeRaw]}
                >
                  {content}
                </ReactMarkdown>
              ) : (
                <p className="text-slate-500 italic">暂无内容</p>
              )}
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
