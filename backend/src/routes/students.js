const express = require('express');
const router = express.Router();

/**
 * @swagger
 * /api/v1/students:
 *   get:
 *     summary: Get all students
 *     tags: [Students]
 *     responses:
 *       200:
 *         description: List of students
 */
router.get('/', (req, res) => {
  res.json({
    message: 'Students endpoint',
    students: []
  });
});

/**
 * @swagger
 * /api/v1/students:
 *   post:
 *     summary: Create a new student
 *     tags: [Students]
 *     responses:
 *       201:
 *         description: Student created successfully
 */
router.post('/', (req, res) => {
  res.status(201).json({
    message: 'Student created',
    student: req.body
  });
});

/**
 * @swagger
 * /api/v1/students/{id}:
 *   get:
 *     summary: Get student by ID
 *     tags: [Students]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Student details
 */
router.get('/:id', (req, res) => {
  res.json({
    message: 'Student details',
    studentId: req.params.id
  });
});

module.exports = router;