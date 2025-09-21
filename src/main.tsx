import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

async function enableApiMocking() {
  if (process.env.NODE_ENV === 'development') {
    const { worker } = await import('./api/__mocks__/browser');
    await worker.start({ onUnhandledRequest: 'bypass' });
  }
}

enableApiMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
});
