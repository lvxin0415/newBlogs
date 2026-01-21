'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchArticles, fetchCategories, fetchTags } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

export default function StatsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalArticles: 0,
    publishedArticles: 0,
    draftArticles: 0,
    totalViews: 0,
    totalCategories: 0,
    totalTags: 0,
    recentArticles: [] as any[],
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    loadStats();
  }, [isAuthenticated, router]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const [articlesData, categoriesData, tagsData] = await Promise.all([
        fetchArticles({ limit: 100 }),
        fetchCategories(),
        fetchTags(),
      ]);

      const articles = articlesData.articles;
      const publishedCount = articles.filter((a: any) => a.status === 'published').length;
      const draftCount = articles.filter((a: any) => a.status === 'draft').length;
      const totalViews = articles.reduce((sum: number, a: any) => sum + (a.viewCount || 0), 0);

      setStats({
        totalArticles: articles.length,
        publishedArticles: publishedCount,
        draftArticles: draftCount,
        totalViews,
        totalCategories: categoriesData.categories.length,
        totalTags: tagsData.tags.length,
        recentArticles: articles.slice(0, 5),
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center items-center h-64">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: '文章总数',
      value: stats.totalArticles,
      gradient: 'from-blue-500 to-cyan-500',
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      ),
    },
    {
      title: '已发布',
      value: stats.publishedArticles,
      gradient: 'from-green-500 to-teal-500',
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      ),
    },
    {
      title: '草稿',
      value: stats.draftArticles,
      gradient: 'from-yellow-500 to-orange-500',
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      ),
    },
    {
      title: '总阅读量',
      value: stats.totalViews,
      gradient: 'from-purple-500 to-pink-500',
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      ),
    },
    {
      title: '分类数',
      value: stats.totalCategories,
      gradient: 'from-indigo-500 to-purple-500',
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      ),
    },
    {
      title: '标签数',
      value: stats.totalTags,
      gradient: 'from-pink-500 to-rose-500',
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      ),
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-display font-bold">
            <span className="gradient-text">统计概览</span>
          </h1>
          <Link href="/admin" className="btn-secondary">
            返回后台
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {statCards.map((card, index) => (
            <div
              key={card.title}
              className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6 animate-fade-in-up card-hover"
              style={{ animationDelay: `${index * 0.1}s`, opacity: 0 }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-14 h-14 bg-gradient-to-br ${card.gradient} rounded-xl flex items-center justify-center`}>
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {card.icon}
                  </svg>
                </div>
              </div>
              <h3 className="text-slate-400 text-sm mb-2">{card.title}</h3>
              <p className="text-4xl font-bold">{card.value}</p>
            </div>
          ))}
        </div>

        {/* Recent Articles */}
        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-slate-800">
            <h2 className="text-2xl font-display font-bold flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="gradient-text">最近文章</span>
            </h2>
          </div>
          <div className="divide-y divide-slate-800">
            {stats.recentArticles.length > 0 ? (
              stats.recentArticles.map((article: any) => (
                <Link
                  key={article.id}
                  href={`/articles/${article.id}`}
                  className="block p-6 hover:bg-slate-800/30 transition-colors group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold mb-2 group-hover:text-blue-400 transition-colors">
                        {article.title}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          article.status === 'published'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {article.status === 'published' ? '已发布' : '草稿'}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          {article.viewCount || 0}
                        </span>
                        <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-slate-600 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))
            ) : (
              <div className="p-12 text-center text-slate-500">
                暂无文章
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
