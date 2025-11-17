const express = require('express');
const router = express.Router();

/**
 * @swagger
 * /api/v1/teachers:
 *   get:
 *     summary: Get all teachers
 *     tags: [Teachers]
 *     responses:
 *       200:
 *         description: List of teachers
 */
router.get('/', (req, res) => {
  res.json({
    message: 'Teachers endpoint',
    teachers: []
  });
});

/**
 * @swagger
 * /api/v1/teachers:
 *   post:
 *     summary: Create a new teacher
 *     tags: [Teachers]
 *     responses:
 *       201:
 *         description: Teacher created successfully
 */
router.post('/', (req, res) => {
  res.status(201).json({
    message: 'Teacher created',
    teacher: req.body
  });
});

/**
 * @swagger
 * /api/v1/teachers/{id}:
 *   get:
 *     summary: Get teacher by ID
 *     tags: [Teachers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Teacher details
 */
router.get('/:id', (req, res) => {
  res.json({
    message: 'Teacher details',
    teacherId: req.params.id
  });
});

module.exports = router;