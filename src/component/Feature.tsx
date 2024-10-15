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
      {feature ? <FeatureContent feature={feature} /> : null}
    </FeatureWrapper>
  );
}

export default Feature;
