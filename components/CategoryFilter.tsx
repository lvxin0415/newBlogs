'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fetchCategories } from '@/lib/api';

interface CategoryFilterProps {
  onCategoryChange: (categoryId: string) => void;
}

export default function CategoryFilter({ onCategoryChange }: CategoryFilterProps) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await fetchCategories();
      setCategories(data.categories);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    onCategoryChange(categoryId);
  };

  if (loading) {
    return (
      <div className="flex gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-10 w-24 glass-card rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
      <motion.button
        onClick={() => handleCategoryClick('')}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`px-5 py-2.5 rounded-xl font-display font-semibold text-sm whitespace-nowrap transition-all ${
          selectedCategory === ''
            ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-[0_0_20px_var(--primary-glow)]'
            : 'glass-card text-text-secondary hover:text-primary hover:border-primary'
        }`}
      >
        全部
      </motion.button>
      
      {categories.map((category: any, index) => (
        <motion.button
          key={category.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          onClick={() => handleCategoryClick(category.id.toString())}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`px-5 py-2.5 rounded-xl font-display font-semibold text-sm whitespace-nowrap transition-all ${
            selectedCategory === category.id.toString()
              ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-[0_0_20px_var(--primary-glow)]'
              : 'glass-card text-text-secondary hover:text-primary hover:border-primary'
          }`}
        >
          {category.name}
        </motion.button>
      ))}
    </div>
  );
}
