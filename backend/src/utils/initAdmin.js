const bcrypt = require('bcryptjs');
const User = require('../models/User');

const initAdmin = async () => {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (!username || !password) {
    return;
  }

  const existing = await User.findOne({ username });
  if (existing) {
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await User.create({
    username,
    password: hashedPassword,
    role: 'Admin',
  });

  console.log(`Default admin user created: ${username}`);
};

module.exports = initAdmin;
