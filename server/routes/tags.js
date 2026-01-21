const express = require('express');
const Tag = require('../models/Tag');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// 获取所有标签
router.get('/', async (req, res) => {
  try {
    const tags = await Tag.findAll({
      order: [['createdAt', 'DESC']],
    });

    res.json({ tags });
  } catch (error) {
    console.error('Get tags error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 获取标签详情
router.get('/:id', async (req, res) => {
  try {
    const tag = await Tag.findByPk(req.params.id);

    if (!tag) {
      return res.status(404).json({ error: 'Tag not found' });
    }

    res.json({ tag });
  } catch (error) {
    console.error('Get tag error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 创建标签（需要认证）
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const existingTag = await Tag.findOne({ where: { name } });
    if (existingTag) {
      return res.status(400).json({ error: 'Tag already exists' });
    }

    const tag = await Tag.create({ name });

    res.status(201).json({
      message: 'Tag created successfully',
      tag,
    });
  } catch (error) {
    console.error('Create tag error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 更新标签（需要认证）
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const tag = await Tag.findByPk(req.params.id);

    if (!tag) {
      return res.status(404).json({ error: 'Tag not found' });
    }

    const { name } = req.body;

    await tag.update({
      name: name !== undefined ? name : tag.name,
    });

    res.json({
      message: 'Tag updated successfully',
      tag,
    });
  } catch (error) {
    console.error('Update tag error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 删除标签（需要认证）
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const tag = await Tag.findByPk(req.params.id);

    if (!tag) {
      return res.status(404).json({ error: 'Tag not found' });
    }

    await tag.destroy();

    res.json({ message: 'Tag deleted successfully' });
  } catch (error) {
    console.error('Delete tag error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
