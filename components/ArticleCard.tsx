'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

interface ArticleCardProps {
  article: any;
  featured?: boolean;
}

export default function ArticleCard({ article, featured = false }: ArticleCardProps) {
  const {
    id,
    title,
    summary,
    coverImage,
    createdAt,
    views,
    Category,
    Tags = [],
  } = article;

  const formattedDate = new Date(createdAt).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <motion.div
      whileHover={{ y: -8 }}
      className={`glass-card-hover rounded-2xl overflow-hidden h-full flex flex-col group ${
        featured ? 'lg:col-span-1' : ''
      }`}
    >
      <Link href={`/articles/${id}`} className="block">
        {/* 封面图 */}
        {coverImage && (
          <div className="relative h-48 overflow-hidden">
            <img
              src={coverImage}
              alt={title}
              className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
            />
            {/* 渐变遮罩 */}
            <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-transparent to-transparent opacity-60" />
            
            {/* Featured 标签 */}
            {featured && (
              <div className="absolute top-4 right-4 bg-gradient-to-r from-primary to-secondary px-4 py-1 rounded-full">
                <span className="text-xs font-display font-bold text-white uppercase">
                  精选
                </span>
              </div>
            )}
          </div>
        )}

        {/* 内容 */}
        <div className="p-6 flex-1 flex flex-col">
          {/* 分类和日期 */}
          <div className="flex items-center justify-between mb-4 text-sm">
            {Category && (
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-display font-semibold text-xs uppercase tracking-wider border border-primary/20">
                {Category.name}
              </span>
            )}
            <time className="text-text-tertiary font-mono text-xs">
              {formattedDate}
            </time>
          </div>

          {/* 标题 */}
          <h3 className="text-xl font-display font-bold text-text-primary mb-3 line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>

          {/* 摘要 */}
          {summary && (
            <p className="text-text-secondary text-sm line-clamp-3 mb-4 flex-1 font-body leading-relaxed">
              {summary}
            </p>
          )}

          {/* 标签 */}
          {Tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {Tags.slice(0, 3).map((tag: any) => (
                <span
                  key={tag.id}
                  className="px-2 py-1 text-xs rounded-lg bg-surface-2 text-text-tertiary hover:text-secondary hover:bg-surface-3 transition-all font-mono"
                >
                  #{tag.name}
                </span>
              ))}
            </div>
          )}

          {/* 底部信息 */}
          <div className="flex items-center justify-between pt-4 border-t border-border-color">
            <div className="flex items-center gap-4 text-xs text-text-tertiary">
              {/* 阅读量 */}
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span className="font-mono">{views || 0}</span>
              </div>
            </div>

            {/* 阅读更多 */}
            <span className="text-primary text-sm font-display font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
              阅读更多
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
