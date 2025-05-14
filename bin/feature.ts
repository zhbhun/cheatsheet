import { generateOutline } from './common/outline.ts';
import { generateUsage } from './common/usage.ts';

export default async function processFeature(
  target: string,
  options: {
    outline: boolean;
    usage: boolean;
  }
) {
  const [language, feature] = target.split(':');
  if (options.outline) {
    await generateOutline(language, feature);
  }
  if (options.usage) {
    await generateUsage(language, feature);
  }
}
