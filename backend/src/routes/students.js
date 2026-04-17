const express = require('express');
const Student = require('../models/Student');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { search = '', level, class_name } = req.query;
    const query = {};

    if (search.trim()) {
      query.$or = [
        { first_name: { $regex: search, $options: 'i' } },
        { last_name: { $regex: search, $options: 'i' } },
        { 'class_info.class_name': { $regex: search, $options: 'i' } },
      ];
    }

    if (level) {
      query['class_info.level'] = level;
    }

    if (class_name) {
      query['class_info.class_name'] = class_name;
    }

    const students = await Student.find(query).sort({ createdAt: -1 });
    return res.json(students);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch students.' });
  }
});

router.post('/', async (req, res) => {
  try {
    const student = await Student.create(req.body);
    return res.status(201).json(student);
  } catch (error) {
    return res.status(400).json({ message: 'Failed to create student.', error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updated = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    return res.json(updated);
  } catch (error) {
    return res.status(400).json({ message: 'Failed to update student.', error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Student.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    return res.json({ message: 'Student deleted successfully.' });
  } catch (error) {
    return res.status(400).json({ message: 'Failed to delete student.', error: error.message });
  }
});

module.exports = router;
