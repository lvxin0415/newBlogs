const { Sequelize } = require('sequelize');
const bcrypt = require('bcrypt');

// 创建 Sequelize 实例
const sequelize = new Sequelize(
  process.env.DB_NAME || 'tech_blog',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    timezone: '+08:00',
    define: {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
      timestamps: true,
      underscored: true,
    },
  }
);

// 测试数据库连接
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    return true;
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    return false;
  }
}

// 初始化数据库
async function initializeDatabase() {
  try {
    // 测试连接
    const connected = await testConnection();
    if (!connected) {
      throw new Error('Failed to connect to database');
    }

    // 导入模型
    const User = require('../models/User');
    const Article = require('../models/Article');
    const Category = require('../models/Category');
    const Tag = require('../models/Tag');
    const ArticleTag = require('../models/ArticleTag');

    // 同步数据库
    await sequelize.sync({ alter: false });
    console.log('✅ Database synchronized');

    // 创建默认管理员账户（如果不存在）
    await createDefaultAdmin();

    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

// 创建默认管理员账户
async function createDefaultAdmin() {
  try {
    const User = require('../models/User');

    const existingAdmin = await User.findOne({
      where: { username: process.env.ADMIN_USERNAME || 'admin' }
    });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(
        process.env.ADMIN_PASSWORD || 'admin123',
        10
      );

      await User.create({
        username: process.env.ADMIN_USERNAME || 'admin',
        password: hashedPassword,
        email: process.env.ADMIN_EMAIL || 'admin@example.com',
      });

      console.log('✅ Default admin account created');
      console.log(`   Username: ${process.env.ADMIN_USERNAME || 'admin'}`);
      console.log(`   Password: ${process.env.ADMIN_PASSWORD || 'admin123'}`);
    }
  } catch (error) {
    console.error('❌ Failed to create default admin:', error);
  }
}

module.exports = {
  sequelize,
  testConnection,
  initializeDatabase,
};
