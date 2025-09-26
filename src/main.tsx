import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app';
import { LanguageProvider } from './i18n/LanguageProvider';
import { ThemeProvider } from './i18n/ThemeProvider';
import './index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <LanguageProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </LanguageProvider>
  </React.StrictMode>,
);
