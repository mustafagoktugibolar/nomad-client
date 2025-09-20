import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.js';
import ErrorBoundary from './components/ErrorBoundary.js';

const rootElement = document.getElementById('root') as HTMLElement;

createRoot(rootElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
