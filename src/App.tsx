import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { PresetProvider } from '@/component';
import Layout from '@/page/index';
import Home from '@/page/Home';
import Language from '@/page/Language';
import { languages } from './store';

function App() {
  return (
    <PresetProvider>
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
    </PresetProvider>
  );
}

export default App;
