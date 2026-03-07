import React from 'react';
import Logger from '../utils/logger';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // Log the error using our unified logger
        Logger.error("Uncaught exception in component tree", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            // Custom fallback UI
            return (
                <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#fef2f2', borderRadius: '0.5rem', margin: '2rem' }}>
                    <h2 style={{ color: '#b91c1c', fontSize: '1.5rem', marginBottom: '1rem' }}>Oops! Algo salió mal.</h2>
                    <p style={{ color: '#7f1d1d', marginBottom: '1.5rem' }}>Hemos registrado el problema y nuestro equipo lo revisará pronto.</p>
                    <button
                        onClick={() => window.location.reload()}
                        style={{ padding: '0.75rem 1.5rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        Recargar Página
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
