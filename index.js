const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Export the Express app as the default Serverless Function handler
module.exports=app;