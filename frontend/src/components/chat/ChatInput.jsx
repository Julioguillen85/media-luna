import React from 'react';
import { Send, Loader2 } from 'lucide-react';

export default function ChatInput({ input, setInput, handleSend, isLoading, inputRef }) {
    return (
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
            <form onSubmit={handleSend} className="relative flex items-center gap-2">
                <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Escribe tu mensaje..."
                    className="w-full pl-4 pr-12 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="absolute right-2 p-2 bg-gradient-to-r from-rose-500 to-amber-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-rose-500/30 transition-all transform active:scale-95"
                >
                    {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                </button>

                {/* Typing indicator could be placed here if separate from message list */}
            </form>
            <div className="text-center mt-2">
                <span className="text-[10px] text-slate-400">Lunita IA puede cometer errores. Verifica la info importante.</span>
            </div>
        </div>
    );
}
