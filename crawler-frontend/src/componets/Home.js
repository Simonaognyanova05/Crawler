import { useState } from "react";
import { newsService } from "../services/newsService";

export default function Home() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    // Теми за абонамент
    const [topics, setTopics] = useState([]);

    const toggleTopic = (topic) => {
        setTopics(prev =>
            prev.includes(topic)
                ? prev.filter(t => t !== topic)
                : [...prev, topic]
        );
    };

    const handleSubscribe = async () => {
        if (!email) {
            alert("Моля въведете имейл.");
            return;
        }

        if (topics.length === 0) {
            alert("Моля изберете поне една тема.");
            return;
        }

        try {
            await newsService.subscribe(email, topics);
            alert("Успешно се абонирахте!");
        } catch (err) {
            alert("Грешка при абониране: " + err.message);
        }
    };

    const handleUnsubscribe = async () => {
        if (!email) {
            alert("Моля въведете имейл.");
            return;
        }

        try {
            await newsService.unsubscribe(email);
            alert("Успешно се отписахте!");
        } catch (err) {
            alert("Грешка при отписване: " + err.message);
        }
    };

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
                <h2>Абонамент за Hacker News</h2>

                <input
                    type="email"
                    placeholder="Въведи имейл..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ width: "100%", padding: "10px", marginTop: "10px" }}
                />

                <h3 style={{ marginTop: "20px" }}>Избери теми:</h3>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <label>
                        <input
                            type="checkbox"
                            checked={topics.includes("security")}
                            onChange={() => toggleTopic("security")}
                        />
                        Security
                    </label>

                    <label>
                        <input
                            type="checkbox"
                            checked={topics.includes("programming")}
                            onChange={() => toggleTopic("programming")}
                        />
                        Programming
                    </label>

                    <label>
                        <input
                            type="checkbox"
                            checked={topics.includes("linux")}
                            onChange={() => toggleTopic("linux")}
                        />
                        Linux
                    </label>

                    <label>
                        <input
                            type="checkbox"
                            checked={topics.includes("ai")}
                            onChange={() => toggleTopic("ai")}
                        />
                        AI
                    </label>

                    <label>
                        <input
                            type="checkbox"
                            checked={topics.includes("windows")}
                            onChange={() => toggleTopic("windows")}
                        />
                        Windows
                    </label>

                    <label>
                        <input
                            type="checkbox"
                            checked={topics.includes("networking")}
                            onChange={() => toggleTopic("networking")}
                        />
                        Networking
                    </label>
                </div>

                <button
                    onClick={handleSubscribe}
                    style={{ marginTop: "20px", padding: "10px", cursor: "pointer" }}
                >
                    Абонирай се
                </button>

                <button
                    onClick={handleUnsubscribe}
                    style={{
                        marginTop: "10px",
                        padding: "10px",
                        cursor: "pointer",
                        marginLeft: "10px",
                        background: "#ffdddd"
                    }}
                >
                    Отпиши се
                </button>

                <button
                    onClick={handleSendHackerNews}
                    disabled={loading}
                    style={{
                        marginTop: "10px",
                        padding: "10px",
                        cursor: loading ? "not-allowed" : "pointer",
                        marginLeft: "10px"
                    }}
                >
                    {loading ? "Изпращане..." : "Изпрати Hacker News новини"}
                </button>
            </div>
        </div>
    );
}
