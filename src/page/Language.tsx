import { ReactNode, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { LanguageFeauture, loadLanguageFeature } from '@/data';
import { Highlight } from '@/component';

function Language() {
  const location = useLocation();
  const { pathname } = location;
  const [feature, setFeature] = useState<LanguageFeauture | null>(null);
  useEffect(() => {
    const pathes = pathname.split('/');
    loadLanguageFeature(pathes[1], pathes.slice(2)).then((data) => {
      setFeature(data);
    });
  }, [pathname]);
  let content: ReactNode = null;
  if (feature) {
    content = (
      <div>
        <h1 className="mb-3 text-2xl">{feature.title}</h1>
        <div className="mb-5 text-neutral-600">{feature.description}</div>
        {typeof feature.example === 'string' ? (
          <Highlight lang="kotlin" code={feature.example as any} />
        ) : (
          <ul>
            {(
              feature.example as {
                title: string;
                content: string;
              }[]
            ).map((example, index) => (
              <li key={index} className="mb-4">
                <div className="mb-2 text-neutral-600">{example.title}</div>
                <Highlight lang="kotlin" code={example.content} />
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }
  return <div className="mx-auto max-w-screen-lg p-4">{content}</div>;
}

export default Language;
