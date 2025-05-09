// client/src/App.js
import React, { useState, useEffect } from 'react';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || '/api';

function App() {
  const [users, setUsers] = useState([]);
  const [operation, setOperation] = useState('find');
  const [result, setResult] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/users`);
      const data = await response.json();
      setUsers(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOperationChange = (e) => {
    setOperation(e.target.value);
    setFormData({});
    setResult(null);
  };

  const handleFormChange = (e) => {
  const { name, value } = e.target;
  
  try {
    if ((value.trim().startsWith('{') || value.trim().startsWith('[')) && 
        (value.trim().endsWith('}') || value.trim().endsWith(']'))) {
      const parsedValue = JSON.parse(value);
      
      if (parsedValue.age) {
        processAgeValues(parsedValue);
      }
      
      if (parsedValue.query && parsedValue.query.age) {
        processAgeValues(parsedValue.query);
      }
      
      if (parsedValue.filter && parsedValue.filter.age) {
        processAgeValues(parsedValue.filter);
      }
      
      setFormData({ ...formData, [name]: parsedValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  } catch (err) {
    setFormData({ ...formData, [name]: value });
  }
};

const processAgeValues = (obj) => {
  if (typeof obj.age === 'object') {
    Object.keys(obj.age).forEach(op => {
      if (!isNaN(obj.age[op])) {
        obj.age[op] = Number(obj.age[op]);
      }
    });
  } else if (!isNaN(obj.age)) {
    obj.age = Number(obj.age);
  }
};

  const resetDatabase = async () => {
    try {
      setLoading(true);
      await fetch(`${API_URL}/reset`, { method: 'DELETE' });
      await seedDatabase();
      setResult({ message: 'Database reset and seeded with sample data' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      fetchUsers();
    }
  };

  const seedDatabase = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/seed`, { method: 'POST' });
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      fetchUsers();
    }
  };

  const executeOperation = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);

    try {
      let response;
      let url = `${API_URL}/users`;
      const options = {
        headers: {
          'Content-Type': 'application/json'
        }
      };
    const processedFormData = { ...formData };
    if (processedFormData.query) {
      try {
        let query = typeof processedFormData.query === 'string' 
          ? JSON.parse(processedFormData.query) 
          : processedFormData.query;
          
        if (query.age) {
          if (typeof query.age === 'object') {
            Object.keys(query.age).forEach(op => {
              if (!isNaN(query.age[op])) {
                query.age[op] = Number(query.age[op]);
              }
            });
          } else if (!isNaN(query.age)) {
            query.age = Number(query.age);
          }
        }
        
        processedFormData.query = query;
      } catch (err) {
        console.warn('Could not parse query as JSON', err);
      }
    }

    if (processedFormData.filter) {
      try {
        let filter = typeof processedFormData.filter === 'string' 
          ? JSON.parse(processedFormData.filter) 
          : processedFormData.filter;
          
        if (filter.age) {
          if (typeof filter.age === 'object') {
            Object.keys(filter.age).forEach(op => {
              if (!isNaN(filter.age[op])) {
                filter.age[op] = Number(filter.age[op]);
              }
            });
          } else if (!isNaN(filter.age)) {
            filter.age = Number(filter.age);
          }
        }
        
        processedFormData.filter = filter;
      } catch (err) {
        console.warn('Could not parse filter as JSON', err);
      }
    }
      switch (operation) {
        //1.
        case 'insertOne':
          options.method = 'POST';
          options.body = JSON.stringify(formData.document || {});
          break;
          //2.
        case 'insertMany':
          url = `${API_URL}/users/batch`;
          options.method = 'POST';
          options.body = JSON.stringify(formData.documents || []);
          break;
          //3.
        case 'find':
        if (processedFormData.query) {
          const queryString = JSON.stringify(processedFormData.query);
          url = `${API_URL}/users?query=${encodeURIComponent(queryString)}`;
        }
        options.method = 'GET';
        break;
        //4.
        
      case 'findOne':
        url = `${API_URL}/users/one`;
        if (processedFormData.query) {
          const queryString = JSON.stringify(processedFormData.query);
          url += `?query=${encodeURIComponent(queryString)}`;
        }
        options.method = 'GET';
        break;
          //5.
        case 'limit':
          url = `${API_URL}/users/limit?limit=${formData.limit || 5}`;
          options.method = 'GET';
          break;
          //6.
        case 'skip':
          url = `${API_URL}/users/skip?skip=${formData.skip || 0}`;
          options.method = 'GET';
          break;
          //7.
        case 'sort':
          url = `${API_URL}/users/sort`;
          if (formData.sortBy) {
            url += `?sortBy=${encodeURIComponent(JSON.stringify(formData.sortBy))}`;
          }
          options.method = 'GET';
          break;
        //8.
        case 'distinct':
          url = `${API_URL}/users/distinct?field=${formData.field || 'city'}`;
          options.method = 'GET';
          break;
        //9.
        case 'count':
        url = `${API_URL}/users/count`;
        if (processedFormData.query) {
          const queryString = JSON.stringify(processedFormData.query);
          url += `?query=${encodeURIComponent(queryString)}`;
        }
        options.method = 'GET';
        break;
        //10.
        case 'updateOne':
        url = `${API_URL}/users/one`;
        options.method = 'PUT';
        options.body = JSON.stringify({
          filter: processedFormData.filter || {},
          update: processedFormData.update || {}
        });
        break;
        //11.
      case 'updateMany':
        url = `${API_URL}/users/many`;
        options.method = 'PUT';
        options.body = JSON.stringify({
          filter: processedFormData.filter || {},
          update: processedFormData.update || {}
        });
        break;
          //12.
        case 'replaceOne':
          url = `${API_URL}/users/replace`;
          options.method = 'PUT';
          options.body = JSON.stringify({
            filter: formData.filter || {},
            replacement: formData.replacement || {}
          });
          break;
          //13.
        case 'deleteOne':
          url = `${API_URL}/users/one`;
          options.method = 'DELETE';
          options.body = JSON.stringify({
            filter: formData.filter || {}
          });
          break;
          //14.
        case 'deleteMany':
          url = `${API_URL}/users/many`;
          options.method = 'DELETE';
          options.body = JSON.stringify({
            filter: formData.filter || {}
          });
          break;
          //15.
         case 'aggregate':
        url = `${API_URL}/users/aggregate`;
        if (processedFormData.pipeline) {
          let pipeline = typeof processedFormData.pipeline === 'string' 
            ? JSON.parse(processedFormData.pipeline) 
            : processedFormData.pipeline;
            
          pipeline = pipeline.map(stage => {
            if (stage.$match && stage.$match.age) {
              const ageMatch = stage.$match.age;
              if (typeof ageMatch === 'object') {
                Object.keys(ageMatch).forEach(op => {
                  if (!isNaN(ageMatch[op])) {
                    ageMatch[op] = Number(ageMatch[op]);
                  }
                });
              } else if (!isNaN(ageMatch)) {
                stage.$match.age = Number(ageMatch);
              }
            }
            return stage;
          });
          
          const pipelineString = JSON.stringify(pipeline);
          url += `?pipeline=${encodeURIComponent(pipelineString)}`;
        }
        options.method = 'GET';
        break;
          //16.
        case 'createIndex':
          url = `${API_URL}/users/index`;
          options.method = 'POST';
          options.body = JSON.stringify({
            field: formData.field || 'email',
            options: formData.options || { unique: true }
          });
          break;
          //17.
        case 'dropIndex':
          url = `${API_URL}/users/index`;
          options.method = 'DELETE';
          options.body = JSON.stringify({
            indexName: formData.indexName || 'email_1'
          });
          break;
          //18.
        case 'getIndexes':
          url = `${API_URL}/users/indexes`;
          options.method = 'GET';
          break;
          //19.
        case 'findOneAndUpdate':
          url = `${API_URL}/users/findAndUpdate`;
          options.method = 'PUT';
          options.body = JSON.stringify({
            filter: formData.filter || {},
            update: formData.update || {},
            options: formData.options || { returnDocument: 'after' }
          });
          break;
          //20.
        case 'findOneAndDelete':
          url = `${API_URL}/users/findAndDelete`;
          options.method = 'DELETE';
          options.body = JSON.stringify({
            filter: formData.filter || {}
          });
          break;
          //21.
        case 'bulkWrite':
          url = `${API_URL}/users/bulk`;
          options.method = 'POST';
          options.body = JSON.stringify({
            operations: formData.operations || []
          });
          break;
          //22.
        case 'findOneAndReplace':
          url = `${API_URL}/users/findAndReplace`;
          options.method = 'PUT';
          options.body = JSON.stringify({
            filter: formData.filter || {},
            replacement: formData.replacement || {},
            options: formData.options || { returnDocument: 'after' }
          });
          break;
          //23.
        case 'renameCollection':
          url = `${API_URL}/collections/rename`;
          options.method = 'PUT';
          options.body = JSON.stringify({
            oldName: formData.oldName || 'users',
            newName: formData.newName || 'users_new'
          });
          break;
          //24.
        case 'drop':
          url = `${API_URL}/collections/drop`;
          options.method = 'DELETE';
          break;
          //25.
        case 'listCollections':
          url = `${API_URL}/collections`;
          options.method = 'GET';
          break;
          
        default:
          throw new Error(`Unsupported operation: ${operation}`);
      }

      response = await fetch(url, options);
      const data = await response.json();
      setResult(data);

      // Refreshing users list after certain operations
      if (['insertOne', 'insertMany', 'updateOne', 'updateMany', 'replaceOne', 
           'deleteOne', 'deleteMany', 'findOneAndUpdate', 'findOneAndDelete', 
           'findOneAndReplace', 'bulkWrite'].includes(operation)) {
        fetchUsers();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderForm = () => {
    switch (operation) {
      case 'insertOne':
        return (
          <div className="form-group">
            <label>Document (JSON):</label>
            <textarea 
              name="document" 
              onChange={handleFormChange}
              placeholder='{"name": "John", "email": "john@example.com", "age": 30, "city": "Toronto", "active": true}'
              className="form-control"
            />
          </div>
        );
        
      case 'insertMany':
        return (
          <div className="form-group">
            <label>Documents (JSON array):</label>
            <textarea 
              name="documents" 
              onChange={handleFormChange}
              placeholder='[{"name": "John", "email": "john@example.com"}, {"name": "Jane", "email": "jane@example.com"}]'
              className="form-control"
            />
          </div>
        );
        
      case 'find':
      case 'findOne':
      case 'count':
        return (
          <div className="form-group">
            <label>Query (JSON):</label>
            <textarea 
              name="query" 
              onChange={handleFormChange}
              placeholder='{"age": {"$gte": 18}}'
              className="form-control"
            />
          </div>
        );
        
      case 'limit':
        return (
          <div className="form-group">
            <label>Limit:</label>
            <input 
              type="number" 
              name="limit" 
              onChange={handleFormChange}
              placeholder="5"
              className="form-control"
            />
          </div>
        );
        
      case 'skip':
        return (
          <div className="form-group">
            <label>Skip:</label>
            <input 
              type="number" 
              name="skip" 
              onChange={handleFormChange}
              placeholder="0"
              className="form-control"
            />
          </div>
        );
        
      case 'sort':
        return (
          <div className="form-group">
            <label>Sort By (JSON):</label>
            <textarea 
              name="sortBy" 
              onChange={handleFormChange}
              placeholder='{"age": -1}'
              className="form-control"
            />
          </div>
        );
        
      case 'distinct':
        return (
          <div className="form-group">
            <label>Field:</label>
            <input 
              type="text" 
              name="field" 
              onChange={handleFormChange}
              placeholder="city"
              className="form-control"
            />
          </div>
        );
        
      case 'updateOne':
      case 'updateMany':
      case 'findOneAndUpdate':
        return (
          <>
            <div className="form-group">
              <label>Filter (JSON):</label>
              <textarea 
                name="filter" 
                onChange={handleFormChange}
                placeholder='{"name": "Alice"}'
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label>Update (JSON):</label>
              <textarea 
                name="update" 
                onChange={handleFormChange}
                placeholder='{"$set": {"age": 31}}'
                className="form-control"
              />
            </div>
            {operation === 'findOneAndUpdate' && (
              <div className="form-group">
                <label>Options (JSON, optional):</label>
                <textarea 
                  name="options" 
                  onChange={handleFormChange}
                  placeholder='{"returnDocument": "after"}'
                  className="form-control"
                />
              </div>
            )}
          </>
        );
        
      case 'replaceOne':
      case 'findOneAndReplace':
        return (
          <>
            <div className="form-group">
              <label>Filter (JSON):</label>
              <textarea 
                name="filter" 
                onChange={handleFormChange}
                placeholder='{"name": "Alice"}'
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label>Replacement Document (JSON):</label>
              <textarea 
                name="replacement" 
                onChange={handleFormChange}
                placeholder='{"name": "Alice", "age": 32}'
                className="form-control"
              />
            </div>
            {operation === 'findOneAndReplace' && (
              <div className="form-group">
                <label>Options (JSON, optional):</label>
                <textarea 
                  name="options" 
                  onChange={handleFormChange}
                  placeholder='{"returnDocument": "after"}'
                  className="form-control"
                />
              </div>
            )}
          </>
        );
        
      case 'deleteOne':
      case 'deleteMany':
      case 'findOneAndDelete':
        return (
          <div className="form-group">
            <label>Filter (JSON):</label>
            <textarea 
              name="filter" 
              onChange={handleFormChange}
              placeholder='{"name": "Bob"}'
              className="form-control"
            />
          </div>
        );
        
      case 'aggregate':
        return (
          <div className="form-group">
            <label>Pipeline (JSON array):</label>
            <textarea 
              name="pipeline" 
              onChange={handleFormChange}
              placeholder='[{"$match": {"age": {"$gt": 18}}}, {"$group": {"_id": "$city", "count": {"$sum": 1}}}]'
              className="form-control"
            />
          </div>
        );
        
      case 'createIndex':
        return (
          <>
            <div className="form-group">
              <label>Field:</label>
              <input 
                type="text" 
                name="field" 
                onChange={handleFormChange}
                placeholder="email"
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label>Options (JSON, optional):</label>
              <textarea 
                name="options" 
                onChange={handleFormChange}
                placeholder='{"unique": true}'
                className="form-control"
              />
            </div>
          </>
        );
        
      case 'dropIndex':
        return (
          <div className="form-group">
            <label>Index Name:</label>
            <input 
              type="text" 
              name="indexName" 
              onChange={handleFormChange}
              placeholder="email_1"
              className="form-control"
            />
          </div>
        );
        
      case 'bulkWrite':
        return (
          <div className="form-group">
            <label>Operations (JSON array):</label>
            <textarea 
              name="operations" 
              onChange={handleFormChange}
              placeholder='[{"insertOne": {"document": {"name": "Dan", "email": "dan@example.com"}}}, {"updateOne": {"filter": {"name": "Alice"}, "update": {"$set": {"age": 29}}}}]'
              className="form-control"
              rows={6}
            />
          </div>
        );
        
      case 'renameCollection':
        return (
          <>
            <div className="form-group">
              <label>Old Name:</label>
              <input 
                type="text" 
                name="oldName" 
                onChange={handleFormChange}
                placeholder="users"
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label>New Name:</label>
              <input 
                type="text" 
                name="newName" 
                onChange={handleFormChange}
                placeholder="users_new"
                className="form-control"
              />
            </div>
          </>
        );
        
      // getIndexes, drop, listCollections don't need any inputs
      default:
        return null;
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>MongoDB Operations Demo</h1>
        <p>Exploring the 25 most common MongoDB operations</p>
      </header>

      <div className="container">
        <div className="row">
          <div className="col-md-6">
            <div className="operation-section">
              <h2>Operations</h2>
              <div className="form-group">
                <label>Select Operation:</label>
                <select className="form-control" value={operation} onChange={handleOperationChange}>
                  <optgroup label="Create">
                    <option value="insertOne">insertOne()</option>
                    <option value="insertMany">insertMany()</option>
                  </optgroup>
                  <optgroup label="Read">
                    <option value="find">find()</option>
                    <option value="findOne">findOne()</option>
                    <option value="limit">find().limit()</option>
                    <option value="skip">find().skip()</option>
                    <option value="sort">find().sort()</option>
                    <option value="distinct">distinct()</option>
                    <option value="count">countDocuments()</option>
                  </optgroup>
                  <optgroup label="Update">
                    <option value="updateOne">updateOne()</option>
                    <option value="updateMany">updateMany()</option>
                    <option value="replaceOne">replaceOne()</option>
                    <option value="findOneAndUpdate">findOneAndUpdate()</option>
                    <option value="findOneAndReplace">findOneAndReplace()</option>
                  </optgroup>
                  <optgroup label="Delete">
                    <option value="deleteOne">deleteOne()</option>
                    <option value="deleteMany">deleteMany()</option>
                    <option value="findOneAndDelete">findOneAndDelete()</option>
                  </optgroup>
                  <optgroup label="Advanced">
                    <option value="aggregate">aggregate()</option>
                    <option value="bulkWrite">bulkWrite()</option>
                  </optgroup>
                  <optgroup label="Indexes">
                    <option value="createIndex">createIndex()</option>
                    <option value="dropIndex">dropIndex()</option>
                    <option value="getIndexes">getIndexes()</option>
                  </optgroup>
                  <optgroup label="Collection Management">
                    <option value="renameCollection">renameCollection()</option>
                    <option value="drop">drop()</option>
                    <option value="listCollections">listCollections()</option>
                  </optgroup>
                </select>
              </div>

              <form onSubmit={executeOperation}>
                {renderForm()}
                <div className="action-buttons">
                  <button type="submit" className="btn btn-primary">Execute Operation</button>
                  <button type="button" className="btn btn-warning" onClick={resetDatabase}>Reset & Seed Database</button>
                </div>
              </form>
            </div>
          </div>

          <div className="col-md-6">
            <div className="result-section">
              <h2>Results</h2>
              {loading && <div className="loading">Loading...</div>}
              {error && <div className="error">Error: {error}</div>}
              {result && (
                <pre className="result-json">{JSON.stringify(result, null, 2)}</pre>
              )}
            </div>

            <div className="users-section">
              <h2>Current Users</h2>
              <div className="users-list">
                {users.length === 0 ? (
                  <p>No users found. Try seeding the database.</p>
                ) : (
                  <table className="users-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Age</th>
                        <th>City</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user._id}>
                          <td>{user.name}</td>
                          <td>{user.email}</td>
                          <td>{user.age}</td>
                          <td>{user.city}</td>
                          <td>{user.active ? 'Active' : 'Inactive'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;