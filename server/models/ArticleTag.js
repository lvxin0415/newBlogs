const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ArticleTag = sequelize.define('ArticleTag', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  articleId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'articles',
      key: 'id',
    },
  },
  tagId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'tags',
      key: 'id',
    },
  },
}, {
  tableName: 'article_tags',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['article_id', 'tag_id'],
    },
  ],
});

module.exports = ArticleTag;
