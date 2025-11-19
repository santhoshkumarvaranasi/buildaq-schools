const express = require('express');
const router = express.Router();
const { proxyToDotnet } = require('../lib/proxyToDotnet');

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
  // In development we prefer to proxy to the real .NET API when available.
  if ((process.env.NODE_ENV || 'development') === 'development') {
    return proxyToDotnet(req, res);
  }

  // Return an array of classes (empty by default for mock/dev)
  res.json([]);
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
  if ((process.env.NODE_ENV || 'development') === 'development') {
    return proxyToDotnet(req, res);
  }

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
  if ((process.env.NODE_ENV || 'development') === 'development') {
    return proxyToDotnet(req, res);
  }

  res.json({
    message: 'Class details',
    classId: req.params.id
  });
});

module.exports = router;