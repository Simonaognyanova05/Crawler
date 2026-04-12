const BASE_URL = "http://localhost:3030";

async function apiRequest(endpoint, body) {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.error || `Грешка при заявката към ${endpoint}`);
    }

    return data;
}

async function subscribe(email, siteUrl, topics) {
    return apiRequest("/api/user/subscribe", { email, siteUrl, topics });
}

async function unsubscribe(email) {
    return apiRequest("/api/user/unsubscribe", { email });
}

async function fetchNews(email, siteUrl, topics = []) {
    return apiRequest("/api/news/fetch-news", {
        email,
        siteUrl,
        topics
    });
}

export const newsService = {
    subscribe,
    unsubscribe,
    fetchNews
};
