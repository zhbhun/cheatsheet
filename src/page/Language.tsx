import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Feature } from '@/component';

function Language() {
  const location = useLocation();
  const navigate = useNavigate();
  const { pathname } = location;
  const [index, language] = useMemo(() => {
    const index = pathname.substring(1);
    return [index, index.split('/')[0]];
  }, [pathname]);
  return (
    <Feature
      language={language}
      index={index}
      onSwitch={(newIndex) => {
        navigate(`/${newIndex}`);
      }}
    />
  );
}

export default Language;
