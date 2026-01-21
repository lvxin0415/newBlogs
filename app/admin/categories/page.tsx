'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { useToast } from '@/components/ToastContainer';
import ConfirmDialog from '@/components/ConfirmDialog';

export default function AdminCategoriesPage() {
  const router = useRouter();
  const toast = useToast();
  const { isAuthenticated } = useAuthStore();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; categoryId: number | null }>({
    isOpen: false,
    categoryId: null,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    loadCategories();
  }, [isAuthenticated, router]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await fetchCategories();
      setCategories(data.categories);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.warning('分类名称不能为空');
      return;
    }

    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, formData);
        toast.success('分类更新成功！');
      } else {
        await createCategory(formData);
        toast.success('分类创建成功！');
      }
      setShowModal(false);
      setFormData({ name: '', description: '' });
      setEditingCategory(null);
      loadCategories();
    } catch (error: any) {
      toast.error(error.response?.data?.error || '操作失败');
    }
  };

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setFormData({ name: category.name, description: category.description || '' });
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!deleteConfirm.categoryId) return;

    try {
      await deleteCategory(deleteConfirm.categoryId);
      toast.success('分类删除成功！');
      loadCategories();
    } catch (error) {
      console.error('Failed to delete category:', error);
      toast.error('删除失败，请重试');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({ name: '', description: '' });
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-display font-bold">
            <span className="gradient-text">分类管理</span>
          </h1>
          <div className="flex gap-4">
            <button onClick={() => setShowModal(true)} className="btn-primary">
              + 新建分类
            </button>
            <Link href="/admin" className="btn-secondary">
              返回后台
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="loading-spinner"></div>
          </div>
        ) : categories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categories.map((category: any) => (
              <div
                key={category.id}
                className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6 hover:border-blue-500/50 transition-all"
              >
                <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
                <p className="text-slate-400 text-sm mb-4">
                  {category.description || '暂无描述'}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(category)}
                    className="text-blue-400 hover:text-blue-300 text-sm"
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => setDeleteConfirm({ isOpen: true, categoryId: category.id })}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-2xl text-slate-500 mb-4">暂无分类</p>
            <button onClick={() => setShowModal(true)} className="btn-primary">
              创建第一个分类
            </button>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full animate-scale-in">
              <h2 className="text-2xl font-bold mb-6">
                {editingCategory ? '编辑分类' : '新建分类'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    分类名称 *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="input-field"
                    placeholder="请输入分类名称"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">描述</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="input-field min-h-[100px]"
                    placeholder="请输入分类描述"
                    rows={3}
                  />
                </div>
                <div className="flex gap-4 mt-6">
                  <button type="submit" className="btn-primary flex-1">
                    {editingCategory ? '更新' : '创建'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="btn-secondary flex-1"
                  >
                    取消
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* 删除确认对话框 */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="删除分类"
        message="确定要删除这个分类吗？此操作无法撤销。"
        confirmText="删除"
        cancelText="取消"
        type="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, categoryId: null })}
      />
    </div>
  );
}
