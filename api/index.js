const express = require('express');
const { createServer } = require('@vercel/node');

const app = express();

app.get('/', (req, res) => {
  res.send('Hello from Express on Vercel!');
});

module.exports = app;
