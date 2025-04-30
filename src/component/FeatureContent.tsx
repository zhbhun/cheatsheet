import { ReactNode, createElement, useMemo } from 'react';
import { Link } from '@nextui-org/react';
import { Marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js';
import { LanguageFeauture, LanguageFeautureUsage } from '@/language';
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

function parseUsage(usage: LanguageFeautureUsage): LanguageFeautureUsage {
  return {
    title: usage.title,
    description: usage.description
      ? (marked.parse(usage.description) as string)
      : '',
    example: usage.example ? (marked.parse(usage.example) as string) : '',
    children: usage.children
      ? usage.children.map((item) => parseUsage(item))
      : [],
  };
}

function FeatureUsage({
  level,
  usage,
}: {
  level: number;
  usage: LanguageFeautureUsage;
}) {
  const { title, description, example, children } = usage;
  return (
    <div className="mb-8">
      {createElement(
        `h${level}`,
        {
          className: 'mb-2 text-lg font-medium',
        },
        title
      )}
      {description ? (
        <div
          className="markdown mb-4"
          dangerouslySetInnerHTML={{ __html: description }}
        />
      ) : null}
      {example ? (
        <div
          className="markdown mb-4"
          dangerouslySetInnerHTML={{ __html: example }}
        />
      ) : null}
      {children && children.length > 0 ? (
        <div>
          {children.map((item, index) => (
            <FeatureUsage key={index} level={level + 1} usage={item} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

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
      return [];
    }
    if (typeof feature.usage === 'string') {
      return feature.usage;
    }
    return feature.usage?.map(parseUsage) ?? [];
  }, [feature]);
  let content: ReactNode = null;
  if (feature) {
    content = (
      <>
        <h1 className="mb-6 pt-2 text-3xl font-semibold">{feature.title}</h1>
        <div
          className="markdown mb-8"
          dangerouslySetInnerHTML={{ __html: description }}
        />
        {typeof usage === 'string' ? (
          <div className="mb-8">
            <Highlight lang="kotlin" code={usage as any} />
          </div>
        ) : (
          <div>
            {usage.map((usage, index) => (
              <FeatureUsage key={index} level={2} usage={usage} />
            ))}
          </div>
        )}
        {references && references.length > 0 ? (
          <div className="mb-8">
            <h2 className="mb-2 text-lg font-medium">参考文档</h2>
            <ul className="pl-6 list-disc">
              {references.map((item, index) => (
                <li key={index}>
                  <Link className="leading-8" href={item.url}>
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </>
    );
  }
  return <div className="mx-auto max-w-screen-md p-4 pt-12">{content}</div>;
}

export default FeatureContent;
