'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ArticleCard from '@/components/ArticleCard';
import { fetchCategory, fetchArticles } from '@/lib/api';

export default function CategoryDetailPage() {
  const params = useParams();
  const [category, setCategory] = useState<any>(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (params.id) {
      loadCategoryAndArticles();
    }
  }, [params.id, page]);

  const loadCategoryAndArticles = async () => {
    try {
      setLoading(true);
      const [categoryData, articlesData] = await Promise.all([
        fetchCategory(params.id as string),
        fetchArticles({ category: params.id, page, limit: 9 }),
      ]);
      setCategory(categoryData.category);
      setArticles(articlesData.articles);
      setTotalPages(articlesData.totalPages);
    } catch (error) {
      console.error('Failed to load category:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !category) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center items-center h-64">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Category Header */}
        <div className="text-center mb-12 animate-fade-in-up">
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-blue-400 mb-6 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            返回分类列表
          </Link>

          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                />
              </svg>
            </div>
          </div>

          <h1 className="text-5xl font-display font-bold mb-4">
            <span className="gradient-text">{category?.name}</span>
          </h1>
          {category?.description && (
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              {category.description}
            </p>
          )}
        </div>

        {/* Articles Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="loading-spinner"></div>
          </div>
        ) : articles.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.map((article: any, index: number) => (
                <div
                  key={article.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s`, opacity: 0 }}
                >
                  <ArticleCard article={article} />
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-12">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  上一页
                </button>
                <span className="text-slate-400">
                  第 {page} 页 / 共 {totalPages} 页
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  下一页
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <p className="text-2xl text-slate-500">该分类下暂无文章</p>
          </div>
        )}
      </div>
    </div>
  );
}
