require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const crawlRoutes = require("./routes/crawlRoutes");
const classifyRoutes = require("./routes/classifyRoutes");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/crawl", crawlRoutes);


app.use("/classify", classifyRoutes);
mongoose.connect(process.env.MONGO_URI).then(() => console.log("MongoDB connected")).catch((err) => console.error(err));
const PORT = process.env.PORT || 3030;

app.listen(PORT, () => {
    console.log(`Server running on port${PORT}`);
});




