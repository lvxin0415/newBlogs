'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchTags, createTag, updateTag, deleteTag } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { useToast } from '@/components/ToastContainer';
import ConfirmDialog from '@/components/ConfirmDialog';

export default function AdminTagsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const toast = useToast();
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTag, setEditingTag] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '' });
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; tagId: number | null }>({
    isOpen: false,
    tagId: null,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    loadTags();
  }, [isAuthenticated, router]);

  const loadTags = async () => {
    try {
      setLoading(true);
      const data = await fetchTags();
      setTags(data.tags);
    } catch (error) {
      console.error('Failed to load tags:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.warning('标签名称不能为空');
      return;
    }

    try {
      if (editingTag) {
        await updateTag(editingTag.id, formData);
        toast.success('标签更新成功！');
      } else {
        await createTag(formData);
        toast.success('标签创建成功！');
      }
      setShowModal(false);
      setFormData({ name: '' });
      setEditingTag(null);
      loadTags();
    } catch (error: any) {
      toast.error(error.response?.data?.error || '操作失败');
    }
  };

  const handleEdit = (tag: any) => {
    setEditingTag(tag);
    setFormData({ name: tag.name });
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!deleteConfirm.tagId) return;

    try {
      await deleteTag(deleteConfirm.tagId);
      toast.success('标签删除成功！');
      loadTags();
    } catch (error) {
      console.error('Failed to delete tag:', error);
      toast.error('删除失败，请重试');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTag(null);
    setFormData({ name: '' });
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-display font-bold">
            <span className="gradient-text">标签管理</span>
          </h1>
          <div className="flex gap-4">
            <button onClick={() => setShowModal(true)} className="btn-primary">
              + 新建标签
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
        ) : tags.length > 0 ? (
          <div className="flex flex-wrap gap-4">
            {tags.map((tag: any) => (
              <div
                key={tag.id}
                className="group bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl px-6 py-4 hover:border-blue-500/50 transition-all"
              >
                <div className="flex items-center gap-4">
                  <span className="text-lg font-medium">#{tag.name}</span>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(tag)}
                      className="text-blue-400 hover:text-blue-300 text-sm"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => setDeleteConfirm({ isOpen: true, tagId: tag.id })}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      删除
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-2xl text-slate-500 mb-4">暂无标签</p>
            <button onClick={() => setShowModal(true)} className="btn-primary">
              创建第一个标签
            </button>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full animate-scale-in">
              <h2 className="text-2xl font-bold mb-6">
                {editingTag ? '编辑标签' : '新建标签'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    标签名称 *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="input-field"
                    placeholder="请输入标签名称"
                    required
                  />
                </div>
                <div className="flex gap-4 mt-6">
                  <button type="submit" className="btn-primary flex-1">
                    {editingTag ? '更新' : '创建'}
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
        title="删除标签"
        message="确定要删除这个标签吗？此操作无法撤销。"
        confirmText="删除"
        cancelText="取消"
        type="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, tagId: null })}
      />
    </div>
  );
}
