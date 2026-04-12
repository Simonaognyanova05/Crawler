const express = require("express");
const router = express.Router();
const {
    subscribeUser,
    fetchNewsForUser,
    unsubscribeUser
} = require("../controllers/userController");

router.post("/subscribe", subscribeUser);
router.post("/fetch-news", fetchNewsForUser);
router.post("/unsubscribe", unsubscribeUser);

module.exports = router;
