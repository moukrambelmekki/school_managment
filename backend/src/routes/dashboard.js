const express = require('express');
const Student = require('../models/Student');

const router = express.Router();

router.get('/stats', async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();

    const byLevel = await Student.aggregate([
      {
        $group: {
          _id: '$class_info.level',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          level: '$_id',
          count: 1,
        },
      },
      {
        $sort: { level: 1 },
      },
    ]);

    return res.json({
      totalStudents,
      byLevel,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch dashboard stats.' });
  }
});

module.exports = router;
