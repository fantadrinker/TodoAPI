// this module abstracts database operations for the application
// will use a json file to store data for time saving and ease of installation

const pgp = require('pg-promise')();
const { v4: uuidv4 } = require('uuid');
const _ = require('dotenv').config();

const cn = {
  host: process.env.PG_HOST,
  port: parseInt(process.env.PG_PORT),
  database: process.env.PG_DATABASE,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  max: 30, // use up to 30 connections
};

// Database connection
const db = pgp(cn);

// Define methods
function getTodos(query = '') {
  const statement =
    "SELECT id, value, completed FROM todoitems WHERE completed=FALSE AND value ILIKE '%' || $1 || '%' ORDER BY value asc;";
  return db.any(statement, query ?? '');
}

function getCompletedTodos(query = '') {
  return db.any(
    "SELECT id, value, completed FROM todoitems WHERE completed=TRUE AND value ILIKE '%' || $1 || '%' ORDER BY completed_time desc LIMIT 10;",
    query ?? ''
  );
}

function insertTodo(todo) {
  return db.one(
    'INSERT INTO todoitems(id, value, completed) VALUES(${id}, ${value}, ${completed}) RETURNING *;',
    {
      id: uuidv4(),
      value: todo,
      completed: false,
    }
  );
}

function updateTodo(id, completed) {
  return db
    .any('select * from todoitems where id=${id};', {
      id,
    })
    .then((data) => {
      if (data.length === 0) {
        throw new Error('Todo not found');
      }
      return db.none(
        'update todoitems set completed=${completed}, completed_time=now() where id=${id};',
        {
          id,
          completed,
        }
      );
    });
}

function deleteAllTodos() {
  return db.none('delete from todoitems');
}

// Export methods
module.exports = {
  db,
  getTodos,
  getCompletedTodos,
  insertTodo,
  updateTodo,
  deleteAllTodos,
};
