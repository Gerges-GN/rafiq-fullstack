const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected Successfully');
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Failed');
    console.error(err.message);
  });

app.get('/', (req, res) => {
  res.send('Server Running');
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});