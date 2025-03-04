const express = require('express');
const router = express.Router();
const { processWebhookEvent } = require('../services/webhookHandler');

router.post('/safehaven', async (req, res) => {
  try {
    const { event, data } = req.body;

    if (!event || !data) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Missing required webhook parameters' 
      });
    }

    await processWebhookEvent(event, data);

    res.status(200).json({ 
      status: 'success', 
      message: 'Webhook processed successfully' 
    });
  } catch (error) {
    console.error('Error processing webhook:', error.message);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to process webhook' 
    });
  }
});

module.exports = router;