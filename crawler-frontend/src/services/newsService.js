const BASE_URL = "http://localhost:3030";

async function subscribe(email, siteUrl, topics) {
    const res = await fetch(`${BASE_URL}/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, siteUrl, topics })
    });

    if (!res.ok) {
        throw new Error("Грешка при абониране");
    }

    return res.json();
}


async function unsubscribe(email) {
    const res = await fetch(`${BASE_URL}/unsubscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
    });

    if (!res.ok) {
        throw new Error("Грешка при отписване");
    }

    return res.json();
}

async function sendHackerNews(email) {
    const res = await fetch(`${BASE_URL}/send-hacker-news`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
    });

    if (!res.ok) {
        throw new Error("Грешка при изпращане на Hacker News");
    }

    return res.json();
}

async function fetchNews(email, siteUrl, topics = []) {
    const res = await fetch(`${BASE_URL}/fetch-news`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, siteUrl, topics, sendNow: true })
    });

    if (!res.ok) {
        throw new Error("Грешка при изпращане на новини от сайта");
    }

    return res.json();
}

export const newsService = {
    subscribe,
    unsubscribe,
    sendHackerNews,
    fetchNews
};
