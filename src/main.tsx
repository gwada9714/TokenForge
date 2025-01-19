import '@rainbow-me/rainbowkit/styles.css';
import { Buffer } from 'buffer';
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { BrowserRouter } from 'react-router-dom'
import Providers from './providers/Providers'
import './styles/index.css'
import { routerFutureConfig } from './config/routerConfig'

// Polyfill pour Buffer
if (typeof window !== 'undefined') {
  window.Buffer = window.Buffer || Buffer;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter future={routerFutureConfig}>
      <Providers>
        <App />
      </Providers>
    </BrowserRouter>
  </React.StrictMode>
)