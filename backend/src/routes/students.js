const express = require('express');
const router = express.Router();
const { proxyToDotnet } = require('../lib/proxyToDotnet');

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
  // Forward to .NET API which uses the database for tenant-scoped data.
  return proxyToDotnet(req, res);
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
  return proxyToDotnet(req, res);
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
  return proxyToDotnet(req, res);
});

module.exports = router;