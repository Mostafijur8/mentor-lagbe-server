import 'dotenv/config';
import express from 'express';
import { MongoClient } from 'mongodb';

const app = express();
app.use(express.json());

const port = Number(process.env.PORT) || 5000;
const mongoUri = process.env.MONGODB_URI;

// Handles requests to the root URL (/).
app.get('/', (_req, res) => {
  res.send('Hello World!');
});

if (!mongoUri) {
  console.error('MONGODB_URI is missing. Add it to your .env file.');
  process.exit(1);
}

const client = new MongoClient(mongoUri);

// Connects to MongoDB and starts the Express server.
async function startServer() {
  try {
    await client.connect();
    console.log('Successfully connected to MongoDB.');

    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  } catch (error) {
    console.error('Could not connect to MongoDB:', error.message);
    await client.close().catch(() => {});
    process.exit(1);
  }
}

startServer();
