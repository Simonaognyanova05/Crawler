require("dotenv").config();
const OpenAI = require("openai");

const client = new OpenAI({
    apiKey: process.env.AZURE_OPENAI_API_KEY,
    baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT}`,
    defaultQuery: {
        "api-version": process.env.AZURE_OPENAI_API_VERSION,
    },
    defaultHeaders: {
        "api-key": process.env.AZURE_OPENAI_API_KEY,
    },
});

async function classifyWord(word) {
    const response = await client.chat.completions.create({
        model: process.env.AZURE_OPENAI_DEPLOYMENT,
        messages: [
            {
                role: "system",
                content:
                    "You are a classifier. Classify into: Animal, Food, Technology, Sport, Other. Return only one word.",
            },
            {
                role: "user",
                content: `Word: ${word}`,
            },
        ],
        temperature: 0,
    });

    return response.choices[0].message.content;
}

(async () => {
    const word = process.argv[2];

    if (!word) {
        console.log("Usage: node index.js <word>");
        process.exit(1);
    }

    const result = await classifyWord(word);
    console.log(`Word: ${word}`);
    console.log(`Category: ${result}`);
})();