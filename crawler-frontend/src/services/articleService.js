const API_BASE_URL = "http://localhost:3030";

export const articleService = {
    async fetchHackerNews() {
        try {
            const response = await fetch(`${API_BASE_URL}/crawl/hackernews`);

            if (!response.ok) {
                throw new Error(`Query error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Service Error:", error);
            throw error;
        }
    }
};