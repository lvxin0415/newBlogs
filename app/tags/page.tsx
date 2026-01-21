'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchTags } from '@/lib/api';

export default function TagsPage() {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      const data = await fetchTags();
      setTags(data.tags);
    } catch (error) {
      console.error('Failed to load tags:', error);
    } finally {
      setLoading(false);
    }
  };

  // 随机渐变颜色
  const gradients = [
    'from-blue-500 to-cyan-500',
    'from-purple-500 to-pink-500',
    'from-green-500 to-teal-500',
    'from-orange-500 to-red-500',
    'from-indigo-500 to-purple-500',
    'from-yellow-500 to-orange-500',
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="text-5xl md:text-6xl font-display font-bold mb-4">
            <span className="gradient-text">文章标签</span>
          </h1>
          <p className="text-slate-400 text-lg">
            通过标签快速找到感兴趣的内容
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="loading-spinner"></div>
          </div>
        ) : tags.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-4">
            {tags.map((tag: any, index: number) => (
              <Link
                key={tag.id}
                href={`/tags/${tag.id}`}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 0.05}s`, opacity: 0 }}
              >
                <div
                  className={`group relative bg-gradient-to-r ${
                    gradients[index % gradients.length]
                  } p-[2px] rounded-full hover:scale-110 transition-transform`}
                >
                  <div className="bg-slate-900 rounded-full px-6 py-3 group-hover:bg-transparent transition-colors">
                    <span className="font-medium text-slate-200 group-hover:text-white">
                      #{tag.name}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-2xl text-slate-500">暂无标签</p>
          </div>
        )}
      </div>
    </div>
  );
}
