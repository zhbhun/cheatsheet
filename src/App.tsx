import { useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import * as yaml from 'yaml';
import { PresetProvider } from '@/component';
import Layout from '@/page/index';
import Home from '@/page/Home';

function App() {
  useEffect(() => {
    import('@/data/typescript/index.yaml?raw').then(({ default: content }) => {
      console.log(content);
      console.log(yaml.parse(content));
    });
  }, []);

  return (
    <PresetProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </PresetProvider>
  );
}

export default App;
