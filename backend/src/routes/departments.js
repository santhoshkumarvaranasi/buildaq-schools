const express = require('express');
const router = express.Router();
const { proxyToDotnet } = require('../lib/proxyToDotnet');

router.get('/', (req, res) => proxyToDotnet(req, res));
router.get('/:id', (req, res) => proxyToDotnet(req, res));
router.post('/', (req, res) => proxyToDotnet(req, res));
router.put('/:id', (req, res) => proxyToDotnet(req, res));
router.delete('/:id', (req, res) => proxyToDotnet(req, res));

module.exports = router;
