const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Category = require('./Category');
const Tag = require('./Tag');
const ArticleTag = require('./ArticleTag');

const Article = sequelize.define('Article', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  summary: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  content: {
    type: DataTypes.TEXT('long'),
    allowNull: false,
  },
  coverImage: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'categories',
      key: 'id',
    },
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  isTop: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isRecommended: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  status: {
    type: DataTypes.ENUM('draft', 'published'),
    defaultValue: 'draft',
  },
  viewCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'articles',
  timestamps: true,
});

// 定义关联关系
Article.belongsTo(Category, {
  foreignKey: 'categoryId',
  as: 'category',
  onDelete: 'SET NULL',
});

Category.hasMany(Article, {
  foreignKey: 'categoryId',
  as: 'articles',
});

// 多对多关系通过 ArticleTag 表
Article.belongsToMany(Tag, {
  through: ArticleTag,
  foreignKey: 'articleId',
  otherKey: 'tagId',
  as: 'tags',
});

Tag.belongsToMany(Article, {
  through: ArticleTag,
  foreignKey: 'tagId',
  otherKey: 'articleId',
  as: 'articles',
});

module.exports = Article;
