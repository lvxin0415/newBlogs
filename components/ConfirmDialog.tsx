'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface ConfirmDialogProps {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  isOpen,
  title = '确认操作',
  message,
  confirmText = '确认',
  cancelText = '取消',
  type = 'warning',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const colors = {
    danger: {
      icon: 'text-red-400',
      iconBg: 'from-red-500/20 to-rose-500/20',
      button: 'bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600',
    },
    warning: {
      icon: 'text-yellow-400',
      iconBg: 'from-yellow-500/20 to-orange-500/20',
      button: 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600',
    },
    info: {
      icon: 'text-blue-400',
      iconBg: 'from-blue-500/20 to-cyan-500/20',
      button: 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600',
    },
  };

  const currentColor = colors[type];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* 背景遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* 对话框内容 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
          >
            {/* 顶部装饰 */}
            <div className={`h-2 bg-gradient-to-r ${currentColor.iconBg}`} />

            <div className="p-8">
              {/* 图标 */}
              <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${currentColor.iconBg} flex items-center justify-center`}>
                {type === 'danger' && (
                  <svg className={`w-8 h-8 ${currentColor.icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                )}
                {type === 'warning' && (
                  <svg className={`w-8 h-8 ${currentColor.icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                )}
                {type === 'info' && (
                  <svg className={`w-8 h-8 ${currentColor.icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>

              {/* 标题和消息 */}
              <h3 className="text-2xl font-display font-bold text-white text-center mb-3">
                {title}
              </h3>
              <p className="text-white/70 text-center mb-8 leading-relaxed">
                {message}
              </p>

              {/* 按钮 */}
              <div className="flex gap-3">
                <button
                  onClick={onCancel}
                  className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium rounded-xl transition-all"
                >
                  {cancelText}
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                    onCancel();
                  }}
                  className={`flex-1 px-6 py-3 ${currentColor.button} text-white font-bold rounded-xl transition-all shadow-lg`}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
