import { useState } from "react";
import { newsService } from "../services/newsService";

export default function Home() {
    const [email, setEmail] = useState("");
    const [siteUrl, setSiteUrl] = useState("");
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(false);

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

        if (!siteUrl) {
            alert("Моля въведете сайт URL.");
            return;
        }

        if (topics.length === 0) {
            alert("Моля изберете поне една тема.");
            return;
        }

        try {
            await newsService.subscribe(email, siteUrl, topics);
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

    const handleSendWebsiteNews = async () => {
        if (!email || !siteUrl) {
            alert("Моля въведете имейл и сайт URL.");
            return;
        }

        setLoading(true);

        try {
            await newsService.fetchNews(email, siteUrl, topics);
            alert("Новините от сайта бяха изпратени успешно!");
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
                <h2>Абонамент и новини</h2>

                <input
                    type="email"
                    placeholder="Въведи имейл..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ width: "100%", padding: "10px", marginTop: "10px" }}
                />

                <input
                    type="text"
                    placeholder="Въведи RSS линк на сайта..."
                    value={siteUrl}
                    onChange={(e) => setSiteUrl(e.target.value)}
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

                <div style={{ marginTop: "20px" }}>
                    <button
                        onClick={handleSubscribe}
                        style={{ padding: "10px", cursor: "pointer" }}
                    >
                        Абонирай се
                    </button>

                    <button
                        onClick={handleUnsubscribe}
                        style={{
                            padding: "10px",
                            cursor: "pointer",
                            marginLeft: "10px",
                            background: "#ffdddd"
                        }}
                    >
                        Отпиши се
                    </button>
                </div>

                <div style={{ marginTop: "20px" }}>
                    <button
                        onClick={handleSendHackerNews}
                        disabled={loading}
                        style={{
                            padding: "10px",
                            cursor: loading ? "not-allowed" : "pointer"
                        }}
                    >
                        {loading ? "Изпращане..." : "Изпрати Hacker News новини"}
                    </button>

                    <button
                        onClick={handleSendWebsiteNews}
                        disabled={loading}
                        style={{
                            padding: "10px",
                            cursor: loading ? "not-allowed" : "pointer",
                            marginLeft: "10px",
                            background: "#ddffdd"
                        }}
                    >
                        {loading ? "Изпращане..." : "Изпрати новини от сайта"}
                    </button>
                </div>
            </div>
        </div>
    );
}
