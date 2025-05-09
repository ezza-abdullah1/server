const express = require('express');
const serverless = require('serverless-http');

const app = express();

app.get('/', (req, res) => {
  res.send('Hello from Express via Vercel serverless!');
});

module.exports.handler = serverless(app);
