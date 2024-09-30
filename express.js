const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');


const MONGO_URI = "mongodb+srv://admin:admin@cluster0.opsc7.mongodb.net/"

const app = express();
app.use(express.json()); // Middleware to parse JSON
app.use(cors());

// Connect to Mongo
const client = new MongoClient(MONGO_URI);

let db, lessonsCollection;

// Connect to MongoDB
async function connectToMongo() {
  try {
    await client.connect();
    db = client.db('CST3144_M00953760');  
    lessonsCollection = db.collection('LESSON');
    ordersCollection = db.collection('ORDERS');
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection failed:', error);
  }
}

// API route to get lessons data and send it to front-end
app.get('/lessons', async (req, res) => {
  try {
    const lessons = await lessonsCollection.find({}).toArray();
    console.log("Getting lessons data");
    res.json(lessons); // Send lessons data as JSON
    console.log("Sending lessons data to front-end");
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch lessons data' });
  }
});

connectToMongo();

// Start the server
const PORT =  3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
