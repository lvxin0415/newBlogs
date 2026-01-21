'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { createArticle, fetchCategories, fetchTags, uploadImage } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import CoverGenerator from '@/components/CoverGenerator';
import CustomSelect from '@/components/CustomSelect';
import { useToast } from '@/components/ToastContainer';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';
import 'prismjs/themes/prism-tomorrow.css';
import '@/lib/prismLoader';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

export default function NewArticlePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);
  const [showNewTagForm, setShowNewTagForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDesc, setNewCategoryDesc] = useState('');
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
    loadCategoriesAndTags();
  }, [isAuthenticated, router]);

  const loadCategoriesAndTags = async () => {
    try {
      const [categoriesData, tagsData] = await Promise.all([
        fetchCategories(),
        fetchTags(),
      ]);
      setCategories(categoriesData.categories);
      setTags(tagsData.tags);
    } catch (error) {
      console.error('Failed to load categories and tags:', error);
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
      await createArticle({
        ...formData,
        categoryId: formData.categoryId || null,
        tagIds: formData.tagIds.map((id) => parseInt(id)),
      });
      toast.success('文章创建成功！');
      router.push('/admin/articles');
    } catch (error) {
      console.error('Failed to create article:', error);
      toast.error('创建失败，请重试');
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
        description: newCategoryDesc,
      });
      
      // 刷新分类列表
      await loadCategoriesAndTags();
      
      // 自动选中新创建的分类
      setFormData({ ...formData, categoryId: newCategory.category.id.toString() });
      
      // 重置表单
      setNewCategoryName('');
      setNewCategoryDesc('');
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
      
      // 刷新标签列表
      await loadCategoriesAndTags();
      
      // 自动选中新创建的标签
      setFormData((prev) => ({
        ...prev,
        tagIds: [...prev.tagIds, newTag.tag.id.toString()],
      }));
      
      // 重置表单
      setNewTagName('');
      setShowNewTagForm(false);
      
      toast.success('标签创建成功！');
    } catch (error) {
      console.error('Failed to create tag:', error);
      toast.error('创建标签失败，请重试');
    }
  };

  // 字数统计
  const wordCount = formData.content.replace(/\s+/g, '').length;
  const readingTime = Math.ceil(wordCount / 400);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#00d4ff]/5 rounded-full blur-[120px] animate-pulse-glow"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#8b5cf6]/5 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* 主内容 */}
      <div className="relative z-10">
        {/* 顶部导航栏 */}
        <div className="sticky top-0 z-50 backdrop-blur-xl bg-[#0a0a0a]/80 border-b border-white/5">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="flex items-center justify-between h-20">
              <div className="flex items-center gap-6">
                <Link 
                  href="/admin/articles" 
                  className="group flex items-center gap-2 text-[#94a3b8] hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="font-medium">返回列表</span>
                </Link>
                
                <div className="h-6 w-px bg-white/10"></div>
                
                <h1 className="text-2xl font-display font-bold gradient-text">
                  新建文章
                </h1>
              </div>

              <div className="flex items-center gap-4">
                {/* 统计信息 */}
                <div className="hidden lg:flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#00d4ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-[#94a3b8]">{wordCount} 字</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#8b5cf6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-[#94a3b8]">约 {readingTime} 分钟</span>
                  </div>
                </div>

                {/* 快速保存按钮 */}
                <button
                  type="button"
                  onClick={() => {
                    setAutoSaving(true);
                    setTimeout(() => {
                      setAutoSaving(false);
                      setLastSaved(new Date());
                    }, 1000);
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-[#00d4ff]/50 hover:bg-white/10 transition-all text-sm font-medium"
                >
                  <svg className={`w-4 h-4 ${autoSaving ? 'animate-spin text-[#00d4ff]' : 'text-[#94a3b8]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  {autoSaving ? '保存中...' : '保存草稿'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 主表单区域 */}
        <div className="container mx-auto px-4 lg:px-8 py-12">
          <form onSubmit={handleSubmit} className="max-w-6xl mx-auto">
            {/* 文章标题区域 - 大而突出 */}
            <div className="mb-12 animate-fade-in-up">
              <div className="relative">
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-transparent border-none outline-none text-5xl lg:text-6xl font-display font-bold text-white placeholder:text-white/20 focus:placeholder:text-white/30 transition-colors py-4"
                  placeholder="无标题的杰作..."
                  required
                />
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00d4ff] to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
              </div>
            </div>

            {/* 主要内容网格 */}
            <div className="grid lg:grid-cols-[1fr_320px] gap-8">
              {/* 左侧 - 主编辑区 */}
              <div className="space-y-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                {/* 摘要 */}
                <section className="group">
                  <label className="flex items-center gap-2 text-sm font-display font-semibold text-[#00d4ff] uppercase tracking-wider mb-4">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                    </svg>
                    文章摘要
                  </label>
                  <div className="relative">
                    <textarea
                      value={formData.summary}
                      onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                      className="w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-[#cbd5e1] placeholder:text-white/30 focus:border-[#00d4ff]/50 focus:bg-white/10 transition-all outline-none resize-none text-lg leading-relaxed"
                      placeholder="用一两句话概括文章的核心内容..."
                      rows={3}
                    />
                    <div className="absolute bottom-4 right-4 text-xs text-white/30 font-mono">
                      {formData.summary.length} / 200
                    </div>
                  </div>
                </section>

                {/* 内容编辑器 */}
                <section className="group">
                  <label className="flex items-center justify-between mb-4">
                    <span className="flex items-center gap-2 text-sm font-display font-semibold text-[#00d4ff] uppercase tracking-wider">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      正文内容
                    </span>
                    <span className="text-xs text-white/40 font-mono">Markdown</span>
                  </label>
                  <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm transition-all hover:border-[#00d4ff]/30" data-color-mode="dark">
                    <MDEditor
                      value={formData.content}
                      onChange={(value) => setFormData({ ...formData, content: value || '' })}
                      height={600}
                      preview="live"
                      className="!bg-transparent !border-none"
                      highlightEnable={true}
                      textareaProps={{
                        placeholder: '在这里输入 Markdown 内容...\n\n支持代码高亮，例如：\n```javascript\nconst greeting = "Hello World";\nconsole.log(greeting);\n```',
                      }}
                    />
                  </div>
                </section>
              </div>

              {/* 右侧 - 设置面板 */}
              <aside className="space-y-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                {/* 发布设置 */}
                <div className="sticky top-24 space-y-6">
                  {/* 封面图 */}
                  <section className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 transition-all hover:border-[#00d4ff]/30">
                    <label className="flex items-center justify-between mb-4">
                      <span className="text-sm font-display font-semibold text-white uppercase tracking-wider">封面图</span>
                      <span className="px-2 py-1 bg-gradient-to-r from-[#00d4ff] to-[#8b5cf6] text-[#0a0a0a] text-xs font-display font-bold rounded">
                        AI
                      </span>
                    </label>
                    
                    {formData.coverImage ? (
                      <div className="group/cover relative mb-4 rounded-xl overflow-hidden border-2 border-[#00d4ff]/30">
                        <img
                          src={formData.coverImage}
                          alt="封面预览"
                          className="w-full aspect-video object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/cover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, coverImage: '' })}
                            className="p-2 bg-red-500/80 hover:bg-red-500 rounded-lg transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mb-4 aspect-video bg-white/5 border-2 border-dashed border-white/10 rounded-xl flex items-center justify-center">
                        <div className="text-center p-4">
                          <svg className="w-12 h-12 mx-auto mb-2 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="text-xs text-white/40">暂无封面</p>
                        </div>
                      </div>
                    )}

                    <div className="space-y-3">
                      <CoverGenerator
                        articleTitle={formData.title || '未命名文章'}
                        articleContent={formData.content}
                        onCoverGenerated={(url) => setFormData({ ...formData, coverImage: url })}
                      />
                      
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-white/10"></div>
                        </div>
                        <div className="relative flex justify-center text-xs">
                          <span className="bg-[#0a0a0a] px-2 text-white/40">或</span>
                        </div>
                      </div>

                      <label className="block">
                        <span className="text-xs text-white/60 mb-2 block">图片URL</span>
                        <input
                          type="text"
                          value={formData.coverImage}
                          onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-[#00d4ff]/50 focus:bg-white/10 transition-all outline-none"
                          placeholder="https://..."
                        />
                      </label>

                      <label className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#00d4ff]/50 rounded-lg cursor-pointer transition-all group/upload">
                        <svg className="w-4 h-4 text-[#94a3b8] group-hover/upload:text-[#00d4ff] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <span className="text-sm font-medium text-[#94a3b8] group-hover/upload:text-white transition-colors">上传本地图片</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </section>

                  {/* 分类 */}
                  <section className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 transition-all hover:border-[#8b5cf6]/30">
                    <label className="flex items-center justify-between mb-4">
                      <span className="flex items-center gap-2 text-sm font-display font-semibold text-white uppercase tracking-wider">
                        <svg className="w-4 h-4 text-[#8b5cf6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                        分类
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowNewCategoryForm(!showNewCategoryForm)}
                        className="flex items-center gap-1 px-3 py-1 bg-[#8b5cf6]/20 hover:bg-[#8b5cf6]/30 border border-[#8b5cf6]/50 text-[#8b5cf6] text-xs font-medium rounded-lg transition-all"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        新建
                      </button>
                    </label>
                    
                    {showNewCategoryForm ? (
                      <div className="space-y-3 mb-4 p-4 bg-white/5 border border-[#8b5cf6]/30 rounded-xl">
                        <input
                          type="text"
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          placeholder="分类名称 *"
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-[#8b5cf6]/50 focus:bg-white/10 transition-all outline-none"
                        />
                        <textarea
                          value={newCategoryDesc}
                          onChange={(e) => setNewCategoryDesc(e.target.value)}
                          placeholder="分类描述（可选）"
                          rows={2}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-[#8b5cf6]/50 focus:bg-white/10 transition-all outline-none resize-none"
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={handleCreateCategory}
                            className="flex-1 px-3 py-2 bg-[#8b5cf6] hover:bg-[#8b5cf6]/90 text-white text-xs font-medium rounded-lg transition-all"
                          >
                            创建
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowNewCategoryForm(false);
                              setNewCategoryName('');
                              setNewCategoryDesc('');
                            }}
                            className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 text-xs font-medium rounded-lg transition-all"
                          >
                            取消
                          </button>
                        </div>
                      </div>
                    ) : null}
                    
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
                  </section>

                  {/* 标签 */}
                  <section className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 transition-all hover:border-[#ec4899]/30">
                    <label className="flex items-center justify-between mb-4">
                      <span className="flex items-center gap-2 text-sm font-display font-semibold text-white uppercase tracking-wider">
                        <svg className="w-4 h-4 text-[#ec4899]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        标签
                        <span className="ml-2 text-xs font-normal text-white/40">
                          {formData.tagIds.length} 个已选
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowNewTagForm(!showNewTagForm)}
                        className="flex items-center gap-1 px-3 py-1 bg-[#ec4899]/20 hover:bg-[#ec4899]/30 border border-[#ec4899]/50 text-[#ec4899] text-xs font-medium rounded-lg transition-all"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        新建
                      </button>
                    </label>
                    
                    {showNewTagForm ? (
                      <div className="space-y-3 mb-4 p-4 bg-white/5 border border-[#ec4899]/30 rounded-xl">
                        <input
                          type="text"
                          value={newTagName}
                          onChange={(e) => setNewTagName(e.target.value)}
                          placeholder="标签名称 *"
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-[#ec4899]/50 focus:bg-white/10 transition-all outline-none"
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
                            className="flex-1 px-3 py-2 bg-gradient-to-r from-[#ec4899] to-[#8b5cf6] hover:from-[#ec4899]/90 hover:to-[#8b5cf6]/90 text-white text-xs font-medium rounded-lg transition-all"
                          >
                            创建
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowNewTagForm(false);
                              setNewTagName('');
                            }}
                            className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 text-xs font-medium rounded-lg transition-all"
                          >
                            取消
                          </button>
                        </div>
                      </div>
                    ) : null}
                    
                    <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto scrollbar-hide">
                      {tags.map((tag: any) => (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => handleTagToggle(tag.id.toString())}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            formData.tagIds.includes(tag.id.toString())
                              ? 'bg-gradient-to-r from-[#ec4899] to-[#8b5cf6] text-white shadow-lg shadow-[#ec4899]/20'
                              : 'bg-white/5 text-[#94a3b8] border border-white/10 hover:border-[#ec4899]/50 hover:text-white'
                          }`}
                        >
                          {tag.name}
                        </button>
                      ))}
                      {tags.length === 0 && !showNewTagForm && (
                        <p className="text-white/40 text-sm">暂无标签，点击"新建"创建第一个标签</p>
                      )}
                    </div>
                  </section>

                  {/* 发布选项 */}
                  <section className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
                    <h3 className="flex items-center gap-2 text-sm font-display font-semibold text-white uppercase tracking-wider mb-6">
                      <svg className="w-4 h-4 text-[#00d4ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      发布选项
                    </h3>
                    <div className="space-y-4">
                      <label className="flex items-center justify-between cursor-pointer group/option">
                        <span className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                            formData.isPublic 
                              ? 'bg-[#00d4ff] border-[#00d4ff]' 
                              : 'border-white/20 group-hover/option:border-white/40'
                          }`}>
                            {formData.isPublic && (
                              <svg className="w-3 h-3 text-[#0a0a0a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <span className="text-sm font-medium text-white">公开发布</span>
                        </span>
                        <input
                          type="checkbox"
                          checked={formData.isPublic}
                          onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                          className="sr-only"
                        />
                      </label>

                      <label className="flex items-center justify-between cursor-pointer group/option">
                        <span className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                            formData.isTop 
                              ? 'bg-[#8b5cf6] border-[#8b5cf6]' 
                              : 'border-white/20 group-hover/option:border-white/40'
                          }`}>
                            {formData.isTop && (
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <span className="text-sm font-medium text-white">置顶显示</span>
                        </span>
                        <input
                          type="checkbox"
                          checked={formData.isTop}
                          onChange={(e) => setFormData({ ...formData, isTop: e.target.checked })}
                          className="sr-only"
                        />
                      </label>

                      <label className="flex items-center justify-between cursor-pointer group/option">
                        <span className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                            formData.isRecommended 
                              ? 'bg-[#ec4899] border-[#ec4899]' 
                              : 'border-white/20 group-hover/option:border-white/40'
                          }`}>
                            {formData.isRecommended && (
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <span className="text-sm font-medium text-white">推荐文章</span>
                        </span>
                        <input
                          type="checkbox"
                          checked={formData.isRecommended}
                          onChange={(e) => setFormData({ ...formData, isRecommended: e.target.checked })}
                          className="sr-only"
                        />
                      </label>

                      <div className="pt-4 border-t border-white/10">
                        <label className="block">
                          <span className="text-xs text-white/60 mb-2 block">发布状态</span>
                          <CustomSelect
                            value={formData.status}
                            onChange={(value) => setFormData({ ...formData, status: value })}
                            options={[
                              { value: 'draft', label: '草稿' },
                              { value: 'published', label: '发布' },
                            ]}
                            className="text-sm"
                          />
                        </label>
                      </div>
                    </div>
                  </section>

                  {/* 提交按钮 */}
                  <div className="space-y-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 px-6 bg-gradient-to-r from-[#00d4ff] to-[#8b5cf6] hover:from-[#00d4ff]/90 hover:to-[#8b5cf6]/90 text-white font-display font-bold text-sm uppercase tracking-wider rounded-xl shadow-lg shadow-[#00d4ff]/20 hover:shadow-xl hover:shadow-[#00d4ff]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          创建中...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          创建文章
                        </span>
                      )}
                    </button>
                    
                    <Link 
                      href="/admin/articles"
                      className="block w-full py-3 px-6 text-center bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-[#94a3b8] hover:text-white font-medium rounded-xl transition-all"
                    >
                      取消
                    </Link>
                  </div>
                </div>
              </aside>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
