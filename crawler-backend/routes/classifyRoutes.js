const express = require("express");
const router = express.Router();
const { classifyText } = require("../services/classificationService");
const { sendClassificationEmail } = require("../services/emailService");


router.post("/", async (req, res) => {
    const { text, email } = req.body;
    if (!text || !email) {
        return res.status(400).json({ error: "Text and email are required"});
    }

    try {
        const classification = await classifyText(text);
        await sendClassificationEmail(email, classification);

        res.json({
            success: true,
            classification,
            sentTo: email
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "LLM or email error"
        });
    }
});


module.exports = router;



