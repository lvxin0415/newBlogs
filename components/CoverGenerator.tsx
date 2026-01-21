'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { coverStyles } from '@/lib/gemini';
import { generateCoverByStyle } from '@/lib/image-generator';
import { useToast } from './ToastContainer';

interface CoverGeneratorProps {
  articleTitle: string;
  articleContent?: string;
  onCoverGenerated: (imageUrl: string) => void;
}

export default function CoverGenerator({
  articleTitle,
  articleContent = '',
  onCoverGenerated,
}: CoverGeneratorProps) {
  const toast = useToast();
  const [selectedStyle, setSelectedStyle] = useState(coverStyles[0]);
  const [customPrompt, setCustomPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [showModal, setShowModal] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const title = customPrompt || articleTitle || '未命名文章';
      const imageUrl = await generateCoverByStyle(title, selectedStyle.id);
      setPreviewUrl(imageUrl);
      toast.success('封面生成成功！');
    } catch (error) {
      console.error('Failed to generate cover:', error);
      toast.error('封面生成失败，请重试');
    } finally {
      setGenerating(false);
    }
  };

  const handleUse = () => {
    if (previewUrl) {
      onCoverGenerated(previewUrl);
      setShowModal(false);
      toast.success('封面已应用！');
    }
  };

  return (
    <>
      {/* 触发按钮 */}
      <motion.button
        type="button"
        onClick={() => setShowModal(true)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="btn-primary rounded-xl px-6 py-3 text-sm flex items-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        AI 生成封面
      </motion.button>

      {/* 模态框 */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* 头部 */}
              <div className="p-8 border-b border-border-color flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-display font-bold gradient-text mb-2">
                    AI 封面生成器
                  </h2>
                  <p className="text-text-tertiary text-sm">使用 Canvas 创建专业封面图</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowModal(false)}
                  className="w-12 h-12 glass-card rounded-xl flex items-center justify-center"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>

              {/* 内容区域 */}
              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                {/* 文章信息 */}
                <div className="glass-card rounded-2xl p-6">
                  <label className="text-sm font-display font-semibold text-primary uppercase tracking-wider mb-3 block">
                    文章标题
                  </label>
                  <p className="text-text-primary text-lg">{articleTitle || '未命名文章'}</p>
                </div>

                {/* 样式选择 */}
                <div>
                  <label className="text-sm font-display font-semibold text-primary uppercase tracking-wider mb-4 block">
                    选择风格
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {coverStyles.map((style) => (
                      <motion.button
                        key={style.id}
                        type="button"
                        onClick={() => setSelectedStyle(style)}
                        whileHover={{ y: -4 }}
                        className={`text-left p-6 rounded-2xl transition-all ${
                          selectedStyle.id === style.id
                            ? 'glass-card border-2 border-primary shadow-[0_0_30px_var(--primary-glow)]'
                            : 'glass-card border border-border-color hover:border-secondary'
                        }`}
                      >
                        <h4 className="font-display font-bold text-lg mb-2 text-text-primary">
                          {style.name}
                        </h4>
                        <p className="text-text-tertiary text-sm">{style.description}</p>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* 自定义提示词 */}
                <div>
                  <label className="text-sm font-display font-semibold text-primary uppercase tracking-wider mb-3 block">
                    自定义文本（可选）
                  </label>
                  <textarea
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="输入自定义的封面文字..."
                    className="input-field min-h-[100px] resize-none"
                  />
                  <p className="text-text-tertiary text-xs mt-2">
                    留空则使用文章标题
                  </p>
                </div>

                {/* 预览区域 */}
                {previewUrl && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <label className="text-sm font-display font-semibold text-primary uppercase tracking-wider mb-3 block">
                      预览
                    </label>
                    <div className="glass-card rounded-2xl overflow-hidden p-4">
                      <img
                        src={previewUrl}
                        alt="Generated cover preview"
                        className="w-full h-auto rounded-xl"
                      />
                    </div>
                  </motion.div>
                )}
              </div>

              {/* 底部操作 */}
              <div className="p-8 border-t border-border-color flex gap-4">
                <motion.button
                  type="button"
                  onClick={handleGenerate}
                  disabled={generating}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 btn-primary rounded-xl py-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {generating ? (
                    <>
                      <div className="loading-spinner w-5 h-5" />
                      <span>生成中...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span>生成封面</span>
                    </>
                  )}
                </motion.button>

                {previewUrl && (
                  <motion.button
                    type="button"
                    onClick={handleUse}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 bg-gradient-to-r from-secondary to-accent text-white font-display font-bold py-4 rounded-xl flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>使用这张图片</span>
                  </motion.button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
