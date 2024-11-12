const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');

const MONGO_URI = "mongodb+srv://admin:admin@cluster0.opsc7.mongodb.net/";

const app = express();
app.use(express.json()); // Middleware to parse JSON
app.use(cors()); // // Apply CORS to allow requests from different domains
app.use(morgan('short')); // Use Morgan for logging requests

// Serve static files from the "assets" directory
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Connect to Mongo
const client = new MongoClient(MONGO_URI);

let db, lessonsCollection, ordersCollection;

// Connect to MongoDB
async function connectToMongo() {
    try {
        await client.connect();
        db = client.db('CST3144_M00953760');
        lessonsCollection = db.collection('LESSON');
        ordersCollection = db.collection('ORDERS');
    } catch (error) {
        console.error('MongoDB connection failed:', error);
    }
}

// API route to get lessons data and send it to the front-end
app.get('/lessons', async (req, res) => {
    try {
        const lessons = await lessonsCollection.find({}).toArray();
        res.json(lessons); // Send lessons data as JSON
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch lessons data' });
    }
});

// API route to update seats_available
app.put('/lessons/update-seats', async (req, res) => {
    const { cart } = req.body;
    try {
        for (const lesson of cart) {
            const { lesson_title, location } = lesson;
            const lessonInDB = await lessonsCollection.findOne({ lesson_title, location });

            await lessonsCollection.updateOne(
                { lesson_title, location },
                { $set: { seats_available: lessonInDB.seats_available - 1 } }
            );
        }
        res.json({ success: true, message: 'Seats updated successfully' });
    } catch (error) {
        console.error('Error updating seats:', error);
        res.status(500).json({ message: 'Failed to update seats' });
    }
});

// API route for checkout
app.post('/lessons/checkout', async (req, res) => {
    const { order } = req.body;
    const { name, phone_number, email, lessons_taken, seats_taken } = order;

    try {
        // Store the order in the ORDERS collection
        const orderData = {
            name: name, // Store full name
            phone_number: phone_number,
            email: email, // Store email as well
            lessons_taken: lessons_taken,
            seats_taken: seats_taken,
        };

        await ordersCollection.insertOne(orderData);
        res.json({ success: true, message: 'Checkout and seat update successful!' });
    } catch (error) {
        console.error('Error during checkout:', error);
        res.status(500).json({ success: false, message: 'Checkout failed.' });
    }
});

// Add a new route to handle search requests
app.get('/lessons/search', async (req, res) => {
    const searchTerm = req.query.q; // Get the search term from the query string
    try {
        // Perform a case-insensitive search using MongoDB's $regex
        const filteredLessons = await lessonsCollection.find({
            lesson_title: { $regex: searchTerm, $options: 'i' } // Case-insensitive search
        })
            .sort({ lesson_title: 1 }) // Sort alphabetically by lesson_title
            .toArray();
        res.json(filteredLessons); // Return filtered lessons as JSON
    } catch (error) {
        console.error('Error during search:', error);
        res.status(500).json({ message: 'Failed to fetch search results' });
    }
});

// Connect to MongoDB
connectToMongo();

// Start the server
const port = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});