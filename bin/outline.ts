import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

interface Feature {
  id: string;
  title: string;
  query?: string;
  comment?: string;
  description?: string;
  children?: string[];
}

interface Outline {
  id: string;
  title: string;
  children?: Outline[];
}

const context = path.resolve(import.meta.dirname, '..');
const dataContext = path.resolve(context, 'src/data');

async function isFileExit(filePath: string) {
  try {
    await fs.promises.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function loadYAML(file: string): Promise<any> {
  const content = await fs.promises.readFile(file, 'utf-8');
  return yaml.load(content) as any;
}

async function loadFeature(
  language: string,
  feature?: string
): Promise<Feature> {
  const currentPath = path.resolve(dataContext, language, feature ?? '');
  if (
    (await isFileExit(currentPath)) &&
    !(await fs.promises.stat(currentPath).then((stat) => stat.isDirectory()))
  ) {
    return await loadYAML(currentPath);
  }
  const currentFilePath = `${currentPath}.yaml`;
  if (await isFileExit(currentFilePath)) {
    return await loadYAML(currentFilePath);
  }
  const currentDirectoryPath = `${currentPath}/index.yaml`;
  if (await isFileExit(currentDirectoryPath)) {
    return await loadYAML(currentDirectoryPath);
  }
  // console.log('++', `${language} ${feature} not found`);
  throw new Error(`Feature ${feature} not found`);
}

async function generateOutline(
  language: string,
  feature?: string
): Promise<Outline> {
  const featureData = await loadFeature(language, feature);
  const outlines: Outline[] = [];
  if (featureData.children) {
    for (const child of featureData.children) {
      // console.log('>>', language, feature, child);
      const childOutline = await generateOutline(
        language,
        path.join(feature || '', child)
      );
      outlines.push(childOutline);
    }
  }
  return {
    id: featureData.id,
    title: featureData.title,
    children: outlines.length > 0 ? outlines : undefined,
  };
}

async function main() {
  const languages = ['typescript', 'kotlin', 'swift'];
  for (let index = 0; index < languages.length; index++) {
    const language = languages[index];
    const outline = await generateOutline(language);
    console.log(yaml.dump(outline));
  }
}

main();
