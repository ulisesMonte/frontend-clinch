import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './lib/auth';
import { queryClient } from './lib/queryClient';
import {
  hydrateStorefrontFromSession,
  storefrontQueryOptions,
} from './lib/storefront';
import App from './App';
import './styles.css';

// Instant paint from last visit, then refresh in background if stale.
hydrateStorefrontFromSession();
void queryClient.prefetchQuery(storefrontQueryOptions());

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
