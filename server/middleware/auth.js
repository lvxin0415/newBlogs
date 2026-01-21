const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// 验证 JWT Token
async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(403).json({ error: 'Invalid or expired token' });
      }

      // 验证用户是否存在
      const user = await User.findByPk(decoded.userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      req.user = {
        id: user.id,
        username: user.username,
        email: user.email,
      };

      next();
    });
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// 生成 JWT Token
function generateToken(userId) {
  return jwt.sign(
    { userId },
    JWT_SECRET,
    { expiresIn: '7d' } // Token 有效期 7 天
  );
}

module.exports = {
  authenticateToken,
  generateToken,
};
