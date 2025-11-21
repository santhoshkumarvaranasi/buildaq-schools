const express = require('express');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Serve remotes.json for module federation registry.
// Behavior: if a repo-level public/remotes.json exists, return it.
// Otherwise return a sensible default mapping for local development.
router.get('/remotes.json', (req, res) => {
  try {
    const repoPublic = path.resolve(__dirname, '..', '..', '..', 'public', 'remotes.json');
    if (fs.existsSync(repoPublic)) {
      return res.sendFile(repoPublic);
    }
  } catch (e) {
    // ignore and fall through to default
  }

  // Default mapping: point `schools` remote to localhost:4201
  const defaultRemotes = {
    schools: 'http://localhost:4201/remoteEntry.js'
  };
  res.json(defaultRemotes);
});

module.exports = router;
