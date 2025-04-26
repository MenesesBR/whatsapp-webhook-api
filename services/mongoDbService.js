const { MongoClient } = require('mongodb');
require('dotenv').config();

class MongoDB {
    constructor() {
        this.dbConnections = new Map();
        this.getDbConnection = this.getDbConnection.bind(this);
        this.connect = this.connect.bind(this);
        this.disconnect = this.disconnect.bind(this);
    }

    // Function to safely get a database connection
    getDbConnection(name) {
        const connection = this.dbConnections.get(name);
        if (!connection) {
            console.log(`Database connection '${name}' not found`);
            throw new Error(`Database connection '${name}' not found`);
        }
        return connection;
    }

    async connect() {
        try {
            const client = new MongoClient(process.env.MONGODB_URL);
            await client.connect();

            console.log(`Connected to MongoDB: ${process.env.MONGODB_URL}`);

            const blipBotUsersDatabase = client.db(process.env.MONGODB_BLIP_BOT_USERS_DATABASE);
            const blipBotUsers = await blipBotUsersDatabase.listCollections().toArray();
            const blipBotCollections = {};

            for (const { name } of blipBotUsers) {
                const collection = blipBotUsersDatabase.collection(name);
                const documents = await collection.find({}).toArray();

                // Transforma ObjectId em string para evitar problemas com JSON
                const sanitizedDocs = documents.map(doc => ({
                    ...doc,
                    _id: doc._id.toString()
                }));

                blipBotCollections[name] = sanitizedDocs;
            }

            const clientsDataDatabase = client.db(process.env.MONGODB_CLIENTS_DATA_DATABASE);
            const clientsData = await clientsDataDatabase.listCollections().toArray();
            const clientsDataCollections = {};

            for (const { name } of clientsData) {
                const collection = clientsDataDatabase.collection(name);
                const documents = await collection.find({}).toArray();

                // Transforma ObjectId em string para evitar problemas com JSON
                const sanitizedDocs = documents.map(doc => ({
                    ...doc,
                    _id: doc._id.toString()
                }));

                clientsDataCollections[name] = sanitizedDocs;
            }

            this.dbConnections.set('blipBotCollections', blipBotCollections);
            this.dbConnections.set('clientsDataCollections', clientsDataCollections);

            console.log(`Connected to Database: ${process.env.MONGODB_BLIP_BOT_USERS_DATABASE}`);
            console.log(`Connected to Database: ${process.env.MONGODB_CLIENTS_DATA_DATABASE}`);

        } catch (error) {
            console.log('Error connecting to MongoDB:', error);
            throw error;
        }
    }

    async createUser(userPhoneNumber, password, clientBotId) {
        try {
            console.log(`Creating user: ${userPhoneNumber} for bot: ${clientBotId}`);
            const client = new MongoClient(process.env.MONGODB_URL);
            await client.connect();

            const blipBotUsersDatabase = client.db(process.env.MONGODB_BLIP_BOT_USERS_DATABASE);

            const blipBotUsersCollection = blipBotUsersDatabase.collection(clientBotId);
            await blipBotUsersCollection.insertOne({
                phoneNumber: userPhoneNumber,
                password
            });

            await client.close();
            await this.connect();
        } catch (error) {
            console.log('Error creating user:', error);
            throw error;
        }
    }

    async disconnect() {
        for (const [name, connection] of this.dbConnections) {
            try {
                await connection.client.close();
                console.log(`Closed connection: ${name}`);
            } catch (error) {
                console.log(`Error closing connection ${name}:`, error);
            }
        }
        this.dbConnections.clear();
    }
}

// Exporta uma única instância do MongoDB
module.exports = new MongoDB(); 