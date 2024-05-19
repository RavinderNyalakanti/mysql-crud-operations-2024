const express = require('express');
const bodyParser = require('body-parser'); 
const cors = require('cors');
const connection = require('./db'); // Import the connection
require('dotenv').config();

const app = express();
const PORT = 4500;

// Middleware
app.use(bodyParser.json()); 
app.use(cors());


// Routes
app.get('/movies', async (req, res) => {
  const query = 'SELECT * FROM movies';
  try {
    const [results] = await connection.promise().query(query);
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/movies', async (req, res) => {
  const { name, img, summary } = req.body;
  const checkQuery = 'SELECT * FROM movies WHERE name = ?';
  const insertQuery = 'INSERT INTO movies (name, img, summary) VALUES (?, ?, ?)';

  try {
    const [checkResults] = await connection.promise().query(checkQuery, [name]);
    if (checkResults.length > 0) {
      res.status(400).json({ message: 'Movie already exists' });
    } else {
      const [insertResults] = await connection.promise().query(insertQuery, [name, img, summary]);
      res.status(201).json({ id: insertResults.insertId, name, img, summary });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/movies/:id', async (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM movies WHERE id = ?';
  
  try {
    const [results] = await connection.promise().query(query, [id]);
    if (results.length === 0) {
      res.status(404).json({ message: 'Movie not found' });
    } else {
      res.json(results[0]);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put('/movies/:id', async (req, res) => {
  const { id } = req.params;
  const { name, img, summary } = req.body;
  const query = 'UPDATE movies SET name = ?, img = ?, summary = ? WHERE id = ?';
  
  try {
    const [results] = await connection.promise().query(query, [name, img, summary, id]);
    if (results.affectedRows === 0) {
      res.status(404).json({ message: 'Movie not found' });
    } else {
      res.json({ id, name, img, summary });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete('/movies/:id', async (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM movies WHERE id = ?';
  
  try {
    const [results] = await connection.promise().query(query, [id]);
    if (results.affectedRows === 0) {
      res.status(404).json({ message: 'Movie not found' });
    } else {
      res.json({ message: 'Movie deleted successfully' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
