import { useState } from "react";
import { articleService } from "../services/articleService";
import { classifyService } from "../services/classifyService";

export default function Home() {
    const [url, setUrl] = useState("");
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [classEmail, setClassEmail] = useState("");
    const [classResult, setClassResult] = useState(null);

    const handleFetch = async () => {
        if (!url) return;
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

    const handleClassify = async () => {
        // Проверяваме url вместо classText
        if (!url || !classEmail) {
            alert("Моля въведете URL адрес и имейл.");
            return;
        }

        try {
            const result = await classifyService.classify(url, classEmail);
            setClassResult(result);
        } catch (err) {
            alert("Грешка при класификация: " + err.message);
        }
    };

    return (
        <div style={{ padding: "40px", fontFamily: "Arial" }}>
            <h1>Website Crawler</h1>

            <input
                type="text"
                placeholder="Enter URL (for fetching or classification)..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                style={{ width: "400px", padding: "10px" }}
            />

            <button
                onClick={handleFetch}
                disabled={loading}
                style={{ marginLeft: "10px", padding: "10px", cursor: loading ? "not-allowed" : "pointer" }}
            >
                {loading ? "Fetching..." : "Fetch Articles"}
            </button>

            {loading && <p>Зареждане на статиите... Моля, изчакайте.</p>}

            <div style={{ marginTop: "40px", padding: "20px", border: "1px solid #ddd" }}>
                <h2>Класификация на заявка</h2>
                <p>Класифицира въведения по-горе URL адрес.</p>

                <input
                    type="email"
                    placeholder="Въведи служебен имейл..."
                    value={classEmail}
                    onChange={(e) => setClassEmail(e.target.value)}
                    style={{ width: "100%", padding: "10px", marginTop: "10px" }}
                />

                <button onClick={handleClassify} style={{ marginTop: "10px", padding: "10px", cursor: "pointer" }}>
                    Класифицирай URL и изпрати имейл
                </button>

                {classResult && (
                    <div style={{ marginTop: "20px" }}>
                        <h3>Резултат:</h3>
                        <p><strong>Класификация:</strong> {classResult.classification}</p>
                        {classResult.sentTo && <p><strong>Изпратено до:</strong> {classResult.sentTo}</p>}
                    </div>
                )}
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