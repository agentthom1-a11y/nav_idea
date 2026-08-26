import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function run(modelName) {
  try {
    const res = await ai.models.generateContent({ model: modelName, contents: "hi" });
    console.log(modelName, "SUCCESS");
  } catch (err) {
    console.error(modelName, "ERROR:", err.message);
  }
}

async function main() {
  await run("gemini-2.5-flash");
  await run("gemini-2.5-flash-lite");
  await run("gemini-3.5-flash");
  await run("gemini-3.6-flash");
  await run("gemini-3.1-pro-preview");
}
main();
