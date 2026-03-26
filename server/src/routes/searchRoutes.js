const express = require('express');
const router = express.Router();
const { unifiedSearch } = require('../controllers/searchController');

router.get('/', unifiedSearch);

module.exports = router;
