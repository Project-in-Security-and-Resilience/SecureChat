/**
 ** getAIResp:
 * The `getAIResp` function serves as an interface to OpenAI's GPT API, specifically 
 * designed to send user input to the GPT model and receive generated text responses. 
 * It leverages the OpenAI JavaScript SDK to create a seamless integration with GPT, 
 * allowing for dynamic and intelligent interactions within the application.
 * 
 **  Dependencies:
 * - OpenAI JavaScript SDK: A wrapper for OpenAI's API, facilitating the communication with GPT models.
 * - gptApi Configuration: A separate configuration module (`gptApi.js`) that stores the API key required 
 * for authenticating requests to OpenAI's API.
 * 
 **  Configuration:
 * - API_KEY: Extracted from the `gptApi` configuration module, this constant holds the API key needed to
 *  authenticate with OpenAI's API.
 * - openai: An instance of the OpenAI SDK initialized with the API key. The `dangerouslyAllowBrowser` 
 * option is set to true to enable API requests from the browser, though this should be used with 
 * caution due to potential security risks.
 * 
 ** Process Flow:
 * 1. The function accepts a string (`text`) representing the user's input or prompt.
 * 2. It sends this input to the GPT model specified (`gpt-3.5-turbo` in this case) by creating a completion
 *  request through the OpenAI SDK.
 * 3. The function listens for the stream of responses from the API, concatenating each piece of generated 
 * text to form the full response.
 * 4. Once the stream ends, the complete response text is returned.
 * 
 */

// imports
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