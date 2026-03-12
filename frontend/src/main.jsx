import React from 'react';
import ReactDOM from 'react-dom/client';
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext';
import { PWAProvider } from './context/PWAContext';
import ErrorBoundary from './components/ErrorBoundary';

Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN || '',
    environment: import.meta.env.MODE || 'development',
    integrations: [new BrowserTracing()],
    tracesSampleRate: 0.3,
    enabled: !!import.meta.env.VITE_SENTRY_DSN
});

window.Sentry = Sentry;
console.log('SENTRY DSN:', import.meta.env.VITE_SENTRY_DSN || 'NO DSN');
console.log('SENTRY MODE:', import.meta.env.MODE);

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