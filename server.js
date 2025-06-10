import express from 'express';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import cors from 'cors';

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());

// Open SQLite database
const db = await open({
  filename: './articles.db',
  driver: sqlite3.Database
});

// Create table if not exists
await db.exec(`
  CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    category TEXT,
    content TEXT
  );
`);

// Routes

// Get all articles
app.get('/articles', async (req, res) => {
  const articles = await db.all('SELECT * FROM articles');
  res.json(articles);
});

// Get article by ID
app.get('/articles/:id', async (req, res) => {
  const article = await db.get('SELECT * FROM articles WHERE id = ?', [req.params.id]);
  article ? res.json(article) : res.status(404).send('Not found');
});

// Add new article
app.post('/articles', async (req, res) => {
  const { title, category, content } = req.body;
  const result = await db.run('INSERT INTO articles (title, category, content) VALUES (?, ?, ?)', [title, category, content]);
  res.status(201).json({ id: result.lastID });
});

// Update article
app.put('/articles/:id', async (req, res) => {
  const { title, category, content } = req.body;
  await db.run('UPDATE articles SET title = ?, category = ?, content = ? WHERE id = ?', [title, category, content, req.params.id]);
  res.sendStatus(204);
});

// Delete article
app.delete('/articles/:id', async (req, res) => {
  await db.run('DELETE FROM articles WHERE id = ?', [req.params.id]);
  res.sendStatus(204);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
