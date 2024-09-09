import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { languages } from '@/language';
import Layout from '@/page/index';
import Home from '@/page/Home';
import Language from '@/page/Language';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          {languages.map((route) => (
            <Route
              key={route.value}
              path={`/${route.value}/*`}
              element={<Language />}
            />
          ))}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
