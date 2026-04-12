const nodemailer = require("nodemailer");
const { config } = require("../config/env");

const emailTransporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: config.SMTP_FROM,
        pass: config.SMTP_PASS
    }
});

module.exports = { emailTransporter };
