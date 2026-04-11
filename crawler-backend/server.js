require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const newsRoutes = require("./routes/news");

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/", newsRoutes);

// MongoDB connection
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected successfully"))
    .catch((err) => console.error("MongoDB connection error:", err));

// Global error handler
app.use((err, req, res, next) => {
    console.error("Server error:", err.stack);
    res.status(500).json({ error: "Something went wrong on the server." });
});

const PORT = process.env.PORT || 3030;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Local link: http://localhost:${PORT}`);
});
