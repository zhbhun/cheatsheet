import { Link } from '@nextui-org/react';
import { useNavigate } from 'react-router-dom';
import { languages } from '@/language';

function Home() {
  const navigate = useNavigate();
  return (
    <ul className="pl-8 py-4 list-disc">
      {languages.map((language) => (
        <li key={language.value} >
          <Link
            href={`/${language.value}`}
            showAnchorIcon
            onClick={(e) => {
              e.preventDefault();
              navigate(`/${language.value}`);
            }}
          >
            {language.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default Home;
