const express = require('express');
const UrlController = require('../controllers/urlController');
const router = express.Router();
router.get('/health', UrlController.healthCheck);
router.post('/shorturls', UrlController.createShortUrl);
router.get('/shorturls/:shortcode', UrlController.getUrlStats);
router.get('/:shortcode([a-zA-Z0-9]{4,10})', UrlController.redirectUrl);
module.exports = router;