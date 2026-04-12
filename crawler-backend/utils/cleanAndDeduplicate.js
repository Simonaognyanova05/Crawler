function cleanAndDeduplicate(articles) {
    const seen = new Set();

    return articles.filter(article => {
        const isNew = !seen.has(article.link);
        const isNotNoise =
            article.title && article.title.split(/\s+/).length > 3;

        if (isNew && isNotNoise) {
            seen.add(article.link);
            return true;
        }
        return false;
    });
}

module.exports = { cleanAndDeduplicate };
