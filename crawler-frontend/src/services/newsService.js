const API_URL = "http://localhost:3030";

export const newsService = {
    async sendHackerNews(email) {
        const res = await fetch(`${API_URL}/send-hacker-news`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email })
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || "Server error");
        }

        return await res.json();
    }
};
