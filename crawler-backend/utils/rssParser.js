const Parser = require("rss-parser");

const rssParser = new Parser({
    xml2js: { strict: false },
    headers: { "User-Agent": "Mozilla/5.0" }
});

module.exports = { rssParser };
