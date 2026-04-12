function normalizeLink(link, baseUrl) {
    try {
        if (!link) return null;
        if (!link.startsWith("http")) {
            link = new URL(link, baseUrl).href;
        }
        return link.split("#")[0];
    } catch {
        return null;
    }
}

module.exports = { normalizeLink };
