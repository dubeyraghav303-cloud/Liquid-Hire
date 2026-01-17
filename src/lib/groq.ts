import { createOpenAI } from '@ai-sdk/openai';

export const groq = createOpenAI({
    baseURL: 'https://api.groq.com/openai/v1',
    apiKey: process.env.GROQ_API_KEY,
});

export const modelName = 'llama-3.3-70b-versatile'; // Fast, smart, and generous free tier
