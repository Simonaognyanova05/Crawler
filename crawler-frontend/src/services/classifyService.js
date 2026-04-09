const API_URL = "http://localhost:3030";

export const classifyService = {
    classify: async (text, email) => {
        try {
            const res = await fetch(`${API_URL}/classify`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ text, email })
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Грешка при комуникация със сървъра");
            }

            return await res.json();
        } catch (error) {
            console.error("Client Service Error:", error.message);
            throw error;
        }
    }
};