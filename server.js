require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const webhookRoutes = require('./routes/webhookRoutes');
const mongodb = require('./services/mongoDbService');

const app = express();
const PORT = process.env.PORT || 3000;

async function startServer() {
  await mongodb.connect();

  app.use(bodyParser.json());
  app.use('/', webhookRoutes);

  app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}`);
  });
}

startServer();