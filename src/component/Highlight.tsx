import { useEffect, useRef } from 'react';
import { Snippet } from '@nextui-org/react';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';

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
      if (mounted) {
        hljs.highlightElement(codeEle);
      }
    }
    return () => {
      mounted = false;
    };
  }, [lang, code]);
  return (
    <Snippet
      className="w-full max-w-full p-0 overflow-x-auto"
      symbol=""
      hideCopyButton
    >
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
    </Snippet>
  );
}
