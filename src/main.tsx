import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import 'mingcute_icon/font/Mingcute.css'
import './index.css';
import App from './App';

const shouldEnableMocking = import.meta.env.DEV && import.meta.env.VITE_ENABLE_MSW === 'true';

async function enableMocking() {
  if (!shouldEnableMocking) {
    return;
  }

  const { startMockWorker } = await import('./mocks/browser');
  await startMockWorker();
}

async function bootstrap() {
  if (shouldEnableMocking) {
    await enableMocking();
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <HelmetProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </HelmetProvider>
    </StrictMode>,
  );
}

bootstrap();
