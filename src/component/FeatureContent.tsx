import { ReactNode, useMemo } from 'react';
import { Link } from '@nextui-org/react';
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
  const { references } = feature;
  const description = useMemo(() => {
    return marked.parse(feature.description || '') as string;
  }, [feature]);
  const usage = useMemo(() => {
    if (!feature) {
      return '';
    }
    if (typeof feature.usage === 'string') {
      return feature.usage;
    }
    return (
      feature.usage?.map((item) => ({
        title: item.title,
        content: item.content ? marked.parse(item.content) : '',
        example: item.example ? marked.parse(item.example) : '',
      })) ?? []
    );
  }, [feature]);
  let content: ReactNode = null;
  if (feature) {
    content = (
      <>
        <h1 className="mb-6 pt-2 text-3xl font-semibold">{feature.title}</h1>
        <div
          className="mb-8"
          dangerouslySetInnerHTML={{ __html: description }}
        />
        {typeof usage === 'string' ? (
          <Highlight lang="kotlin" code={usage as any} />
        ) : (
          <div>
            {(
              usage as {
                title: string;
                content: string;
                example: string;
              }[]
            ).map((item, index) => (
              <div key={index} className="mb-8">
                <h2 className="mb-2 text-lg font-medium">{item.title}</h2>
                <div
                  className="markdown mb-4"
                  dangerouslySetInnerHTML={{ __html: item.content }}
                />
                <div
                  className="markdown mb-4"
                  dangerouslySetInnerHTML={{ __html: item.example }}
                />
              </div>
            ))}
            {references && references.length > 0 ? (
              <div className="mb-8">
                <h2 className="mb-2 text-lg font-medium">参考文档</h2>
                <ul className="pl-6 list-disc">
                  {references.map((item, index) => (
                    <li key={index}>
                      <Link className="leading-8" href={item.url}>{item.title}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        )}
      </>
    );
  }
  return <div className="mx-auto max-w-screen-md p-4 pt-12">{content}</div>;
}

export default FeatureContent;
