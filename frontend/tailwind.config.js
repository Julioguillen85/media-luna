export default {
    darkMode: 'class',
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            animation: {
                'fade-in': 'fadeIn 0.3s ease-out',
                'shake': 'shake 2.5s ease-in-out infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                shake: {
                    '0%, 100%': { transform: 'rotate(0deg)' },
                    '5%, 15%, 25%': { transform: 'rotate(-15deg)' },
                    '10%, 20%, 30%': { transform: 'rotate(15deg)' },
                    '35%': { transform: 'rotate(0deg)' },
                },
            }
        }
    },
    plugins: []
}
