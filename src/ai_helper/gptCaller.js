import OpenAI from "openai";


let content = "What is java";

// Get the API_KEY of GPT from system environment
const API_KEY = process.env.GPT_API_KEY;
const openai = new OpenAI({
    apiKey : API_KEY
});

// Here is the official function to call the api of GPT
async function main() {
    const stream = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{role: "user", content: content}],
        stream: true
    });
    for await (const chunk of stream) {
        process.stdout.write(chunk.choices[0]?.delta?.content || "");
    }
}

main();