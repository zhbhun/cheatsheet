import * as yaml from 'yaml';

const modules = import.meta.glob('./**/*.yaml', { query: '?raw' });

export const languages = [
  {
    label: 'Kotlin',
    value: 'kotlin',
  },
  {
    label: 'Swift',
    value: 'swift',
  },
  {
    label: 'Typescript',
    value: 'typescript',
  },
];

export interface Language {
  id: string;
  title: string;
  documents: string;
  children: string[];
  outlines: LanguageOutline[];
}

export interface LanguageOutline {
  id: string;
  title: string;
  children?: LanguageOutline[];
}

export interface LanguageFeauture {
  id: string;
  title: string;
  query?: string;
  comment?: string;
  description: string;
  usage?:
    | string
    | {
        title: string;
        content: string;
        example: string;
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
): Promise<LanguageFeauture | null> {
  let key = `./${language}/${feature.join('/')}.yaml`;
  if (!modules[key]) {
    key = `./${language}/${feature.join('/')}/index.yaml`;
  }
  const target = modules[key];
  if (!target) {
    return Promise.resolve(null);
  }
  return modules[key]().then(({ default: source }: any) => {
    const { example, usage, ...result } = yaml.parse(source);
    if (example && usage) {
      return {
        ...result,
        usage: example || usage,
      };
    }
    return {
      ...result,
      usage: usage || example,
    };
  });
}
