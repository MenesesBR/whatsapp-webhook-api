const express = require('express');
const router = express.Router();
const webhookVerifier = require('../controllers/webhookVerifier');
const { handleMessage } = require('../controllers/messageHandler');

router.get('/webhook', webhookVerifier);
router.post('/webhook', (req, res) => {
    handleMessage(req, res);
    return res.status(200).json({});
});



module.exports = router;
