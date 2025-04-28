import path from 'node:path';
import * as dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

const context = path.resolve(import.meta.dirname, '../..');

dotenv.config({
  path: path.resolve(context, '.env.local'),
});

const keys = ((process.env.GEMINI_API_KEY as string) || '').split(',');

const genais = keys.map((key) => new GoogleGenAI({ apiKey: key }));

export function getGenai() {
  return genais[Math.floor(Math.random() * genais.length)];
}
