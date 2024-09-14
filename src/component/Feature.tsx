import { useEffect, useState } from 'react';
import { LanguageFeauture, loadLanguageFeature } from '@/language';
import FeatureContent from './FeatureContent';
import FeatureWrapper from './FeatureWrapper';

export interface FeatureProps {
  language: string;
  index: string;
  onSwitch?: (newIndex: string) => void;
}

export function Feature({ language, index, onSwitch }: FeatureProps) {
  const [feature, setFeature] = useState<LanguageFeauture | null>(null);
  useEffect(() => {
    const pathes = index.split('/');
    loadLanguageFeature(pathes[0], pathes.slice(1)).then((data) => {
      setFeature(data);
    });
  }, [index]);
  return (
    <FeatureWrapper language={language} feature={index} onSwitch={onSwitch}>
      {feature ? <FeatureContent feature={feature} /> : null}
    </FeatureWrapper>
  );
}

export default Feature;
