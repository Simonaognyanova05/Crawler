require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const crawlRoutes = require("./routes/crawlRoutes");
const classifyRoutes = require("./routes/classifyRoutes");

const app = express()

app.use(cors());
app.use(express.json());
 
app.use("/crawl", crawlRoutes);
app.use("/classify", classifyRoutes);

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected successfully"))
    .catch((err) => console.error("MongoDB connection error:", err));


app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Нещо се обърка на сървъра!" });
});

const PORT = process.env.PORT || 3030;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Local link: http://localhost:${PORT}`);
});