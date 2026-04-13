require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const newsRoutes = require("./routes/newsRoutes");
const userRoutes = require("./routes/userRoutes");
require("./cron/newsCron"); 

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/news", newsRoutes);
app.use("/api/user", userRoutes);

connectDB();

const PORT = process.env.PORT || 3030;
app.listen(PORT, () => {
    console.log(`Сървърът е активен на: http://localhost:${PORT}`);
});

