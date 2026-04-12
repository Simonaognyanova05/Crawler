const BASE_URL = "http://localhost:3030";

/**
 * Помощна функция за общи заявки
 */
async function apiRequest(endpoint, body) {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });

    const data = await res.json();

    if (!res.ok) {
        // Изхвърляме специфичната грешка от сървъра, ако има такава
        throw new Error(data.error || `Грешка при заявката към ${endpoint}`);
    }

    return data;
}

async function subscribe(email, siteUrl, topics) {
    return apiRequest("/subscribe", { email, siteUrl, topics });
}

async function unsubscribe(email) {
    return apiRequest("/unsubscribe", { email });
}

/**
 * Извиква еднократно извличане и изпращане на новини
 */
async function fetchNews(email, siteUrl, topics = []) {
    return apiRequest("/fetch-news", {
        email,
        siteUrl,
        topics
        // sendNow: true вече не е нужно, тъй като /fetch-news е замислен за това
    });
}

export const newsService = {
    subscribe,
    unsubscribe,
    fetchNews
};