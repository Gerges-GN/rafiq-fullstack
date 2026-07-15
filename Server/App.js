const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

console.log("=== SERVER START ===");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("MONGO_URI exists:", !!process.env.MONGO_URI);
console.log("JWT_SECRET exists:", !!process.env.JWT_SECRET);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: true,
  credentials: true,
}));

// MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => {
    console.error("❌ Mongo Error");
    console.error(err);
});

// ---------- LOAD ROUTES ONE BY ONE ----------
try {
    app.use("/api/users", require("./Routes/User"));
    console.log("✅ User route loaded");
} catch (e) {
    console.error("❌ User route failed");
    console.error(e);
}

try {
    app.use("/api/profiles", require("./Routes/TouristProfile"));
    console.log("✅ TouristProfile route loaded");
} catch (e) {
    console.error("❌ TouristProfile route failed");
    console.error(e);
}

try {
    app.use("/api/posts", require("./Routes/Post"));
    console.log("✅ Post route loaded");
} catch (e) {
    console.error("❌ Post route failed");
    console.error(e);
}

try {
    app.use("/api/places", require("./Routes/Place"));
    console.log("✅ Place route loaded");
} catch (e) {
    console.error("❌ Place route failed");
    console.error(e);
}

try {
    app.use("/api/chats", require("./Routes/Chat"));
    console.log("✅ Chat route loaded");
} catch (e) {
    console.error("❌ Chat route failed");
    console.error(e);
}

try {
    app.use("/api/trips", require("./Routes/Trip"));
    console.log("✅ Trip route loaded");
} catch (e) {
    console.error("❌ Trip route failed");
    console.error(e);
}

try {
    app.use("/api/tourguide-profiles", require("./Routes/TourGuideProfile"));
    console.log("✅ TourGuide route loaded");
} catch (e) {
    console.error("❌ TourGuide route failed");
    console.error(e);
}

try {
    app.use("/api/bookings", require("./Routes/Booking"));
    console.log("✅ Booking route loaded");
} catch (e) {
    console.error("❌ Booking route failed");
    console.error(e);
}

try {
    app.use("/api/reviews", require("./Routes/Review"));
    console.log("✅ Review route loaded");
} catch (e) {
    console.error("❌ Review route failed");
    console.error(e);
}

try {
    app.use("/api/reports", require("./Routes/Report"));
    console.log("✅ Report route loaded");
} catch (e) {
    console.error("❌ Report route failed");
    console.error(e);
}

try {
    app.use("/api/admin", require("./Routes/Admin"));
    console.log("✅ Admin route loaded");
} catch (e) {
    console.error("❌ Admin route failed");
    console.error(e);
}

app.get("/api", (req, res) => {
    res.json({ status: "Backend running" });
});

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({
        success: false,
        message: err.message
    });
});

if (process.env.NODE_ENV !== "production") {
    app.listen(process.env.PORT || 5000, () => {
        console.log("Local server started");
    });
}

module.exports = app;