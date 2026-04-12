const mongoose = require("mongoose");

function connectDB() {
    mongoose.connect(process.env.MONGO_URI)
        .then(() => console.log("MongoDB свързана успешно"))
        .catch(err => console.error("MongoDB грешка:", err));
}

module.exports = connectDB;
