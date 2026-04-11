import { useState } from "react";
import { newsService } from "../services/newsService";

export default function Home() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSendHackerNews = async () => {
        if (!email) {
            alert("Моля въведете имейл.");
            return;
        }

        setLoading(true);

        try {
            await newsService.sendHackerNews(email);
            alert("Hacker News новините бяха изпратени успешно!");
        } catch (err) {
            alert("Грешка при изпращане: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: "40px", fontFamily: "Arial" }}>
            <h1>Website Crawler</h1>

            <div style={{ marginTop: "40px", padding: "20px", border: "1px solid #ddd" }}>
                <h2>Изпращане на Hacker News по имейл</h2>

                <input
                    type="email"
                    placeholder="Въведи имейл..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ width: "100%", padding: "10px", marginTop: "10px" }}
                />

                <button
                    onClick={handleSendHackerNews}
                    disabled={loading}
                    style={{
                        marginTop: "10px",
                        padding: "10px",
                        cursor: loading ? "not-allowed" : "pointer"
                    }}
                >
                    {loading ? "Изпращане..." : "Изпрати Hacker News новини"}
                </button>
            </div>
        </div>
    );
}
