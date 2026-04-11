import { useState } from "react";
import { articleService } from "../services/articleService";
import { newsService } from "../services/newsService";

export default function Home() {
    const [email, setEmail] = useState("");
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleFetch = async () => {
        setLoading(true);

        try {
            const data = await articleService.fetchHackerNews();
            setArticles(data);
        } catch (err) {
            alert("Възникна грешка при извличане на данните.");
        } finally {
            setLoading(false);
        }
    };

    const handleSendAllNews = async () => {
        if (!email) {
            alert("Моля въведете имейл.");
            return;
        }

        try {
            await newsService.sendAllNews(email);
            alert("Всички новини бяха изпратени успешно!");
        } catch (err) {
            alert("Грешка при изпращане: " + err.message);
        }
    };

    const handleSendHackerNews = async () => {
        if (!email) {
            alert("Моля въведете имейл.");
            return;
        }

        try {
            await newsService.sendHackerNews(email);
            alert("Hacker News новините бяха изпратени успешно!");
        } catch (err) {
            alert("Грешка при изпращане: " + err.message);
        }
    };

    return (
        <div style={{ padding: "40px", fontFamily: "Arial" }}>
            <h1>Website Crawler</h1>

            <button
                onClick={handleFetch}
                disabled={loading}
                style={{ padding: "10px", cursor: loading ? "not-allowed" : "pointer" }}
            >
                {loading ? "Fetching..." : "Fetch Hacker News"}
            </button>

            {loading && <p>Зареждане на статиите... Моля, изчакайте.</p>}

            <div style={{ marginTop: "40px", padding: "20px", border: "1px solid #ddd" }}>
                <h2>Изпращане на новини по имейл</h2>

                <input
                    type="email"
                    placeholder="Въведи имейл..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ width: "100%", padding: "10px", marginTop: "10px" }}
                />

                <button
                    onClick={handleSendAllNews}
                    style={{ marginTop: "10px", padding: "10px", cursor: "pointer" }}
                >
                    Изпрати всички новини от базата
                </button>

                <button
                    onClick={handleSendHackerNews}
                    style={{ marginTop: "10px", padding: "10px", cursor: "pointer", marginLeft: "10px" }}
                >
                    Изпрати Hacker News новини
                </button>
            </div>

            <div style={{ marginTop: "30px" }}>
                {articles.map((article, index) => (
                    <div key={article._id || index} style={{ marginBottom: "20px", borderBottom: "1px solid #eee", paddingBottom: "10px" }}>
                        <h3>{article.title}</h3>
                        <p>{article.description}</p>
                        <small>{new Date(article.pubDate).toLocaleString()}</small>
                        <br />
                        <a href={article.link} target="_blank" rel="noreferrer">Read more</a>
                    </div>
                ))}
            </div>
        </div>
    );
}
