const { Pinecone } = require("@pinecone-database/pinecone");

const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY
});

const index = pc.Index("cohrt-chat-gpt");

// Save Memory
async function createMemory({ vector, metadata, messageId }) {

    await index.upsert([
        {
            id: String(messageId),
            values: vector,
            metadata: {
                chat: String(metadata.chat),
                user: String(metadata.user),
                text: String(metadata.text)
            }
        }
    ]);

    console.log("Memory saved");
}

// Search Memory
async function queryMemory({ queryVector, limit = 5 }) {

    const response = await index.query({
        vector: queryVector,
        topK: limit,
        includeMetadata: true
    });

    return response.matches || [];
}

module.exports = {
    createMemory,
    queryMemory
};