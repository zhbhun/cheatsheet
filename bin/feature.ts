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
    // TODO: Implement outline generation
  }
  if (options.usage) {
    await generateUsage(language, feature);
  }
}
