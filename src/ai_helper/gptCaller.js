import OpenAI from "openai";
import gptApi from "./gptApi.js";

// Get the API_KEY of GPT from configuration file
const API_KEY = gptApi.apiKey;
const openai = new OpenAI({
    apiKey: API_KEY,
    dangerouslyAllowBrowser: true
});

// Here is the official function to call the api of GPT
async function getAIResp(text) {
    const stream = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{role: "user", content: text}],
        stream: true
    });
    let result = "";
    for await (const chunk of stream) {
        result += chunk.choices[0]?.delta?.content || "";
    }
    return result;
}

export {getAIResp};