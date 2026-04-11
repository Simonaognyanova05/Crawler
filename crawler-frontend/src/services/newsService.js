const API_URL = "http://localhost:3030";

export const newsService = {
    sendAllNews: async (email) => {
        try {
            const res = await fetch(`${API_URL}/send-all-news`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email })
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Грешка при изпращане на новините");
            }

            return await res.json();
        } catch (error) {
            console.error("Client Service Error:", error.message);
            throw error;
        }
    },

    sendHackerNews: async (email) => {
        try {
            const res = await fetch(`${API_URL}/send-hackernews`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email })
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Грешка при изпращане на Hacker News");
            }

            return await res.json();
        } catch (error) {
            console.error("Client Service Error:", error.message);
            throw error;
        }
    }
};
