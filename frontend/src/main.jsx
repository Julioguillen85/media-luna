import React from 'react';
import ReactDOM from 'react-dom/client';
import * as Sentry from '@sentry/react';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext';
import { PWAProvider } from './context/PWAContext';
import ErrorBoundary from './components/ErrorBoundary';

// Initialize Sentry (does nothing if DSN is empty)
Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN || '',
    environment: import.meta.env.MODE || 'development',
    integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration()
    ],
    tracesSampleRate: 0.3,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1.0, // Graba replay cuando hay error
    enabled: !!import.meta.env.VITE_SENTRY_DSN
});

console.info('Media Luna Frontend Application Initialized 🚀');

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <Sentry.ErrorBoundary fallback={<ErrorBoundary />}>
            <AuthProvider>
                <PWAProvider>
                    <NotificationProvider>
                        <ThemeProvider>
                            <App />
                        </ThemeProvider>
                    </NotificationProvider>
                </PWAProvider>
            </AuthProvider>
        </Sentry.ErrorBoundary>
    </React.StrictMode>,
);