const {
    subscribeUserService,
    fetchNewsForUserService,
    unsubscribeUserService
} = require("../services/userService");

async function subscribeUser(req, res) {
    const { email, topics, siteUrl } = req.body;

    if (!email || !siteUrl) {
        return res.status(400).json({ error: "Email и siteUrl са задължителни" });
    }

    try {
        const user = await subscribeUserService(email, topics, siteUrl);
        res.json({ success: true, message: "Абонаментът е успешен", user });
    } catch (err) {
        res.status(500).json({ error: "Грешка при абониране" });
    }
}

async function fetchNewsForUser(req, res) {
    const { email } = req.body;

    try {
        const result = await fetchNewsForUserService(email);

        if (result.error === "USER_NOT_FOUND")
            return res.status(404).json({ error: "Потребителят не е намерен" });

        if (result.error === "NO_ARTICLES")
            return res.status(404).json({ error: "Няма намерени статии." });

        if (result.error === "NO_NEW_ARTICLES")
            return res.status(200).json({ message: "Няма нови статии." });

        if (result.error === "NO_MATCHING_TOPICS")
            return res.status(200).json({ message: "Новите статии не съвпадат с Вашите теми." });

        res.json({
            success: true,
            message: `Успешно изпратени ${result.count} новини.`,
            sentCount: result.count
        });

    } catch (err) {
        console.error("Controller error:", err);
        res.status(500).json({ error: "Вътрешна грешка" });
    }
}

async function unsubscribeUser(req, res) {
    const { email } = req.body;

    try {
        await unsubscribeUserService(email);
        res.json({ success: true, message: "Успешно отписване." });
    } catch (err) {
        res.status(500).json({ error: "Грешка при отписване." });
    }
}

module.exports = {
    subscribeUser,
    fetchNewsForUser,
    unsubscribeUser
};
