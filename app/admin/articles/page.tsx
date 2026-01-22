'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchArticles, deleteArticle } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { useToast } from '@/components/ToastContainer';
import ConfirmDialog from '@/components/ConfirmDialog';

export default function AdminArticlesPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const toast = useToast();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; articleId: number | null }>({
    isOpen: false,
    articleId: null,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    loadArticles();
  }, [isAuthenticated, page, router]);

  const loadArticles = async () => {
    try {
      setLoading(true);
      const data = await fetchArticles({ page, limit: 10 });
      setArticles(data.articles);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Failed to load articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm.articleId) return;

    try {
      await deleteArticle(deleteConfirm.articleId);
      toast.success('文章删除成功！');
      loadArticles();
    } catch (error) {
      console.error('Failed to delete article:', error);
      toast.error('删除失败，请重试');
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-display font-bold">
            <span className="gradient-text">文章管理</span>
          </h1>
          <div className="flex gap-4">
            <Link href="/admin/articles/new" className="btn-primary">
              + 新建文章
            </Link>
            <Link href="/admin" className="btn-secondary">
              返回后台
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="loading-spinner"></div>
          </div>
        ) : articles.length > 0 ? (
          <>
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-800/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">标题</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">分类</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">状态</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">浏览</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">创建时间</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {articles.map((article: any) => (
                    <tr key={article.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {article.isTop && (
                            <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded">
                              置顶
                            </span>
                          )}
                          <span className="font-medium">{article.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">
                        {article.category?.name || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs ${article.status === 'published'
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-gray-500/20 text-gray-400'
                            }`}
                        >
                          {article.status === 'published' ? '已发布' : '草稿'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">
                        {article.viewCount}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">
                        {new Date(article.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/articles/${article.id}`}
                            className="text-blue-400 hover:text-blue-300 text-sm"
                          >
                            编辑
                          </Link>
                          <button
                            onClick={() => setDeleteConfirm({ isOpen: true, articleId: article.id })}
                            className="text-red-400 hover:text-red-300 text-sm"
                          >
                            删除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8">
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
            <p className="text-2xl text-slate-500 mb-4">暂无文章</p>
            <Link href="/admin/articles/new" className="btn-primary">
              创建第一篇文章
            </Link>
          </div>
        )}
      </div>

      {/* 删除确认对话框 */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="删除文章"
        message="确定要删除这篇文章吗？此操作无法撤销。"
        confirmText="删除"
        cancelText="取消"
        type="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, articleId: null })}
      />
    </div>
  );
}
