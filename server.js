const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
require('dotenv').config()




const app = express();
app.use(bodyParser.json());

const cors = require('cors');
app.use(cors());
// Connect to MongoDB Atlas

mongoose.connect(process.env.MONGO_URL , { useNewUrlParser: true, useUnifiedTopology: true });

// Connection events
const db = mongoose.connection;
db.on('error', (error) => {
  console.error('Connection error:', error);
});
db.once('open', () => {
  console.log('Connected to MongoDB Atlas');
});

// Define Flashcard Schema and Model
const flashcardSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true }
});

const Flashcard = mongoose.model('Flashcard', flashcardSchema);

// API Routes
app.get('/api/flashcards', async (req, res) => {
  try {
    const flashcards = await Flashcard.find();
    res.json(flashcards);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching flashcards' });
  }
});

app.post('/api/flashcards', async (req, res) => {
  const { question, answer } = req.body;

  if (!question || !answer) {
    return res.status(400).json({ error: 'Question and answer are required' });
  }

  try {
    const flashcard = new Flashcard({ question, answer });
    await flashcard.save();
    res.status(201).json(flashcard);
  } catch (error) {
    res.status(500).json({ error: 'Error adding flashcard' });
  }
});

app.delete('/api/flashcards/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await Flashcard.findByIdAndDelete(id);
    if (!result) {
      return res.status(404).json({ error: 'Flashcard not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Error deleting flashcard' });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
