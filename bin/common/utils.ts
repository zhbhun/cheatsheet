import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { LanguageData, Feature } from './types.ts';

export const context = path.resolve(import.meta.dirname, '../..');
export const dataContext = path.resolve(context, 'src/language');

export async function isFileExit(filePath: string) {
  try {
    await fs.promises.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function loadYAML(file: string): Promise<any> {
  const featureContent = await fs.promises.readFile(file, 'utf-8');
  const featureData: Feature = yaml.load(featureContent) as any;
  return featureData;
}

export async function getLanguageData(language: string): Promise<LanguageData> {
  const content = await fs.promises.readFile(
    path.resolve(dataContext, `${language}/index.yaml`),
    'utf-8'
  );
  return yaml.load(content) as any;
}

export async function loadFeature(
  language: LanguageData,
  feature: string
): Promise<{
  filepath: string;
  feature: Feature;
}> {
  const currentPath = path.resolve(dataContext, language.id, feature);
  if (
    (await isFileExit(currentPath)) &&
    !(await fs.promises.stat(currentPath).then((stat) => stat.isDirectory()))
  ) {
    return {
      filepath: currentPath,
      feature: await loadYAML(currentPath),
    };
  }
  const currentFilePath = `${currentPath}.yaml`;
  if (await isFileExit(currentFilePath)) {
    return {
      filepath: currentFilePath,
      feature: await loadYAML(currentFilePath),
    };
  }
  const currentDirectoryPath = `${currentPath}/index.yaml`;
  if (await isFileExit(currentDirectoryPath)) {
    return {
      filepath: currentDirectoryPath,
      feature: await loadYAML(currentDirectoryPath),
    };
  }
  throw new Error(`Feature ${feature} not found`);
}
