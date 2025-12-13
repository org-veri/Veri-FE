import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';
import { mockTokens } from './data';

export const worker = setupWorker(...handlers);

export async function startMockWorker() {
  await worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: {
      url: '/mockServiceWorker.js',
    },
  });

  if (typeof window === 'undefined') {
    return;
  }

  const access = localStorage.getItem('accessToken');
  const refresh = localStorage.getItem('refreshToken');
  if (!access) {
    localStorage.setItem('accessToken', mockTokens.accessToken);
  }
  if (!refresh) {
    localStorage.setItem('refreshToken', mockTokens.refreshToken);
  }
}
