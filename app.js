const express = require('express');
const cors = require('cors');
const _ = require('dotenv').config();
const {
  getTodos,
  getCompletedTodos,
  insertTodo,
  deleteAllTodos,
  updateTodo,
} = require('./database');

const app = express();
const port = 3000;

app.use(cors());

app.use(express.json());

app.use((err, req, res, next) => {
  // Handle synchronous errors
  res.status(500).json({ error: 'Something went wrong' });
  console.error(err);
});

app.get('/todos', async (req, res) => {
  const data = await (req.query.completed === 'true'
    ? getCompletedTodos(req.query.query)
    : getTodos(req.query.query));
  res.status(200).json({ data });
});

// grab todo text from query string, then insert todo into database
app.post('/todos', async (req, res) => {
  const data = await insertTodo(req.body.todo);
  res.status(201).json({ error: null, data });
});

// update todo with id to completed
app.put('/todos/:id', async (req, res, next) => {
  // update todo with id
  try {
    await updateTodo(req.params.id, req.body.completed);
    res.status(200).json({ error: null });
  } catch (err) {
    if (err.message === 'Todo not found') {
      res.status(404).json({ error: err.message });
    } else {
      next(err);
    }
  }
});

app.delete('/todos', async (req, res) => {
  await deleteAllTodos();
  res.status(200).json({ error: null });
});

app.listen(port, () => {
  console.log(`TodoAPI app listening on port ${port}`);
});

module.exports = app;
