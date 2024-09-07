import * as yaml from 'yaml';

const modules = import.meta.glob('./**/*.yaml', { query: '?raw' });

export interface Outline {
  id: string;
  title: string;
  children?: Outline[];
}

export interface Language {
  id: string;
  title: string;
  documents: string;
  children: string[];
  outlines: Outline[];
}

export interface LanguageFeauture {
  id: string;
  title: string;
  query?: string;
  comment?: string;
  description: string;
  example?:
    | string
    | {
        title: string;
        content: string;
      }[];
  references: {
    title: string;
    url: string;
  }[];
}

export function loadLanguage(language: string): Promise<Language> {
  return modules[`./${language}/index.yaml`]().then(
    ({ default: source }: any) => {
      return yaml.parse(source) as Language;
    }
  );
}

export function loadLanguageFeature(
  language: string,
  feature: string[]
): Promise<LanguageFeauture> {
  let key = `./${language}/${feature.join('/')}.yaml`;
  if (!modules[key]) {
    key = `./${language}/${feature.join('/')}/index.yaml`;
  }
  console.log(modules, key);
  return modules[key]().then(({ default: source }: any) => {
    return yaml.parse(source) as LanguageFeauture;
  });
}

export default modules;
