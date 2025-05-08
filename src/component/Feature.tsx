import { useEffect, useState } from 'react';
import { LanguageFeauture, loadLanguageFeature } from '@/language';
import FeatureContent from './FeatureContent';
import FeatureWrapper from './FeatureWrapper';

export interface FeatureProps {
  comparer?: string;
  language: string;
  index: string;
  sidebarEnable?: boolean;
  onSwitch?: (newIndex: string) => void;
  onClose?: () => void;
}

export function Feature({
  comparer,
  language,
  index,
  onSwitch,
  onClose,
}: FeatureProps) {
  const [feature, setFeature] = useState<LanguageFeauture | null>(null);
  useEffect(() => {
    if (!comparer && language && feature) {
      document.scrollingElement?.scrollTo(0, 0);
    }
  }, [comparer, language, feature]);
  useEffect(() => {
    const pathes = index.split('/');
    loadLanguageFeature(pathes[0], pathes.slice(1)).then((data) => {
      setFeature(data);
    });
  }, [index]);
  return (
    <FeatureWrapper
      comparer={comparer}
      language={language}
      feature={index}
      onSwitch={onSwitch}
      onClose={onClose}
    >
      {feature ? (
        <FeatureContent
          language={language}
          feature={feature}
          showOutline={!comparer}
        />
      ) : null}
    </FeatureWrapper>
  );
}

export default Feature;
