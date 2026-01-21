const express = require('express');
const { Op } = require('sequelize');
const Article = require('../models/Article');
const Category = require('../models/Category');
const Tag = require('../models/Tag');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// 获取文章列表
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      tag,
      search,
      status,
      isPublic,
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    // 如果未登录，只显示公开文章
    const isAuthenticated = req.headers['authorization'];
    if (!isAuthenticated) {
      where.isPublic = true;
      where.status = 'published';
    }

    // 筛选条件
    if (category) where.categoryId = category;
    if (status) where.status = status;
    if (isPublic !== undefined) where.isPublic = isPublic === 'true';

    // 搜索
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { summary: { [Op.like]: `%${search}%` } },
        { content: { [Op.like]: `%${search}%` } },
      ];
    }

    // 标签筛选
    let tagFilter = {};
    if (tag) {
      tagFilter = {
        include: [{
          model: Tag,
          as: 'tags',
          where: { id: tag },
          through: { attributes: [] },
        }],
      };
    }

    const { count, rows } = await Article.findAndCountAll({
      where,
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name'],
        },
        {
          model: Tag,
          as: 'tags',
          attributes: ['id', 'name'],
          through: { attributes: [] },
          ...(tag ? { where: { id: tag } } : {}),
        },
      ],
      order: [
        ['isTop', 'DESC'],
        ['createdAt', 'DESC'],
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      articles: rows,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit),
    });
  } catch (error) {
    console.error('Get articles error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 获取文章详情
router.get('/:id', async (req, res) => {
  try {
    const article = await Article.findByPk(req.params.id, {
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'description'],
        },
        {
          model: Tag,
          as: 'tags',
          attributes: ['id', 'name'],
          through: { attributes: [] },
        },
      ],
    });

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // 如果文章是私密的，需要验证身份
    const isAuthenticated = req.headers['authorization'];
    if (!article.isPublic && !isAuthenticated) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // 增加阅读量
    await article.increment('viewCount');

    res.json({ article });
  } catch (error) {
    console.error('Get article error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 创建文章（需要认证）
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      title,
      summary,
      content,
      coverImage,
      categoryId,
      tagIds = [],
      isPublic = true,
      isTop = false,
      isRecommended = false,
      status = 'draft',
    } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const article = await Article.create({
      title,
      summary,
      content,
      coverImage,
      categoryId: categoryId || null,
      isPublic,
      isTop,
      isRecommended,
      status,
    });

    // 关联标签
    if (tagIds.length > 0) {
      await article.setTags(tagIds);
    }

    // 重新查询以包含关联数据
    const createdArticle = await Article.findByPk(article.id, {
      include: [
        { model: Category, as: 'category' },
        { model: Tag, as: 'tags', through: { attributes: [] } },
      ],
    });

    res.status(201).json({
      message: 'Article created successfully',
      article: createdArticle,
    });
  } catch (error) {
    console.error('Create article error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 更新文章（需要认证）
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const article = await Article.findByPk(req.params.id);

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    const {
      title,
      summary,
      content,
      coverImage,
      categoryId,
      tagIds,
      isPublic,
      isTop,
      isRecommended,
      status,
    } = req.body;

    await article.update({
      title: title !== undefined ? title : article.title,
      summary: summary !== undefined ? summary : article.summary,
      content: content !== undefined ? content : article.content,
      coverImage: coverImage !== undefined ? coverImage : article.coverImage,
      categoryId: categoryId !== undefined ? categoryId : article.categoryId,
      isPublic: isPublic !== undefined ? isPublic : article.isPublic,
      isTop: isTop !== undefined ? isTop : article.isTop,
      isRecommended: isRecommended !== undefined ? isRecommended : article.isRecommended,
      status: status !== undefined ? status : article.status,
    });

    // 更新标签
    if (tagIds !== undefined) {
      await article.setTags(tagIds);
    }

    // 重新查询以包含关联数据
    const updatedArticle = await Article.findByPk(article.id, {
      include: [
        { model: Category, as: 'category' },
        { model: Tag, as: 'tags', through: { attributes: [] } },
      ],
    });

    res.json({
      message: 'Article updated successfully',
      article: updatedArticle,
    });
  } catch (error) {
    console.error('Update article error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 删除文章（需要认证）
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const article = await Article.findByPk(req.params.id);

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    await article.destroy();

    res.json({ message: 'Article deleted successfully' });
  } catch (error) {
    console.error('Delete article error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
