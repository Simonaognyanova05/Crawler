import { useState } from "react";
import { newsService } from "../services/newsService";

export default function Home() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubscribe = async () => {
        if (!email) {
            alert("Моля въведете имейл.");
            return;
        }

        try {
            await newsService.subscribe(email);
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

                <button
                    onClick={handleSubscribe}
                    style={{ marginTop: "10px", padding: "10px", cursor: "pointer" }}
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
