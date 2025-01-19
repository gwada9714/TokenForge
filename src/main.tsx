// Polyfills
import { Buffer } from 'buffer';
if (typeof window !== 'undefined') {
  window.Buffer = Buffer;
}

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import Providers from './providers/Providers';
import { routerFutureConfig } from './config/routerConfig';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter future={routerFutureConfig}>
      <Providers>
        <App />
      </Providers>
    </BrowserRouter>
  </React.StrictMode>
);