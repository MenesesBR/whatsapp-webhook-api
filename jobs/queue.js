const { Queue } = require('bullmq');
const Redis = require('ioredis');
require('dotenv').config();

const connection = new Redis(process.env.REDIS_URL + '?family=0');

function createQueue(phoneNumber) {
  const queueName = `messages:${phoneNumber}`;
  return new Queue(queueName, { connection });
}

module.exports = { createQueue };