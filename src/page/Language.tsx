import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Feature, LanguageOutlineView } from '@/component';

function Language() {
  const location = useLocation();
  const navigate = useNavigate();
  const { pathname } = location;
  const [index, language] = useMemo(() => {
    const index = pathname.substring(1);
    return [index, index.split('/')[0]];
  }, [pathname]);
  return (
    <div className="pl-[250px]">
      <div className="fixed top-0 left-0 bottom-0 w-[250px] py-1 border-r border-neutral-100 overflow-y-auto">
        <LanguageOutlineView
          language={language}
          selected={index}
          onNavigate={(newIndex) => {
            navigate(`/${newIndex}`);
          }}
        />
      </div>
      <Feature index={index} />
    </div>
  );
}

export default Language;
