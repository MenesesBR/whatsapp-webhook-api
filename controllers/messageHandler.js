const { createQueue } = require('../jobs/queue');
const mongodb = require('../services/mongoDbService');

async function handleMessage(req, res) {
  try {
    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const message = value?.messages?.[0];

    if (!message || !message?.from) {
      return;
    }


    const userPhoneNumber = message.from;
    const metaPhoneNumberId = value.metadata.phone_number_id;

    console.log('Processing received message:', {
      metaPhoneNumberId: metaPhoneNumberId,
      userPhoneNumber: userPhoneNumber,
      messageType: message.type,
      timestamp: message.timestamp
    });

    // Aguardar a obtenção dos dados do clienteF
    const clientsData = await mongodb.getDbConnection('clientsDataCollections').clients_data;
    const clientBotData = clientsData.find(client => client.metaPhoneNumberId == metaPhoneNumberId);

    if (!clientBotData) {
      console.log('No client bot data found for meta phone number:', metaPhoneNumberId);
      return;
    }

    const clientBotId = clientBotData.blipBotId;

    // Aguardar a obtenção dos dados do usuário
    let clientBotUsers = await mongodb.getDbConnection('blipBotCollections')[clientBotId];
    let clientBotUserData = clientBotUsers.find(user => user.phoneNumber == userPhoneNumber);

    if (!clientBotUserData) {
      console.log('No user data found in database:', userPhoneNumber);
      const password = Buffer.from(Math.random().toString()).toString('base64').substring(0, 10);
      await mongodb.createUser(userPhoneNumber, password, clientBotId);

      // Aguardar a atualização dos dados do usuário
      clientBotUsers = await mongodb.getDbConnection('blipBotCollections')[clientBotId];
      clientBotUserData = clientBotUsers.find(user => user.phoneNumber == userPhoneNumber);
    }

    const queueData = {
      headers: {
        'Authorization': "",
        'Content-Type': 'application/json'
      },
      data: {
        blipBotId: clientBotId,
        metaPhoneNumberId,
        userPhoneNumber,
        userId: `${clientBotUserData.phoneNumber}.${clientBotId}@${clientBotData.userDomain}`,
        userPassword: clientBotUserData.password,
        metaAuthToken: clientBotData.metaAuthToken,
        userDomain: clientBotData.userDomain,
        wsUri: clientBotData.wsUri,
        message,
      }
    }

    const queue = createQueue(`${clientBotId}.${userPhoneNumber}`);

    await queue.add('incoming-message', queueData);

  } catch (err) {
    console.error('Erro ao processar mensagem:', err);
    res.sendStatus(500);
  }
}

module.exports = { handleMessage };