const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');


const MONGO_URI = "mongodb+srv://admin:admin@cluster0.opsc7.mongodb.net/"

const app = express();
app.use(express.json()); // Middleware to parse JSON
app.use(cors());

// Connect to Mongo
const client = new MongoClient(MONGO_URI);