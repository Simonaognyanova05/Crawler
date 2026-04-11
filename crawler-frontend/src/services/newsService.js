const API_URL = "http://localhost:3030";

export const newsService = {
    async subscribe(email) {
        const res = await fetch(`${API_URL}/subscribe`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || "Subscription failed");
        }

        return await res.json();
    },

    async unsubscribe(email) {
        const res = await fetch(`${API_URL}/unsubscribe`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || "Unsubscribe failed");
        }

        return await res.json();
    },

    async sendHackerNews(email) {
        const res = await fetch(`${API_URL}/send-hacker-news`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || "Sending failed");
        }

        return await res.json();
    }
};
