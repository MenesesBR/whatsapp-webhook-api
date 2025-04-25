const { createQueue } = require('../jobs/queue');

async function handleMessage(req, res) {
  try {
    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];
    const message = changes?.value?.messages?.[0];

    if (!message || !message.from) {
      return res.sendStatus(201);
    }

    const from = message.from;
    const queue = createQueue(from);

    await queue.add('incoming-message', message);

    res.sendStatus(200);
  } catch (err) {
    console.error('Erro ao processar mensagem:', err);
    res.sendStatus(500);
  }
}

module.exports = { handleMessage };