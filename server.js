// importing express
const express = require('express');

// creating an Express app
const app = express();

// setting a port
const PORT = 3000;

// setting a basic route
app.get('/', (req, res) => {
  res.send('Hello, Express!');
});

// starting the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
