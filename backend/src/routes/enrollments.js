const express = require('express');
const router = express.Router();
const { proxyToDotnet } = require('../lib/proxyToDotnet');

/**
 * GET /api/v1/enrollments
 * In development, proxy to the real .NET API. Otherwise return empty list.
 */
router.get('/', (req, res) => {
  if ((process.env.NODE_ENV || 'development') === 'development') {
    return proxyToDotnet(req, res);
  }
  res.json([]);
});

router.post('/', (req, res) => {
  if ((process.env.NODE_ENV || 'development') === 'development') {
    return proxyToDotnet(req, res);
  }
  const body = req.body || {};
  const created = Object.assign({ id: Date.now(), status: 'enrolled' }, body);
  res.status(201).json(created);
});

module.exports = router;
