require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const bcrypt = require('bcrypt');
const { sequelize } = require('../config/database');
const User = require('../models/User');

async function resetAdminPassword() {
  try {
    console.log('🔄 正在连接数据库...');
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

    const username = process.env.ADMIN_USERNAME || 'admin';
    const newPassword = process.env.ADMIN_PASSWORD || 'LVxin,,..930415';
    const email = process.env.ADMIN_EMAIL || '584552569@qq.com';

    console.log(`\n📝 管理员信息:`);
    console.log(`   用户名: ${username}`);
    console.log(`   邮箱: ${email}`);
    console.log(`   新密码: ${newPassword}`);

    // 查找管理员用户
    let adminUser = await User.findOne({ where: { username } });

    if (adminUser) {
      console.log('\n🔍 找到现有管理员账户，正在更新密码...');

      // 加密新密码
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // 更新密码和邮箱
      await adminUser.update({
        password: hashedPassword,
        email: email
      });

      console.log('✅ 管理员密码已更新！');
    } else {
      console.log('\n🔍 未找到管理员账户，正在创建新账户...');

      // 加密密码
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // 创建新管理员
      await User.create({
        username,
        password: hashedPassword,
        email
      });

      console.log('✅ 管理员账户已创建！');
    }

    console.log('\n✨ 操作完成！你现在可以使用以下信息登录：');
    console.log(`   用户名: ${username}`);
    console.log(`   密码: ${newPassword}`);
    console.log(`   邮箱: ${email}`);

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ 操作失败:', error);
    process.exit(1);
  }
}

resetAdminPassword();
