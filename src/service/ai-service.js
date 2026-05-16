const { GoogleGenAI }= require("@google/genai");

const ai = new GoogleGenAI(process.env.GEMINI_API_KEY);

async function generateResponse(content) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: content,
  });
  console.log(response.text);
  return response.text;
}

module.exports = {
    generateResponse,
}