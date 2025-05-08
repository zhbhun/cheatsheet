import clsx from 'clsx';
import {
  ReactNode,
  createElement,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
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
  index = '',
  level,
  usage,
}: {
  index?: string;
  level: number;
  usage: LanguageFeautureUsage;
}) {
  const { title, description, example, children } = usage;
  return (
    <div className="mb-8">
      {createElement(
        `h${level}`,
        {
          id: encodeURIComponent(title),
          className: 'text-lg font-medium',
          'data-index': index,
        },
        title
      )}
      {description ? (
        <div
          className="mb-4"
          dangerouslySetInnerHTML={{ __html: description }}
        />
      ) : null}
      {example ? (
        <div className="mb-4" dangerouslySetInnerHTML={{ __html: example }} />
      ) : null}
      {children && children.length > 0 ? (
        <div>
          {children.map((item, childIndex) => (
            <FeatureUsage
              key={childIndex}
              index={`${index ? `${index}_` : ''}${childIndex}`}
              level={level + 1}
              usage={item}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function FeatureMenu({
  parent = '',
  active,
  usages,
}: {
  parent?: string;
  active: string;
  usages: LanguageFeautureUsage[];
}) {
  return (
    <ul className="pl-2">
      {usages.map((usage, index) => {
        const usageIndex = `${parent ? `${parent}_` : ''}${index}`;
        return (
          <li
            key={index}
            className="m-2"
            data-index={usageIndex}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const target = document.getElementById(
                encodeURIComponent(usage.title)
              );
              const scrollingElement = document.scrollingElement;
              if (target && scrollingElement) {
                target.scrollIntoView({ behavior: 'smooth' });
                const offsetTop =
                  scrollingElement.scrollTop +
                  target.getBoundingClientRect().top;
                scrollingElement.scrollTo({
                  top: Math.max(offsetTop - 60, 0),
                  behavior: 'smooth',
                });
              }
            }}
          >
            <a
              className={clsx('text-neutral-600 hover:text-blue-600', {
                'text-blue-600': active === usageIndex,
              })}
              href={`#${encodeURIComponent(usage.title)}`}
            >
              {usage.title}
            </a>
            {usage.children && usage.children.length > 0 ? (
              <FeatureMenu
                parent={usageIndex}
                active={active}
                usages={usage.children}
              />
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

function FeatureOutline({ feature }: { feature: LanguageFeauture }) {
  const { usage } = feature;
  const container = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState('');
  useEffect(() => {
    const containerElement = container.current?.parentElement;
    const scrollingElement = document.scrollingElement;
    if (!scrollingElement || !containerElement) {
      return;
    }
    const process = () => {
      const elements = Array.from(
        containerElement.querySelectorAll('h2, h3, h4, h5, h6')
      ) as HTMLElement[];
      for (let index = elements.length - 1; index >= 0; index--) {
        const element = elements[index];
        const elementOffsetTop =
          scrollingElement.scrollTop + element.getBoundingClientRect().top;
        if (elementOffsetTop - scrollingElement.scrollTop < 300) {
          setActive(element.dataset.index || '');
          break;
        }
      }
    };
    process();
    window.addEventListener('scroll', process);
    return () => {
      window.removeEventListener('scroll', process);
    };
  }, []);
  if (!usage || typeof usage === 'string') {
    return null;
  }
  return (
    <div ref={container} className="flex-0 basic-0 max-w-0 pl-4">
      <div className="sticky top-10 w-[300px] max-h-[calc(100vh-40px)] py-2 border-l border-[#dadde1] text-sm overflow-y-auto">
        <FeatureMenu active={active} usages={usage} />
      </div>
    </div>
  );
}

export interface FeatureContentProps {
  feature: LanguageFeauture;
  showOutline?: boolean;
}

export function FeatureContent({
  feature,
  showOutline = true,
}: FeatureContentProps) {
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
      <div className="flex">
        <div className="flex-1 w-full markdown-body">
          <h1 className="mb-6 pt-2 text-3xl font-semibold">{feature.title}</h1>
          <div
            className="mb-8"
            dangerouslySetInnerHTML={{ __html: description }}
          />
          {typeof usage === 'string' ? (
            <div className="mb-8">
              <Highlight lang="kotlin" code={usage as any} />
            </div>
          ) : (
            <div>
              {usage.map((usage, index) => (
                <FeatureUsage
                  key={index}
                  index={String(index)}
                  level={2}
                  usage={usage}
                />
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
        </div>
        {showOutline ? <FeatureOutline feature={feature} /> : null}
      </div>
    );
  }
  return <div className="mx-auto max-w-screen-lg p-4 pt-12">{content}</div>;
}

export default FeatureContent;
