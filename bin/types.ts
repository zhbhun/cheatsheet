export interface LanguageData {
  id: string;
  title: string;
  documents: string[];
  ignores: string[];
}

export interface Reference {
  title: string;
  url: string;
  content: string;
  rate: number;
}

export interface Feature {
  id: string;
  title: string;
  query?: string;
  comment?: string;
  description?: string;
  usage?: {
    title: string;
    description: string;
    example: string;
  }[];
  references?: {
    title: string;
    url: string;
  }[];
  children?: string[];
}
