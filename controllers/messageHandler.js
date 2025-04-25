const queue = require('../jobs/queue');

module.exports = async (req, res) => {
  try {
    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];
    const message = changes?.value?.messages?.[0];

    if (message) {
      await queue.add('incoming-message', message);
    }

    res.sendStatus(200);
  } catch (err) {
    console.error('Error handling message:', err);
    res.sendStatus(500);
  }
};