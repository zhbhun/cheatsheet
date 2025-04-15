import process from 'node:process';
import { generateFeature } from './feature.ts';

const language = process.argv[2]; // swift
const feature = process.argv[3]; // gui/view/custom

if (feature) {
  generateFeature(language, feature).catch(console.error);
}
