import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

const worker = setupWorker(...handlers);

export const setupMockServer = async () => {
  await worker.start({ serviceWorker: { url: '/mockServiceWorker.js' } });
  console.info('[MSW] Mock API worker started');
};
