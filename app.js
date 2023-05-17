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

/**
 * GET /todos
 * returns a list of todos based on query stirng filtering and completed status
 * if completed is true, sort by completed_time descending
 * if completed is false, sort by todo text value ascending
 * TODO:
 * - parameter serialization
 * - add pagination,
 * - group completed and uncompleted and if completed is not specified.
 */
app.get('/todos', async (req, res) => {
  const data = await (req.query.completed === 'true'
    ? getCompletedTodos(req.query.query)
    : getTodos(req.query.query));
  res.status(200).json({ data });
});

/**
 * POST /todos
 * inserts a new todo into the database
 */
app.post('/todos', async (req, res) => {
  const data = await insertTodo(req.body.todo);
  res.status(201).json({ error: null, data });
});

/**
 * PUT /todos/:id
 * updates a todo with the given id
 */
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

/**
 * DELETE /todos
 * deletes all todos
 */
app.delete('/todos', async (req, res) => {
  await deleteAllTodos();
  res.status(200).json({ error: null });
});

app.listen(port, () => {
  console.log(`TodoAPI app listening on port ${port}`);
});

module.exports = app;
