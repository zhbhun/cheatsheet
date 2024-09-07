import { useEffect, useRef } from 'react';
import { Snippet } from '@nextui-org/react';
import hljs from 'highlight.js/lib/core';
import 'highlight.js/styles/github.css';

console.log(hljs);

const languages: Record<string, () => Promise<any>> = {
  kotlin: () => import('highlight.js/lib/languages/kotlin'),
  swift: () => import('highlight.js/lib/languages/swift'),
  typescript: () => import('highlight.js/lib/languages/typescript'),
};

const isLanguageReady = (lang: string) =>
  hljs.listLanguages().indexOf(lang) >= 0;

const ensureLanguageReady = (lang: string, callback: () => void) => {
  if (!isLanguageReady(lang)) {
    languages[lang]().then(({ default: data }) => {
      if (hljs.listLanguages().indexOf(lang) === -1) {
        hljs.registerLanguage(lang, data);
      }
      callback();
    });
  } else {
    callback();
  }
};

export interface HighlightProps {
  lang: string;
  code: string;
}

export function Highlight({ lang, code }: HighlightProps) {
  const codeRef = useRef<HTMLElement>(null);
  useEffect(() => {
    let mounted = true;
    const { current: codeEle } = codeRef;
    if (codeEle) {
      ensureLanguageReady(lang, () => {
        if (mounted) {
          hljs.highlightElement(codeEle);
        }
      });
    }
    return () => {
      mounted = false;
    };
  }, [lang, code]);
  return (
    <Snippet
      className="w-full max-w-full p-4 overflow-x-auto"
      symbol=""
      hideCopyButton
    >
      <pre key={`${lang}-${code}`}>
        <code
          ref={codeRef}
          className={lang}
          style={{
            padding: 0,
            backgroundColor: 'transparent',
          }}
        >
          {code}
        </code>
      </pre>
    </Snippet>
  );
}
