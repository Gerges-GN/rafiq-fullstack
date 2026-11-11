const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const createRateLimiter = require("./Middleware/rateLimit");

if (!process.env.JWT_SECRET || Buffer.byteLength(process.env.JWT_SECRET, 'utf8') < 32) {
    throw new Error("JWT_SECRET must be configured with at least 32 bytes");
}
if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI must be configured");
}

const app = express();

const allowedOrigins = new Set(
  (process.env.FRONTEND_ORIGINS || "http://localhost:5173,http://127.0.0.1:5173,http://localhost:4173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
);

app.disable("x-powered-by");
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-Frame-Options", "DENY");
  next();
});
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin(origin, callback) {
    callback(null, !origin || allowedOrigins.has(origin));
  },
  credentials: false,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

let databaseConnectionPromise;
const connectDatabase = () => {
  if (mongoose.connection.readyState === 1) return Promise.resolve(true);
  if (!databaseConnectionPromise) {
    databaseConnectionPromise = mongoose.connect(process.env.MONGO_URI)
      .then(() => {
        console.log("MongoDB connected");
        return true;
      })
      .catch((error) => {
        console.error("MongoDB connection failed:", error.message);
        return false;
      })
      .finally(() => {
        databaseConnectionPromise = null;
      });
  }
  return databaseConnectionPromise;
};

app.use(async (req, res, next) => {
  try {
    if (!(await connectDatabase()) || mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: "Database is unavailable." });
    }
    return next();
  } catch {
    return res.status(503).json({ message: "Database is unavailable." });
  }
});

app.use("/api/users/login", createRateLimiter({ windowMs: 15 * 60 * 1000, max: 10 }));
app.use("/api/users/register", createRateLimiter({ windowMs: 60 * 60 * 1000, max: 5 }));
app.use("/api/ai", createRateLimiter({ windowMs: 60 * 1000, max: 20 }));

app.use("/api/users", require("./Routes/User"));
app.use("/api/profiles", require("./Routes/TouristProfile"));
app.use("/api/posts", require("./Routes/Post"));
app.use("/api/places", require("./Routes/Place"));
app.use("/api/upload", require("./Routes/Upload"));
app.use("/api/ai", require("./Routes/Recommendation"));
app.use("/api/chats", require("./Routes/Chat"));
app.use("/api/trips", require("./Routes/Trip"));
app.use("/api/tourguide-profiles", require("./Routes/TourGuideProfile"));
app.use("/api/bookings", require("./Routes/Booking"));
app.use("/api/reviews", require("./Routes/Review"));
app.use("/api/reports", require("./Routes/Report"));
app.use("/api/admin", require("./Routes/Admin"));

app.get("/api", (req, res) => {
    res.json({ status: "Backend running" });
});

app.use((err, req, res, next) => {
    console.error("Unhandled API error:", err.message);
    const status = err.code === 'LIMIT_FILE_SIZE' ? 413 : (err.statusCode || err.status || 500);
    const safeStatus = status >= 400 && status < 500 ? status : 500;
    const message = safeStatus === 413
      ? "The request is too large."
        : safeStatus < 500
        ? "Invalid request."
        : "Internal server error.";
    res.status(safeStatus).json({ success: false, message });
});

if (require.main === module) {
    connectDatabase().then((ready) => {
      if (!ready) {
        process.exitCode = 1;
        return;
      }
      app.listen(process.env.PORT || 5000, "0.0.0.0", () => console.log("Server started"));
    });
}

module.exports = app;
