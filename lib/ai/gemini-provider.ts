// lib/ai/gemini-provider.ts — Google Gemini AI Provider Placeholder
// TODO: Implement full Gemini provider with model configuration and helpers

import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY environment variable is not set');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Get a Gemini generative model instance.
 * @param modelName - The Gemini model to use (defaults to gemini-pro)
 */
export function getGeminiModel(modelName = 'gemini-pro') {
  return genAI.getGenerativeModel({ model: modelName });
}

export { genAI };
