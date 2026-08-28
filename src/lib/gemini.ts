import { createGoogleGenerativeAI } from '@ai-sdk/google';

if (!process.env.GOOGLE_API_KEY) {
    console.error("ERROR: GOOGLE_API_KEY is missing in server environment!");
}

export const gemini = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_API_KEY,
});

export const modelName = 'gemma-4-31b-it';
