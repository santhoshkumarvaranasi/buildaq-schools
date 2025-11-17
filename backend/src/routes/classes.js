const express = require('express');
const router = express.Router();

/**
 * @swagger
 * /api/v1/classes:
 *   get:
 *     summary: Get all classes
 *     tags: [Classes]
 *     responses:
 *       200:
 *         description: List of classes
 */
router.get('/', (req, res) => {
  res.json({
    message: 'Classes endpoint',
    classes: []
  });
});

/**
 * @swagger
 * /api/v1/classes:
 *   post:
 *     summary: Create a new class
 *     tags: [Classes]
 *     responses:
 *       201:
 *         description: Class created successfully
 */
router.post('/', (req, res) => {
  res.status(201).json({
    message: 'Class created',
    class: req.body
  });
});

/**
 * @swagger
 * /api/v1/classes/{id}:
 *   get:
 *     summary: Get class by ID
 *     tags: [Classes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Class details
 */
router.get('/:id', (req, res) => {
  res.json({
    message: 'Class details',
    classId: req.params.id
  });
});

module.exports = router;