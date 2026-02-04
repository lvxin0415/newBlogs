'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  fetchArticle,
  updateArticle,
  fetchCategories,
  fetchTags,
  uploadImage
} from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import CustomSelect from '@/components/CustomSelect';
import ArticleEditor from '@/components/ArticleEditor';
import ArticlePreviewModal from '@/components/ArticlePreviewModal';
import { useToast } from '@/components/ToastContainer';

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated } = useAuthStore();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);
  const [showNewTagForm, setShowNewTagForm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    coverImage: '',
    categoryId: '',
    tagIds: [] as string[],
    isPublic: true,
    isTop: false,
    isRecommended: false,
    status: 'draft',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    loadArticleAndOptions();
  }, [isAuthenticated, params.id, router]);

  const loadArticleAndOptions = async () => {
    try {
      setInitialLoading(true);
      const [articleData, categoriesData, tagsData] = await Promise.all([
        fetchArticle(params.id as string),
        fetchCategories(),
        fetchTags(),
      ]);

      const article = articleData.article;
      setFormData({
        title: article.title,
        summary: article.summary || '',
        content: article.content,
        coverImage: article.coverImage || '',
        categoryId: article.categoryId?.toString() || '',
        tagIds: article.tags?.map((tag: any) => tag.id.toString()) || [],
        isPublic: article.isPublic,
        isTop: article.isTop,
        isRecommended: article.isRecommended,
        status: article.status,
      });

      setCategories(categoriesData.categories);
      setTags(tagsData.tags);
    } catch (error) {
      console.error('Failed to load article:', error);
      toast.error('文章加载失败');
      router.push('/admin/articles');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      toast.warning('标题和内容不能为空');
      return;
    }

    setLoading(true);
    try {
      await updateArticle(params.id as string, {
        ...formData,
        categoryId: formData.categoryId || null,
        tagIds: formData.tagIds.map((id) => parseInt(id)),
      });
      toast.success('文章更新成功！');
      router.push('/admin/articles');
    } catch (error) {
      console.error('Failed to update article:', error);
      toast.error('更新失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await uploadImage(file);
      setFormData({ ...formData, coverImage: data.url });
      toast.success('图片上传成功！');
    } catch (error) {
      console.error('Failed to upload image:', error);
      toast.error('图片上传失败，请重试');
    }
  };

  const handleTagToggle = (tagId: string) => {
    setFormData((prev) => ({
      ...prev,
      tagIds: prev.tagIds.includes(tagId)
        ? prev.tagIds.filter((id) => id !== tagId)
        : [...prev.tagIds, tagId],
    }));
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.warning('请输入分类名称');
      return;
    }

    try {
      const { createCategory } = await import('@/lib/api');
      const newCategory = await createCategory({
        name: newCategoryName,
        description: '',
      });

      await loadArticleAndOptions();
      setFormData((prev) => ({ ...prev, categoryId: newCategory.category.id.toString() }));
      setNewCategoryName('');
      setShowNewCategoryForm(false);
      toast.success('分类创建成功！');
    } catch (error) {
      console.error('Failed to create category:', error);
      toast.error('创建分类失败，请重试');
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) {
      toast.warning('请输入标签名称');
      return;
    }

    try {
      const { createTag } = await import('@/lib/api');
      const newTag = await createTag({ name: newTagName });

      await loadArticleAndOptions();
      setFormData((prev) => ({
        ...prev,
        tagIds: [...prev.tagIds, newTag.tag.id.toString()],
      }));
      setNewTagName('');
      setShowNewTagForm(false);
      toast.success('标签创建成功！');
    } catch (error) {
      console.error('Failed to create tag:', error);
      toast.error('创建标签失败，请重试');
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (initialLoading) {
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
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-display font-bold">
            <span className="gradient-text">编辑文章</span>
          </h1>
          <Link href="/admin/articles" className="btn-secondary">
            返回列表
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 标题 */}
          <div>
            <label className="block text-sm font-medium mb-2">标题 *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="input-field"
              placeholder="请输入文章标题"
              required
            />
          </div>

          {/* 摘要 */}
          <div>
            <label className="block text-sm font-medium mb-2">摘要</label>
            <textarea
              value={formData.summary}
              onChange={(e) =>
                setFormData({ ...formData, summary: e.target.value })
              }
              className="input-field min-h-[100px]"
              placeholder="请输入文章摘要"
              rows={3}
            />
          </div>

          {/* 封面图 */}
          <div>
            <label className="block text-sm font-medium mb-2">封面图</label>
            <div className="flex gap-4">
              <input
                type="text"
                value={formData.coverImage}
                onChange={(e) =>
                  setFormData({ ...formData, coverImage: e.target.value })
                }
                className="input-field flex-1"
                placeholder="图片 URL 或上传图片"
              />
              <label className="btn-secondary cursor-pointer">
                上传图片
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
            {formData.coverImage && (
              <div className="mt-2">
                <img
                  src={formData.coverImage}
                  alt="封面预览"
                  className="w-32 h-32 object-cover rounded-lg"
                />
              </div>
            )}
          </div>

          {/* 分类和标签 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium">分类</label>
                <button
                  type="button"
                  onClick={() => setShowNewCategoryForm(!showNewCategoryForm)}
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  新建分类
                </button>
              </div>

              {showNewCategoryForm && (
                <div className="mb-3 p-3 bg-slate-800 border border-slate-700 rounded-lg space-y-2">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="分类名称"
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white placeholder:text-slate-500"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleCreateCategory}
                      className="flex-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                    >
                      创建
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowNewCategoryForm(false);
                        setNewCategoryName('');
                      }}
                      className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs rounded transition-colors"
                    >
                      取消
                    </button>
                  </div>
                </div>
              )}

              <CustomSelect
                value={formData.categoryId}
                onChange={(value) => setFormData({ ...formData, categoryId: value })}
                options={[
                  { value: '', label: '未分类' },
                  ...categories.map((cat: any) => ({
                    value: cat.id.toString(),
                    label: cat.name,
                  })),
                ]}
                placeholder="选择分类"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium">标签</label>
                <button
                  type="button"
                  onClick={() => setShowNewTagForm(!showNewTagForm)}
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  新建标签
                </button>
              </div>

              {showNewTagForm && (
                <div className="mb-3 p-3 bg-slate-800 border border-slate-700 rounded-lg space-y-2">
                  <input
                    type="text"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    placeholder="标签名称"
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white placeholder:text-slate-500"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleCreateTag();
                      }
                    }}
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleCreateTag}
                      className="flex-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                    >
                      创建
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowNewTagForm(false);
                        setNewTagName('');
                      }}
                      className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs rounded transition-colors"
                    >
                      取消
                    </button>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2 p-4 bg-slate-900 border border-slate-800 rounded-lg max-h-32 overflow-y-auto">
                {tags.map((tag: any) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => handleTagToggle(tag.id.toString())}
                    className={`px-3 py-1 rounded-full text-sm transition-all ${formData.tagIds.includes(tag.id.toString())
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 内容 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium">内容 *</label>
              <button
                type="button"
                onClick={() => setShowPreview(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-sm font-medium transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                预览
              </button>
            </div>
            <ArticleEditor
              value={formData.content}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, content: value }))
              }
              height={500}
            />
          </div>

          {/* 设置 */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <h3 className="font-semibold mb-4">文章设置</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isPublic}
                  onChange={(e) =>
                    setFormData({ ...formData, isPublic: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                <span className="text-sm">公开文章</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isTop}
                  onChange={(e) =>
                    setFormData({ ...formData, isTop: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                <span className="text-sm">置顶</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isRecommended}
                  onChange={(e) =>
                    setFormData({ ...formData, isRecommended: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                <span className="text-sm">推荐</span>
              </label>
              <div>
                <CustomSelect
                  value={formData.status}
                  onChange={(value) => setFormData({ ...formData, status: value })}
                  options={[
                    { value: 'draft', label: '草稿' },
                    { value: 'published', label: '发布' },
                  ]}
                  placeholder="选择状态"
                />
              </div>
            </div>
          </div>

          {/* 提交按钮 */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '更新中...' : '更新文章'}
            </button>
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className="btn-secondary"
            >
              预览
            </button>
            <Link href="/admin/articles" className="btn-secondary">
              取消
            </Link>
          </div>
        </form>

        <ArticlePreviewModal
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          title={formData.title}
          summary={formData.summary}
          content={formData.content}
        />
      </div>
    </div>
  );
}
