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

    const byGenderRaw = await Student.aggregate([
      {
        $group: {
          _id: '$sexe',
          count: { $sum: 1 },
        },
      },
    ]);

    const byGender = {
      Male: 0,
      Female: 0,
    };

    byGenderRaw.forEach((item) => {
      if (item._id === 'Male' || item._id === 'Female') {
        byGender[item._id] = item.count;
      }
    });

    const classesByLevel = await Student.aggregate([
      {
        $group: {
          _id: {
            level: '$class_info.level',
            class_name: '$class_info.class_name',
          },
          total: { $sum: 1 },
          male: {
            $sum: {
              $cond: [{ $eq: ['$sexe', 'Male'] }, 1, 0],
            },
          },
          female: {
            $sum: {
              $cond: [{ $eq: ['$sexe', 'Female'] }, 1, 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          level: '$_id.level',
          class_name: '$_id.class_name',
          total: 1,
          male: 1,
          female: 1,
        },
      },
      {
        $sort: {
          level: 1,
          class_name: 1,
        },
      },
      {
        $group: {
          _id: '$level',
          classCount: { $sum: 1 },
          classes: {
            $push: {
              class_name: '$class_name',
              total: '$total',
              male: '$male',
              female: '$female',
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          level: '$_id',
          classCount: 1,
          classes: 1,
        },
      },
      {
        $sort: {
          level: 1,
        },
      },
    ]);

    return res.json({
      totalStudents,
      byLevel,
      byGender,
      classesByLevel,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch dashboard stats.' });
  }
});

module.exports = router;
