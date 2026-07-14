const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Route Imports
const userRoutes = require('./routes/User');
const profileRoutes = require('./routes/TouristProfile');
const postRoutes = require('./routes/Post');
const placeRoutes = require('./routes/Place');
const chatRoutes = require('./routes/chat');
const tripRoutes = require('./routes/Trip');
const tourGuideProfileRoutes = require('./routes/tourGuideProfile');
const bookingRoutes = require('./routes/Booking');
const reviewRoutes = require('./routes/Review');
const reportRoutes = require('./routes/Report');
const adminRoutes = require('./routes/Admin');
const app = express();
// ✅ Add these BEFORE your routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: [
        "http://localhost:5173",
    ],
    credentials: true
}));

// Database Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected Successfully'))
  .catch((err) => {
    console.error('❌ MongoDB Connection Failed');
    console.error(err.message);
  });

// Routes
app.use('/api/users', userRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/places', placeRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/tourguide-profiles', tourGuideProfileRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes)
// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});


if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

module.exports = app;