import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';
import Logger from './utils/logger';

// Global error handlers for uncaught exceptions outside of React lifecycle
window.addEventListener('error', (event) => {
    Logger.error('Global uncaught error:', event.error);
});
window.addEventListener('unhandledrejection', (event) => {
    Logger.error('Unhandled promise rejection:', event.reason);
});

Logger.info('Media Luna Frontend Application Initialized 🚀');

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ErrorBoundary>
            <AuthProvider>
                <NotificationProvider>
                    <ThemeProvider>
                        <App />
                    </ThemeProvider>
                </NotificationProvider>
            </AuthProvider>
        </ErrorBoundary>
    </React.StrictMode>,
)
