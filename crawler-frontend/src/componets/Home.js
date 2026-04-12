import { useState } from "react";
import { newsService } from "../services/newsService";

export default function Home() {
    const [email, setEmail] = useState("");
    const [siteUrl, setSiteUrl] = useState("");
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(false);

    const availableTopics = [
        { id: "security", label: "Security" },
        { id: "programming", label: "Programming" },
        { id: "linux", label: "Linux" },
        { id: "ai", label: "AI" },
        { id: "windows", label: "Windows" },
        { id: "networking", label: "Networking" }
    ];

    const toggleTopic = (topic) => {
        setTopics(prev =>
            prev.includes(topic)
                ? prev.filter(t => t !== topic)
                : [...prev, topic]
        );
    };

    // Универсална функция за заявки
    const executeAction = async (actionFn, successMsg) => {
        if (!email) return alert("Моля въведете имейл.");
        setLoading(true);
        try {
            await actionFn();
            alert(successMsg);
        } catch (err) {
            alert("Грешка: " + (err.response?.data?.error || err.message));
        } finally {
            setLoading(false);
        }
    };

    const handleSubscribe = () => {
        if (!siteUrl) return alert("Моля въведете URL.");
        executeAction(
            () => newsService.subscribe(email, siteUrl, topics),
            "Успешно се абонирахте за ежедневни новини!"
        );
    };

    const handleUnsubscribe = () => {
        executeAction(
            () => newsService.unsubscribe(email),
            "Успешно се отписахте."
        );
    };

    const handleSendNow = () => {
        if (!siteUrl) return alert("Моля въведете URL.");
        executeAction(
            () => newsService.fetchNews(email, siteUrl, topics),
            "Новините бяха изпратени към вашия имейл!"
        );
    };

    return (
        <div style={{ maxWidth: "600px", margin: "40px auto", fontFamily: "Segoe UI, Tahoma, sans-serif" }}>
            <h1 style={{ textAlign: "center", color: "#333" }}>AI News Aggregator</h1>

            <div style={{ padding: "30px", border: "1px solid #eee", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                <div style={{ marginBottom: "20px" }}>
                    <label style={{ fontWeight: "bold" }}>Имейл адрес:</label>
                    <input
                        type="email"
                        placeholder="example@mail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{ width: "100%", padding: "12px", marginTop: "8px", borderRadius: "6px", border: "1px solid #ccc", boxSizing: "border-box" }}
                    />
                </div>

                <div style={{ marginBottom: "20px" }}>
                    <label style={{ fontWeight: "bold" }}>RSS / Сайт URL:</label>
                    <input
                        type="text"
                        placeholder="https://news.ycombinator.com/rss"
                        value={siteUrl}
                        onChange={(e) => setSiteUrl(e.target.value)}
                        style={{ width: "100%", padding: "12px", marginTop: "8px", borderRadius: "6px", border: "1px solid #ccc", boxSizing: "border-box" }}
                    />
                </div>

                <h3 style={{ marginBottom: "12px" }}>Интереси:</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "25px" }}>
                    {availableTopics.map(topic => (
                        <label key={topic.id} style={{ display: "flex", alignItems: "center", cursor: "pointer", fontSize: "14px" }}>
                            <input
                                type="checkbox"
                                checked={topics.includes(topic.id)}
                                onChange={() => toggleTopic(topic.id)}
                                style={{ marginRight: "10px" }}
                            />
                            {topic.label}
                        </label>
                    ))}
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                    <button
                        onClick={handleSubscribe}
                        disabled={loading}
                        style={{ flex: "1", padding: "12px", background: "#007bff", color: "white", border: "none", borderRadius: "6px", cursor: loading ? "not-allowed" : "pointer", fontWeight: "bold" }}
                    >
                        {loading ? "..." : "Абонирай ме"}
                    </button>

                    <button
                        onClick={handleSendNow}
                        disabled={loading}
                        style={{ flex: "1", padding: "12px", background: "#28a745", color: "white", border: "none", borderRadius: "6px", cursor: loading ? "not-allowed" : "pointer", fontWeight: "bold" }}
                    >
                        {loading ? "..." : "Изпрати ми сега"}
                    </button>

                    <button
                        onClick={handleUnsubscribe}
                        disabled={loading}
                        style={{ width: "100%", padding: "10px", background: "transparent", color: "#dc3545", border: "1px solid #dc3545", borderRadius: "6px", cursor: loading ? "not-allowed" : "pointer", marginTop: "5px" }}
                    >
                        Отказ от абонамент
                    </button>
                </div>
            </div>

            <p style={{ textAlign: "center", fontSize: "12px", color: "#888", marginTop: "20px" }}>
                * Абонаментът изпраща новини автоматично всеки ден в 11:31 ч.
            </p>
        </div>
    );
}