const OpenAI = require("openai");
const { config } = require("../config/env");

const openaiClient = new OpenAI({
    apiKey: config.AZURE_OPENAI_API_KEY,
    baseURL: `${config.AZURE_OPENAI_ENDPOINT.replace(/\/$/, "")}/openai/deployments/${config.AZURE_OPENAI_DEPLOYMENT}`,
    defaultQuery: { "api-version": config.AZURE_OPENAI_API_VERSION },
    defaultHeaders: { "api-key": config.AZURE_OPENAI_API_KEY },
});

module.exports = { openaiClient };