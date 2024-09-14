import { ReactNode, useMemo } from 'react';
import { Marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js';
import { LanguageFeauture } from '@/language';
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

export interface FeatureContentProps {
  feature: LanguageFeauture;
}

export function FeatureContent({ feature }: FeatureContentProps) {
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
        <h1 className="mb-6 pt-2 text-3xl font-semibold">{feature.title}</h1>
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
  return <div className="mx-auto max-w-screen-md p-4 pt-12">{content}</div>;
}

export default FeatureContent;
