const express = require("express");
const router = express.Router();
const { classifyText } = require("../services/classificationService");
const { sendClassificationEmail } = require("../services/emailService");

router.post("/", async (req, res) => {
    const { text, email } = req.body;
    console.log("Получени данни:", text, email);

    try {
        const classification = await classifyText(text);
        console.log("AI класификация:", classification);

        await sendClassificationEmail(email, classification);
        res.json({ success: true, classification });
    } catch (err) {
        console.error("Грешка в маршрута:", err);
        res.status(500).json({ error: "Грешка при обработка" });
    }
});

module.exports = router;