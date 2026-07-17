// lib/ai/gemini-provider.ts — Google Gemini AI Provider Placeholder
import { GoogleGenerativeAI } from '@google/generative-ai';

let warned = false;
const checkKey = () => {
  if (!process.env.GEMINI_API_KEY && !warned) {
    console.warn('⚠️ WARNING: GEMINI_API_KEY is not set. Google Gemini AI features will fail on execution.');
    warned = true;
  }
};

const rawGenAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'DUMMY_KEY');

export const genAI = new Proxy(rawGenAI, {
  get(target, prop, receiver) {
    checkKey();
    return Reflect.get(target, prop, receiver);
  }
});

/**
 * Get a Gemini generative model instance.
 * @param modelName - The Gemini model to use (defaults to gemini-pro)
 */
export function getGeminiModel(modelName = 'gemini-pro') {
  return genAI.getGenerativeModel({ model: modelName });
}

