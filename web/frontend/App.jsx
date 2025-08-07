import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppProvider } from '@shopify/polaris';
import { Provider as AppBridgeProvider } from '@shopify/app-bridge-react';
import '@shopify/polaris/build/esm/styles.css';

import BadgeManager from './components/BadgeManager';
import TimerManager from './components/TimerManager';
import SettingsPage from './components/SettingsPage';
import Dashboard from './components/Dashboard';

const queryClient = new QueryClient();

const config = {
  apiKey: window.shopifyConfig?.apiKey || 'your-api-key',
  host: new URLSearchParams(window.location.search).get('host'),
  forceRedirect: true,
};

function App() {
  return (
    <AppBridgeProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <AppProvider i18n={{}}>
          <Router>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/badges" element={<BadgeManager />} />
              <Route path="/timers" element={<TimerManager />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </Router>
        </AppProvider>
      </QueryClientProvider>
    </AppBridgeProvider>
  );
}

export default App;