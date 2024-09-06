import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  }
];

export interface PresetState {
  language: string;
  references: string[];
}

export interface PresetStore extends PresetState {
  setLanguages: (language: string, references: string[]) => void;
}

export const usePresetStore = create(
  persist<PresetStore>(
    (set) => ({
      language: '',
      references: [],
      setLanguages: (language, references) => {
        set({ language, references });
      },
    }),
    {
      name: 'preset',
    }
  )
);
