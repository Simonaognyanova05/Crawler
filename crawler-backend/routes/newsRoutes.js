const express = require("express");
const router = express.Router();
const { fetchNews } = require("../controllers/newsController");

router.post("/fetch-news", fetchNews);

module.exports = router;
 