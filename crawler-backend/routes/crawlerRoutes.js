const { Router } = require("express");
const { getRSSFeed } = require("../controllers/crawlerController.js");

const router = Router();

router.get("/rss", getRSSFeed);

export default router;
