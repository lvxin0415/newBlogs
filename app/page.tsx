'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import ArticleCard from '@/components/ArticleCard';
import SearchBar from '@/components/SearchBar';
import CategoryFilter from '@/components/CategoryFilter';
import { fetchArticles } from '@/lib/api';

export default function Home() {
  const [articles, setArticles] = useState([]);
  const [recommendedArticles, setRecommendedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({ total: 0, categories: 0, tags: 0 });

  useEffect(() => {
    loadArticles();
    loadRecommended();
  }, [page, selectedCategory, searchQuery]);

  const loadArticles = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit: 9 };
      if (selectedCategory) params.category = selectedCategory;
      if (searchQuery) params.search = searchQuery;

      const data = await fetchArticles(params);
      setArticles(data.articles);
      setTotalPages(data.totalPages);
      setStats({
        total: data.total || articles.length,
        categories: 12,
        tags: 45,
      });
    } catch (error) {
      console.error('Failed to load articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecommended = async () => {
    try {
      const data = await fetchArticles({ limit: 3, page: 1 });
      const recommended = data.articles.filter((article: any) => article.isRecommended);
      setRecommendedArticles(recommended.slice(0, 3));
    } catch (error) {
      console.error('Failed to load recommended articles:', error);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setPage(1);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-4 overflow-hidden">
        {/* 装饰元素 */}
        <div className="absolute top-40 left-10 w-72 h-72 bg-primary/10 rounded-full blur-[100px] animate-float" />
        <div className="absolute top-60 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-[120px] animate-float" style={{ animationDelay: '2s' }} />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            {/* 主标题 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="mb-8"
            >
              <h1 className="text-6xl md:text-8xl font-display font-bold mb-4">
                <span className="gradient-text glow-primary">TECH</span>
                <br />
                <span className="text-text-primary">INSIGHTS</span>
              </h1>
              <div className="h-1 w-32 mx-auto bg-gradient-to-r from-primary via-secondary to-accent rounded-full" />
            </motion.div>
            
            {/* 副标题 */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-xl md:text-2xl text-text-secondary font-body max-w-3xl mx-auto mb-12 leading-relaxed"
            >
              探索前端、后端、Web3 和人工智能的前沿技术
              <br />
              <span className="text-primary">分享经验 · 记录成长 · 创造价值</span>
            </motion.p>
            
            {/* 统计数据 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="flex flex-wrap justify-center gap-8 mb-12"
            >
              {[
                { label: '文章', value: stats.total, color: 'primary' },
                { label: '分类', value: stats.categories, color: 'secondary' },
                { label: '标签', value: stats.tags, color: 'accent' },
              ].map((stat, index) => (
                <div
                  key={stat.label}
                  className="glass-card px-8 py-4 rounded-2xl hover:scale-105 transition-transform"
                >
                  <div className={`text-4xl font-display font-bold text-${stat.color} mb-1`}>
                    {stat.value}+
                  </div>
                  <div className="text-text-tertiary text-sm font-body tracking-wider">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
            
            {/* CTA 按钮 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="flex flex-wrap justify-center gap-4"
            >
              <Link href="#articles" className="btn-primary rounded-full px-8 py-4">
                探索文章
              </Link>
              <Link href="/about" className="btn-secondary rounded-full px-8 py-4">
                关于我们
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 推荐文章 */}
      {recommendedArticles.length > 0 && (
        <section className="py-20 px-4 relative">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
                <span className="gradient-text">精选推荐</span>
              </h2>
              <p className="text-text-secondary">编辑精选的优质内容</p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {recommendedArticles.map((article: any, index) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ArticleCard article={article} featured />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 搜索和筛选 */}
      <section id="articles" className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="glass-card rounded-2xl p-8 mb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SearchBar onSearch={handleSearch} />
              <CategoryFilter onCategoryChange={handleCategoryChange} />
            </div>
          </div>
        </div>
      </section>

      {/* 文章列表 */}
      <section className="pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="loading-spinner" />
            </div>
          ) : articles.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {articles.map((article: any, index) => (
                  <motion.div
                    key={article.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <ArticleCard article={article} />
                  </motion.div>
                ))}
              </div>

              {/* 分页 */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="btn-secondary px-6 py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    上一页
                  </button>
                  
                  <div className="flex gap-2">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`w-10 h-10 rounded-xl font-display font-semibold transition-all ${
                            page === pageNum
                              ? 'bg-gradient-to-br from-primary to-secondary text-white'
                              : 'glass-card text-text-secondary hover:text-primary'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="btn-secondary px-6 py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    下一页
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-xl text-text-secondary">暂无文章</p>
            </div>
          )}
        </div>
      </section>

      {/* 特色板块 */}
      <section className="py-20 px-4 bg-surface-1">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
              <span className="gradient-text">技术生态</span>
            </h2>
            <p className="text-text-secondary">我们关注的技术领域</p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: '前端开发', icon: '🎨', desc: 'React, Vue, Next.js', color: 'primary' },
              { title: '后端技术', icon: '⚙️', desc: 'Node.js, Python, Go', color: 'secondary' },
              { title: 'Web3 & 区块链', icon: '🔗', desc: 'Ethereum, Solidity', color: 'accent' },
              { title: '人工智能', icon: '🤖', desc: 'Machine Learning, AI', color: 'primary' },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-card-hover rounded-2xl p-8 text-center group"
              >
                <div className="text-6xl mb-4 transform group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <h3 className={`text-xl font-display font-bold mb-2 text-${item.color}`}>
                  {item.title}
                </h3>
                <p className="text-text-tertiary text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
