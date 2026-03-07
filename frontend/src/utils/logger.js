/**
 * A centralized logging utility.
 * In the future, this can be integrated with external services like Sentry.
 */
const Logger = {
    info: (message, ...data) => {
        console.log(`[INFO] ${message}`, ...data);
    },
    warn: (message, ...data) => {
        console.warn(`[WARN] ${message}`, ...data);
    },
    error: (message, error, ...data) => {
        console.error(`[ERROR] ${message}`, error, ...data);
        // Optional: Send to external monitoring service here (e.g., Sentry)
    }
};

export default Logger;
