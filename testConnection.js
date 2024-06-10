const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI || "";

mongoose.connect(uri)
  .then(() => {
    console.log('Connected to MongoDB');
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err.message);
  });
