import React from 'react';
import { User, Sparkles } from 'lucide-react';
import Markdown from 'react-markdown';

export default function ChatMessage({ msg }) {
    const isUser = msg.sender === 'user';

    return (
        <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
            <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border shadow-sm ${isUser
                        ? 'bg-gradient-to-br from-slate-100 to-white border-slate-200'
                        : 'bg-gradient-to-br from-rose-100 to-amber-100 border-rose-200'
                    }`}
            >
                {isUser ? <User size={14} className="text-slate-600" /> : <span className="text-lg" role="img" aria-label="lunita">🍉</span>}
            </div>

            <div className={`flex flex-col max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
                <div
                    className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm leading-relaxed relative ${isUser
                            ? 'bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-tr-sm'
                            : 'bg-white border border-slate-100 text-slate-700 rounded-tl-sm'
                        }`}
                >
                    {/* Markdown Rendering for Bot Messages */}
                    {!isUser ? (
                        <div className="prose prose-sm prose-p:my-1 prose-a:text-rose-600 prose-strong:text-slate-900 max-w-none">
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
                </div>

                <span className="text-[10px] text-slate-400 mt-1 px-1">
                    {msg.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
            </div>
        </div>
    );
}
