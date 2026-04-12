const cron = require("node-cron");
const { processDailyNews } = require("../services/cronService");

cron.schedule(
    "26 21 * * *",
    async () => {
        console.log("Стартиране на ежедневната задача за новини...");
        await processDailyNews();
    },
    { timezone: "Europe/Sofia" }
);
