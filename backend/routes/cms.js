const express = require('express');
const { getPage, getSettings } = require('../controllers/cms/publicController');

const router = express.Router();

router.get('/page/:slug', getPage);
router.get('/settings/public', getSettings);

module.exports = router;
