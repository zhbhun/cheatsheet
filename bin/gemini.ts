import path from 'path';
import * as dotenv from 'dotenv';
import {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
} from '@google/generative-ai';
const context = path.resolve(import.meta.dirname, '..');

dotenv.config({
  path: path.resolve(context, '.env.local'),
});

const keys = ((process.env.GEMINI_API_KEY as string) || '').split(',');

const geminiFlashs = keys.map((key) =>
  new GoogleGenerativeAI(key).getGenerativeModel({
    model: 'models/gemini-1.5-flash-latest',

    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
      },
    ],
  })
);

const geminiPros = keys.map((key) =>
  new GoogleGenerativeAI(key).getGenerativeModel({
    model: 'models/gemini-1.5-pro-latest',

    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
      },
    ],
  })
);

export function getGeminiFlash() {
  return geminiFlashs[Math.floor(Math.random() * geminiFlashs.length)];
}

export function getGeminiPro() {
  return geminiPros[Math.floor(Math.random() * geminiPros.length)];
}
