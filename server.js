const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI )
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('MongoDB Connection Error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  age: Number,
  city: String,
  active: Boolean,
  minor: Boolean,
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Routes for MongoDB operations
const router = express.Router();
app.get('/', (req, res) => {
  res.send('Mongodb operations backend!');
});
// 1. insertOne()
router.post('/users', async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// 2. insertMany()
router.post('/users/batch', async (req, res) => {
  try {
    const users = await User.insertMany(req.body);
    res.status(201).json({ success: true, data: users });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// 3. find()
// Backend (server.js)
router.get('/users', async (req, res) => {
  try {
    const query = req.query.query ? JSON.parse(req.query.query) : {};
    if (query.age) {
      // Handle cases where age is an object (e.g., {$gte: value})
      if (typeof query.age === 'object') {
        for (const key in query.age) {
          if (!isNaN(query.age[key])) {
            query.age[key] = Number(query.age[key]);
          }
        }
      } else if (!isNaN(query.age)) {
        query.age = Number(query.age);
      }
    }
    const users = await User.find(query);
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// 4. findOne()
// Backend (server.js)
router.get('/users/one', async (req, res) => {
  try {
    const query = req.query.query ? JSON.parse(req.query.query) : {};
    if (query.age) {
      if (typeof query.age === 'object') {
        for (const key in query.age) {
          if (!isNaN(query.age[key])) {
            query.age[key] = Number(query.age[key]);
          }
        }
      } else if (!isNaN(query.age)) {
        query.age = Number(query.age);
      }
    }
    const user = await User.findOne(query);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// 5. find().limit()
router.get('/users/limit', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const users = await User.find().limit(limit);
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// 6. find().skip()
router.get('/users/skip', async (req, res) => {
  try {
    const skip = parseInt(req.query.skip) || 0;
    const users = await User.find().skip(skip);
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// 7. find().sort()
router.get('/users/sort', async (req, res) => {
  try {
    const sortBy = req.query.sortBy ? JSON.parse(req.query.sortBy) : { createdAt: -1 };
    const users = await User.find().sort(sortBy);
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// 8. distinct()
router.get('/users/distinct', async (req, res) => {
  try {
    const field = req.query.field || 'city';
    const values = await User.distinct(field);
    res.status(200).json({ success: true, data: values });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// 9. countDocuments()
router.get('/users/count', async (req, res) => {
  try {
    const query = req.query.query ? JSON.parse(req.query.query) : {};
    const count = await User.countDocuments(query);
    res.status(200).json({ success: true, data: count });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// 10. updateOne()
router.put('/users/one', async (req, res) => {
  try {
    const filter = req.body.filter || {};
    const update = req.body.update || {};
    const result = await User.updateOne(filter, update);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// 11. updateMany()
router.put('/users/many', async (req, res) => {
  try {
    const filter = req.body.filter || {};
    const update = req.body.update || {};
    const result = await User.updateMany(filter, update);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// 12. replaceOne()
router.put('/users/replace', async (req, res) => {
  try {
    const filter = req.body.filter || {};
    const replacement = req.body.replacement || {};
    const result = await User.replaceOne(filter, replacement);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// 13. deleteOne()
router.delete('/users/one', async (req, res) => {
  try {
    const filter = req.body.filter || {};
    const result = await User.deleteOne(filter);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// 14. deleteMany()
router.delete('/users/many', async (req, res) => {
  try {
    const filter = req.body.filter || {};
    const result = await User.deleteMany(filter);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// 15. aggregate()
router.get('/users/aggregate', async (req, res) => {
  try {
    const pipeline = req.query.pipeline ? JSON.parse(req.query.pipeline) : [
      { $group: { _id: '$city', count: { $sum: 1 } } }
    ];
    const results = await User.aggregate(pipeline);
    res.status(200).json({ success: true, data: results });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// 16. createIndex()
router.post('/users/index', async (req, res) => {
  try {
    const { field, options } = req.body;
    const indexDef = {};
    indexDef[field] = 1;
    const result = await User.collection.createIndex(indexDef, options || {});
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// 17. dropIndex()
router.delete('/users/index', async (req, res) => {
  try {
    const indexName = req.body.indexName;
    const result = await User.collection.dropIndex(indexName);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// 18. getIndexes()
router.get('/users/indexes', async (req, res) => {
  try {
    const indexes = await User.collection.indexes();
    res.status(200).json({ success: true, data: indexes });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// 19. findOneAndUpdate()
router.put('/users/findAndUpdate', async (req, res) => {
  try {
    const { filter, update, options } = req.body;
    const result = await User.findOneAndUpdate(
      filter || {},
      update || {},
      options || { returnDocument: 'after' }
    );
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// 20. findOneAndDelete()
router.delete('/users/findAndDelete', async (req, res) => {
  try {
    const filter = req.body.filter || {};
    const result = await User.findOneAndDelete(filter);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// 21. bulkWrite()
router.post('/users/bulk', async (req, res) => {
  try {
    const operations = req.body.operations || [];
    const result = await User.bulkWrite(operations);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// 22. findOneAndReplace()
router.put('/users/findAndReplace', async (req, res) => {
  try {
    const { filter, replacement, options } = req.body;
    const result = await User.findOneAndReplace(
      filter || {},
      replacement || {},
      options || { returnDocument: 'after' }
    );
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// 23. renameCollection()
router.put('/collections/rename', async (req, res) => {
  try {
    const { oldName, newName } = req.body;
    const db = mongoose.connection.db;
    const oldCollectionExists = await db.listCollections({ name: oldName }).hasNext();
    if (!oldCollectionExists) {
      return res.status(404).json({ success: false, message: `Collection "${oldName}" not found.` });
    }
    const newCollectionExists = await db.listCollections({ name: newName }).hasNext();
    if (newCollectionExists) {
      return res.status(400).json({ success: false, message: `Collection "${newName}" already exists.` });
    }

    await db.renameCollection(oldName, newName);

    res.status(200).json({
      success: true,
      message: `Collection renamed successfully from "${oldName}" to "${newName}"`,
    });
  } catch (error) {
    if (error.codeName === 'NamespaceNotFound') {
      return res.status(404).json({ success: false, message: `Collection "${req.body.oldName}" not found.` });
    } else if (error.codeName === 'InvalidNamespace') {
      return res.status(400).json({ success: false, message: `Invalid new collection name: "${req.body.newName}".` });
    } else if (error.codeName === 'NamespaceExists') {
      return res.status(400).json({ success: false, message: `Collection "${req.body.newName}" already exists.` });
    }
    res.status(400).json({ success: false, message: error.message });
  }
});

// 24. drop()
router.delete('/collections/drop', async (req, res) => {
  try {
    await User.collection.drop();
    res.status(200).json({ 
      success: true, 
      message: 'Collection drop would occur here' 
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// 25. listCollections()
router.get('/collections', async (req, res) => {
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    res.status(200).json({ success: true, data: collections });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Additional helper routes

// Clear database (for testing)
router.delete('/reset', async (req, res) => {
  try {
    await User.deleteMany({});
    res.status(200).json({ success: true, message: 'Database reset' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Seed database (for testing)
router.post('/seed', async (req, res) => {
  try {
    const sampleUsers = [
      { name: 'Alice', email: 'alice@example.com', age: 28, city: 'New York', active: true },
      { name: 'Bob', email: 'bob@example.com', age: 35, city: 'Chicago', active: true },
      { name: 'Charlie', email: 'charlie@example.com', age: 17, city: 'New York', active: true },
      { name: 'Dave', email: 'dave@example.com', age: 42, city: 'Seattle', active: false },
      { name: 'Eve', email: 'eve@example.com', age: 16, city: 'Chicago', active: true }
    ];
    
    await User.deleteMany({});
    const users = await User.insertMany(sampleUsers);
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.use('/api', router);

// Serve static assets if in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static('client/build'));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;