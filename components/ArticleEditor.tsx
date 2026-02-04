'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';

const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] rounded-xl bg-slate-800/50 border border-slate-700 animate-pulse flex items-center justify-center">
      <span className="text-slate-500">加载编辑器中...</span>
    </div>
  ),
});

import 'react-quill/dist/quill.snow.css';

interface ArticleEditorProps {
  value: string;
  onChange: (value: string) => void;
  height?: number;
  placeholder?: string;
}

export default function ArticleEditor({
  value,
  onChange,
  height = 400,
  placeholder = '在这里输入文章内容...',
}: ArticleEditorProps) {
  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        [{ font: [] }, { size: ['small', false, 'large', 'huge'] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ color: [] }, { background: [] }],
        [{ align: [] }],
        [{ indent: '-1' }, { indent: '+1' }],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link', 'image'],
        ['blockquote', 'code-block'],
        ['clean'],
      ],
    }),
    []
  );

  return (
    <div className="article-editor-quill">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        placeholder={placeholder}
        style={{ minHeight: height }}
        className="quill-editor-dark"
      />
    </div>
  );
}
