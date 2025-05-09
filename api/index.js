const express = require('express');
const { createServer } = require('@vercel/node');

// creating the express app
const app = express();

// defining a simple route
app.get('/', (req, res) => {
  res.send('Hello from Express on Vercel!');
});

// exporting the server as a Vercel handler
module.exports = app;
