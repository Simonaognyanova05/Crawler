require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const crawlRoutes = require("./routes/crawlRoutes");
const classifyRoutes = require("./routes/classifyRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Проверка дали всички нужни променливи са налични (защита)
const requiredEnv = ['MONGO_URI', 'EMAIL', 'PASSWORD', 'AZURE_OPENAI_KEY'];
requiredEnv.forEach(variable => {
    if (!process.env[variable]) {
        console.error(`❌ ВНИМАНИЕ: Променливата ${variable} липсва в .env файла!`);
    }
});

// Routes
app.use("/crawl", crawlRoutes);
app.use("/classify", classifyRoutes);

// Свързване с MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("🚀 MongoDB connected successfully"))
    .catch((err) => console.error("❌ MongoDB connection error:", err));

// Global Error Handler (за неочаквани грешки)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Нещо се обърка на сървъра!" });
});

const PORT = process.env.PORT || 3030;

app.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
    console.log(`🔗 Local link: http://localhost:${PORT}`);
});