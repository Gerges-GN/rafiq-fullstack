const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  role: { 
    type: String, 
    enum: ['admin', 'tourist', 'tourguide'], 
    default: 'tourist' 
  },
  // Added location field
  location: { 
    type: String, 
    required: [true, 'Location is required'] 
  },
  createdAt: { type: Date, default: Date.now }
});



module.exports = mongoose.model('User', userSchema);