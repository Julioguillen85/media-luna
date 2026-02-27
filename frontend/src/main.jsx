import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <AuthProvider>
            <NotificationProvider>
                <ThemeProvider>
                    <App />
                </ThemeProvider>
            </NotificationProvider>
        </AuthProvider>
    </React.StrictMode>,
)
