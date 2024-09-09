import { ReactNode, useEffect, useMemo, useState } from 'react';
import { Marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js';
import { LanguageFeauture, loadLanguageFeature } from '@/language';
import { Highlight } from '@/component';

const marked = new Marked(
  markedHighlight({
    langPrefix: '!bg-transparent hljs language-',
    highlight(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : 'plaintext';
      return hljs.highlight(code, { language }).value;
    },
  })
);

export interface FeatureProps {
  index: string;
}

export function Feature({ index }: FeatureProps) {
  const [feature, setFeature] = useState<LanguageFeauture | null>(null);
  useEffect(() => {
    const pathes = index.split('/');
    loadLanguageFeature(pathes[0], pathes.slice(1)).then((data) => {
      setFeature(data);
    });
  }, [index]);
  const example = useMemo(() => {
    if (!feature) {
      return '';
    }
    if (typeof feature.example === 'string') {
      return feature.example;
    }
    return (
      feature.example?.map((item) => ({
        title: item.title,
        content: marked.parse(item.content),
      })) ?? []
    );
  }, [feature]);
  let content: ReactNode = null;
  if (feature) {
    content = (
      <>
        <h1 className="mb-3 pt-2 text-2xl font-semibold">{feature.title}</h1>
        <div className="mb-6">{feature.description}</div>
        {typeof example === 'string' ? (
          <Highlight lang="kotlin" code={example as any} />
        ) : (
          <ul>
            {(
              example as {
                title: string;
                content: string;
              }[]
            ).map((example, index) => (
              <li key={index} className="mb-4">
                <h2 className="mb-2 font-medium">{example.title}</h2>
                <div
                  className="h-fit text-small rounded-medium bg-default/40 text-default-foreground w-full max-w-full overflow-x-auto"
                  dangerouslySetInnerHTML={{ __html: example.content }}
                />
              </li>
            ))}
          </ul>
        )}
      </>
    );
  }
  return <div className="mx-auto max-w-screen-md p-4">{content}</div>;
}

export default Feature;
