const express = require("express");
const router = express.Router();
const { classifyText } = require("../services/classificationService");
const { sendClassificationEmail } = require("../services/emailService");
router.post("/", async (req, res) => {
    const { text, email } = req.body;
    console.log("Получени данни:", text, email); // Виж дали това излиза в терминала

    try {
        const classification = await classifyText(text);
        console.log("AI класификация:", classification); // Виж дали AI връща нещо

        await sendClassificationEmail(email, classification);
        res.json({ success: true, classification });
    } catch (err) {
        console.error("Грешка в маршрута:", err); // ТОВА ЩЕ ТИ КАЖЕ ИСТИНАТА
        res.status(500).json({ error: "Грешка при обработка" });
    }
});

module.exports = router;