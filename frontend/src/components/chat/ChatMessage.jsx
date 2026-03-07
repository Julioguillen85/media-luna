import React from 'react';
import { User, Sparkles } from 'lucide-react';
import Markdown from 'react-markdown';

export default function ChatMessage({ msg }) {
    const isUser = msg.role === 'user';

    return (
        <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
            <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border shadow-sm ${isUser
                    ? 'bg-gradient-to-br from-slate-100 to-white dark:from-slate-700 dark:to-slate-800 border-slate-200 dark:border-slate-600'
                    : 'bg-gradient-to-br from-rose-100 to-amber-100 dark:from-rose-900/50 dark:to-amber-900/50 border-rose-200 dark:border-rose-800'
                    }`}
            >
                {isUser ? <User size={14} className="text-slate-600 dark:text-slate-300" /> : <span className="text-lg" role="img" aria-label="lunita">🍉</span>}
            </div>

            <div className={`flex flex-col max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
                <div
                    className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm leading-relaxed relative ${isUser
                        ? 'bg-gradient-to-r from-slate-800 to-slate-900 dark:from-indigo-600 dark:to-purple-700 text-white rounded-tr-sm'
                        : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-tl-sm'
                        }`}
                >
                    {/* Markdown Rendering for Bot Messages */}
                    {!isUser ? (
                        <div className="prose prose-sm prose-p:my-1 prose-a:text-rose-600 dark:prose-a:text-rose-400 prose-strong:text-slate-900 dark:prose-strong:text-white max-w-none dark:text-slate-200">
                            <Markdown>{msg.text}</Markdown>
                        </div>
                    ) : (
                        msg.text
                    )}

                    {/* Order Data Display (Simple view) */}
                    {msg.orderData && (
                        <div className="mt-2 pt-2 border-t border-slate-200/50 text-xs opacity-90">
                            <p><strong>Pedido:</strong> {msg.orderData.items} items</p>
                            <p><strong>Total aprox:</strong> ${msg.orderData.total}</p>
                        </div>
                    )}

                    {/* Mercado Pago Payment Link Button */}
                    {msg.paymentLink && (
                        <div className="mt-3">
                            <a
                                href={msg.paymentLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-2 bg-[#009ee3] hover:bg-[#0089c5] text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95 w-full"
                            >
                                💳 Pagar Anticipo ($500 MXN)
                            </a>
                        </div>
                    )}
                </div>

                <span className="text-[10px] text-slate-400 mt-1 px-1">
                    {msg.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
            </div>
        </div>
    );
}
