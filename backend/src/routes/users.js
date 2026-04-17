const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 }).sort({ createdAt: -1 });
    return res.json(users);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch users.' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }

    if (!['Admin', 'Staff'].includes(role)) {
      return res.status(400).json({ message: 'Role must be Admin or Staff.' });
    }

    const existing = await User.findOne({ username: username.trim() });
    if (existing) {
      return res.status(409).json({ message: 'Username already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      username: username.trim(),
      password: hashedPassword,
      role,
    });

    return res.status(201).json({
      id: newUser._id,
      username: newUser.username,
      role: newUser.role,
      createdAt: newUser.createdAt,
    });
  } catch (error) {
    return res.status(400).json({ message: 'Failed to create user.', error: error.message });
  }
});

module.exports = router;
