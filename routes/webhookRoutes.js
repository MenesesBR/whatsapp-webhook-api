const express = require('express');
const router = express.Router();
const webhookVerifier = require('../controllers/webhookVerifier');
const messageHandler = require('../controllers/messageHandler');

router.get('/webhook', webhookVerifier);
router.post('/webhook', messageHandler);

module.exports = router;