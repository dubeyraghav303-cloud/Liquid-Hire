import { createGoogleGenerativeAI } from '@ai-sdk/google';

export const gemini = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_API_KEY,
});

export const modelName = 'gemini-2.5-flash';
