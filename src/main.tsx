import { createRoot } from 'react-dom/client';
import { NextUIProvider } from '@nextui-org/react';
import './style/index.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <NextUIProvider>
    <App />
  </NextUIProvider>
);
