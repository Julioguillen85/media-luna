import React, { useState, useEffect, useRef } from 'react';
import { X, Bot, Send, CheckCircle } from 'lucide-react';
import {
    normalize,
    detectIntent,
    getRandomResponse,
    RESPONSES,
    validators
} from './lunitaUtils';

const SIZE_LABELS = { quarter: "Bowl 1/4", half: "Bowl 1/2" };
const CUSTOMIZABLE_IDS = [6];

export default function EnhancedChatBot({ isOpen, setIsOpen, products, options, cart, onAddProducts, onAutoFillCheckout }) {
    const [messages, setMessages] = useState([{
        role: 'bot',
        text: getRandomResponse(RESPONSES.greeting)
    }]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [botState, setBotState] = useState('IDLE');
    const [currentBowl, setCurrentBowl] = useState({});
    const [customerData, setCustomerData] = useState({
        name: '',
        phone: '',
        peopleCount: '',
        eventLocation: '',
        date: '',
        time: ''
    });
    const messagesEndRef = useRef(null);
    const [useAI, setUseAI] = useState(true); // Toggle para activar/desactivar IA

    useEffect(() => {
        if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isOpen]);

    // ============================================
    // GEMINI AI INTEGRATION
    // ============================================
    const callGeminiBackend = async (userMessage) => {
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage,
                    context: messages.map(m => ({
                        role: m.role === 'bot' ? 'assistant' : m.role,
                        content: m.text
                    })),
                    businessContext: {
                        products: products.map(p => ({
                            id: p.id,
                            name: p.name,
                            desc: p.desc,
                            category: p.category
                        })),
                        cartCount: cart.length,
                        currentState: botState
                    }
                })
            });

            if (!response.ok) {
                throw new Error('API request failed');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error calling Gemini backend:', error);
            // Fallback al sistema de reglas
            return null;
        }
    };

    // ============================================
    // PROCESS INPUT (HYBRID: AI + LOCAL LOGIC)
    // ============================================
    const processInput = async (text) => {
        const lower = text.toLowerCase();
        const normalized = normalize(text);

        // IMPORTANTE: Usar lógica local para estados críticos
        // (checkout y bowl building requieren validación estricta)
        if (botState.startsWith('ASK_') || botState === 'CONFIRM_ORDER' || botState === 'CHECKOUT_START') {
            return handleCheckoutFlow(text);
        }

        if (botState.startsWith('ASK_SIZE') || botState === 'ASK_BASE' || botState === 'ASK_COMPLEMENTS' || botState === 'ASK_TOPPINGS') {
            return handleBowlBuilder(text, normalized);
        }

        // Para conversación general, intentar usar IA primero
        if (useAI) {
            const aiResponse = await callGeminiBackend(text);

            if (aiResponse && aiResponse.message) {
                // Si la IA detecta que quiere personalizar un bowl
                if (aiResponse.action === 'start_bowl_builder') {
                    setBotState('ASK_SIZE');
                    return {
                        text: aiResponse.message + '\n\n¿Qué tamaño quieres? 🌙',
                        choices: [
                            { id: 'q', name: 'Bowl 1/4' },
                            { id: 'h', name: 'Bowl 1/2' }
                        ]
                    };
                }

                // Si la IA sugiere mostrar el menú
                if (aiResponse.action === 'show_menu') {
                    return {
                        text: aiResponse.message,
                        choices: products.slice(0, 6)
                    };
                }

                // Si la IA dice que agregó productos, detectar y agregar
                if (aiResponse.message.toLowerCase().includes('agregué') ||
                    aiResponse.message.toLowerCase().includes('agregado') ||
                    aiResponse.message.toLowerCase().includes('ahora tienes')) {
                    // Buscar productos mencionados en la respuesta
                    const lowerMsg = aiResponse.message.toLowerCase();
                    const productsToAdd = products.filter(p => {
                        const lowerName = p.name.toLowerCase();
                        return lowerMsg.includes(lowerName) ||
                            (p.keywords && p.keywords.some(k => lowerMsg.includes(k.toLowerCase())));
                    });

                    // Agregar cada producto encontrado
                    if (productsToAdd.length > 0) {
                        productsToAdd.forEach(p => onAddProducts(p));
                    }
                }

                // Respuesta normal de la IA
                return { text: aiResponse.message };
            }
            // Si falla la IA, continuar con el sistema de reglas (fallback)
        }

        // FALLBACK: Detectar intención con sistema de reglas
        const intent = detectIntent(text, products);
        return handleIntent(intent, text);
    };

    // ============================================
    //  HANDLE INTENT
    // ============================================
    const handleIntent = (intent, text) => {
        if (typeof intent === 'string') {
            switch (intent) {
                case 'greeting':
                    return { text: getRandomResponse(RESPONSES.greeting) };

                case 'event_context':
                    return { text: getRandomResponse(RESPONSES.event_context) };

                case 'ask_recommendation':
                    return { text: getRandomResponse(RESPONSES.ask_recommendation) };

                case 'ask_price':
                    return { text: getRandomResponse(RESPONSES.ask_price) };

                case 'view_menu':
                    return { text: getRandomResponse(RESPONSES.view_menu) };

                case 'ask_delivery':
                    return { text: getRandomResponse(RESPONSES.ask_delivery) };

                case 'ask_time':
                    return { text: getRandomResponse(RESPONSES.ask_time) };

                case 'thanks':
                    return { text: getRandomResponse(RESPONSES.thanks) };

                case 'goodbye':
                    return {
                        text: getRandomResponse(RESPONSES.goodbye),
                        type: 'exit'
                    };

                case 'help':
                    return { text: getRandomResponse(RESPONSES.help) };

                default:
                    return { text: getRandomResponse(RESPONSES.unknown) };
            }
        }

        // Si es order_product
        if (intent.type === 'order_product' && intent.products) {
            const matched = intent.products;

            if (matched.length === 1) {
                const product = matched[0];
                if (CUSTOMIZABLE_IDS.includes(product.id)) {
                    setBotState('ASK_SIZE');
                    setProductToCustomize(product);
                    return {
                        text: `¡Órale! 🥔 Vamos a armar tus ${product.name}. ¿Qué tamaño prefieres?`,
                        choices: [
                            { id: 'q', name: 'Bowl 1/4' },
                            { id: 'h', name: 'Bowl 1/2' }
                        ]
                    };
                } else {
                    onAddProducts(product);
                    return {
                        text: `¡Listo! ✅ Agregué ${product.name} a tu lista. ¿Algo más que se te antoje?`
                    };
                }
            } else {
                return {
                    text: `Encontré varias opciones. ¿Cuál te late?`,
                    choices: matched.slice(0, 3)
                };
            }
        }

        return { text: getRandomResponse(RESPONSES.unknown) };
    };

    // ============================================
    // HANDLE BOWL BUILDER
    // ============================================
    const [productToCustomize, setProductToCustomize] = useState(null);

    const handleBowlBuilder = (text, normalized) => {
        if (text.includes("cancel")) {
            setBotState('IDLE');
            return {
                text: "Okay, cancelé el armado. ¿Quieres intentar con otro producto? 😊"
            };
        }

        return { text: "Por favor usa las opciones que te muestro en pantalla para armar tu pedido. 👆" };
    };

    const handleChoiceClick = (choice) => {
        if (choice.category) {
            // Es un producto
            if (CUSTOMIZABLE_IDS.includes(choice.id)) {
                setBotState('ASK_SIZE');
                setProductToCustomize(choice);
                setMessages(prev => [...prev,
                { role: 'user', text: choice.name },
                {
                    role: 'bot',
                    text: `¡Claro! Vamos a armar tus ${choice.name}. ¿Qué tamaño prefieres?`,
                    choices: [{ id: 'q', name: 'Bowl 1/4' }, { id: 'h', name: 'Bowl 1/2' }]
                }
                ]);
            } else {
                onAddProducts(choice);
                setMessages(prev => [...prev,
                { role: 'user', text: choice.name },
                { role: 'bot', text: `¡Listo! Agregué ${choice.name} a tu carrito. ¿Algo más? 😋` }
                ]);
            }
        } else if (choice.id === 'q' || choice.id === 'h') {
            // Selección de tamaño
            const size = choice.id === 'q' ? 'quarter' : 'half';
            setCurrentBowl({ ...currentBowl, size });
            setBotState('ASK_BASE');
            setMessages(prev => [...prev,
            { role: 'user', text: choice.name },
            {
                role: 'bot',
                text: `¡Perfecto! ${choice.name} anotado. 📝\n\nAhora selecciona tus 2 bases:`,
                selectionType: 'bases',
                options: options.bases,
                min: 2,
                max: 2
            }
            ]);
        } else if (choice.id === 'confirm') {
            // Confirmación de pedido
            onAutoFillCheckout(customerData);
            setBotState('IDLE');
            setMessages(prev => [...prev,
            { role: 'user', text: choice.name },
            { role: 'bot', text: "¡Listo! 🎉 Tu carrito está listo. Puedes revisarlo y cuando quieras regresar aquí o pedir el menú 😊\n\nSi necesitas algo más, solo escríbeme 💬" }
            ]);
            setTimeout(() => setIsOpen(false), 2000);
        } else if (choice.id === 'cancel') {
            // Cancelación
            setBotState('IDLE');
            setMessages(prev => [...prev,
            { role: 'user', text: choice.name },
            { role: 'bot', text: "Okay, cancelé. Tu pedido sigue en el carrito por si cambias de opinión 😊" }
            ]);
        }
    };

    const handleSelectionConfirm = (selected, type) => {
        if (type === 'bases') {
            setCurrentBowl(prev => ({ ...prev, bases: selected }));
            setBotState('ASK_COMPLEMENTS');
            setMessages(prev => [...prev,
            { role: 'user', text: `Bases: ${selected.join(', ')}` },
            {
                role: 'bot',
                text: '¡Van! 🔥 Ahora elige hasta 4 complementos (opcional):',
                selectionType: 'complements',
                options: options.complements,
                min: 0,
                max: 4
            }
            ]);
        } else if (type === 'complements') {
            setCurrentBowl(prev => ({ ...prev, complements: selected }));
            setBotState('ASK_TOPPINGS');
            setMessages(prev => [...prev,
            { role: 'user', text: `Complementos: ${selected.join(', ')}` },
            {
                role: 'bot',
                text: '¡Listos! 👌 Por último, elige hasta 6 toppings dulces (opcional):',
                selectionType: 'toppings',
                options: options.toppings,
                min: 0,
                max: 6
            }
            ]);
        } else if (type === 'toppings') {
            const finalBowl = { ...currentBowl, toppings: selected };
            onAddProducts(productToCustomize, finalBowl);
            setBotState('IDLE');
            setMessages(prev => [...prev,
            { role: 'user', text: `Toppings: ${selected.join(', ')}` },
            { role: 'bot', text: '¡Listo, listo! 🎉 Tu bowl está en el carrito. ¿Algo más o sería todo?' }
            ]);
        }
    };

    // ============================================
    // CHECKOUT FLOW
    // ============================================
    const handleCheckoutFlow = (text) => {
        const lower = text.toLowerCase();

        // Permitir cancelar
        if (lower.match(/cancel|olvida|no quiero/i)) {
            setBotState('IDLE');
            return {
                text: "Okay, cancelé el proceso. Tu pedido sigue en el carrito por si cambias de opinión 😊"
            };
        }

        switch (botState) {
            case 'CHECKOUT_START':
                setBotState('ASK_PEOPLE_COUNT');
                return {
                    text: "¡Perfecto! 🎉 Para cotizar tu pedido necesito algunos datos.\n\nPrimero: ¿Para cuántas personas es? 👥"
                };

            case 'ASK_PEOPLE_COUNT':
                const peopleCount = validators.peopleCount(text);
                if (peopleCount) {
                    setCustomerData(prev => ({ ...prev, peopleCount: peopleCount.toString() }));
                    setBotState('ASK_NAME');
                    return {
                        text: `¡Perfecto! ${peopleCount} personas anotadas. 📝\n\n¿Cuál es tu nombre? 😊`
                    };
                }
                return {
                    text: "Mmm, no entendí bien el número 😅 ¿Me puedes decir solo cuántas personas? Ej: 30"
                };

            case 'ASK_NAME':
                const name = validators.name(text);
                if (name) {
                    setCustomerData(prev => ({ ...prev, name }));
                    setBotState('ASK_PHONE');
                    return {
                        text: `¡Mucho gusto, ${name}! 👋\n\n¿A qué número de WhatsApp te contactamos? 📱`
                    };
                }
                return {
                    text: "¿Me das tu nombre completo? 😊"
                };

            case 'ASK_PHONE':
                const phone = validators.phone(text);
                if (phone) {
                    setCustomerData(prev => ({ ...prev, phone }));
                    setBotState('ASK_LOCATION');
                    const formatted = `${phone.slice(0, 3)}-${phone.slice(3, 6)}-${phone.slice(6)}`;
                    return {
                        text: `Anotado: ${formatted} ✅\n\n¿En qué parte de Manzanillo será el evento? 📍\n(Ejemplo: Colonia Jardines, Salahua, etc.)`
                    };
                }
                return {
                    text: "El número no se ve bien 😅 Debe ser de 10 dígitos. Ejemplo: 312 123 4567"
                };

            case 'ASK_LOCATION':
                const location = validators.location(text);
                if (location) {
                    setCustomerData(prev => ({ ...prev, eventLocation: location }));
                    setBotState('ASK_DATE');
                    return {
                        text: `Perfecto, ${location} 📝\n\n¿Para qué día es el evento? 📅\n(Puedes decir: hoy, mañana, o la fecha como "15 de febrero")`
                    };
                }
                return {
                    text: "¿Me das un poco más de detalle del lugar? 😊"
                };

            case 'ASK_DATE':
                const date = validators.date(text);
                if (date) {
                    setCustomerData(prev => ({ ...prev, date }));
                    setBotState('ASK_TIME');
                    // Parsear fecha manualmente para evitar conversión UTC
                    // date viene como "2026-02-18"
                    const [year, month, day] = date.split('-').map(Number);
                    const dateObj = new Date(year, month - 1, day); // month - 1 porque Date usa 0-indexed months
                    const formatted = dateObj.toLocaleDateString('es-MX', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                    });
                    return {
                        text: `Anotado para el ${formatted} ✅\n\n¿A qué hora lo necesitas? 🕐\n(Horario disponible: 2 PM a 8 PM)`
                    };
                }
                return {
                    text: "Esa fecha no la entendí bien 😅 ¿Me la das así? Ejemplo: 15 de febrero, o mañana"
                };

            case 'ASK_TIME':
                const time = validators.time(text);
                if (time) {
                    const finalData = { ...customerData, time };
                    setCustomerData(finalData);
                    setBotState('CONFIRM_ORDER');

                    const summary = createOrderSummary(finalData, cart);

                    return {
                        text: summary,
                        choices: [
                            { id: 'confirm', name: '✅ Sí, confirmar pedido' },
                            { id: 'cancel', name: '❌ Cancelar' }
                        ]
                    };
                }
                return {
                    text: "Esa hora no está en nuestro horario 😅 Solo trabajamos de 2 PM a 8 PM. ¿Qué hora te viene bien?"
                };

            case 'CONFIRM_ORDER':
                if (text === '✅ Sí, confirmar pedido' || lower.match(/s[ií]|confirmo|dale|va/i)) {
                    onAutoFillCheckout(customerData);
                    setBotState('IDLE');
                    return {
                        text: "¡Listo! 🎉 Tu carrito está listo. Puedes revisarlo y cuando quieras regresar aquí o pedir el menú 😊\n\nSi necesitas algo más, solo escríbeme 💬",
                        action: 'close'
                    };
                }

                if (text === '❌ Cancelar') {
                    setBotState('IDLE');
                    return {
                        text: "Okay, cancelé. Tu pedido sigue en el carrito por si cambias de opinión 😊"
                    };
                }
                break;
        }

        return { text: "No entendí 😅" };
    };

    const createOrderSummary = (data, cart) => {
        const itemsText = cart.map(item => {
            // Usar el nombre del producto, con fallback al producto completo
            const productName = item.name || item.product?.name || 'Producto';
            let text = `• ${productName}`;
            if (item.customization) {
                const size = item.customization.size === 'quarter' ? '1/4' : '1/2';
                text += ` (Bowl ${size})`;
            }
            return text;
        }).join('\n');

        const [year, month, day] = data.date.split('-').map(Number);
        const dateObj = new Date(year, month - 1, day);
        const formattedDate = dateObj.toLocaleDateString('es-MX', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        const timeObj = data.time.split(':');
        const hour12 = parseInt(timeObj[0]) > 12 ? parseInt(timeObj[0]) - 12 : timeObj[0];
        const period = parseInt(timeObj[0]) >= 12 ? 'PM' : 'AM';

        return `¡Listo! 🎉 Aquí está toda tu información:

📋 RESUMEN DE PEDIDO
━━━━━━━━━━━━━━━━━
👤 Nombre: ${data.name}
📱 WhatsApp: ${data.phone.slice(0, 3)}-${data.phone.slice(3, 6)}-${data.phone.slice(6)}
👥 Personas: ${data.peopleCount}
📍 Lugar: ${data.eventLocation}
📅 Fecha: ${formattedDate}
🕐 Hora: ${hour12}:00 ${period}

🛒 PRODUCTOS (${cart.length}):
${itemsText}

¿Todo correcto? ✅`;
    };

    // ============================================
    // UI HANDLERS
    // ============================================
    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userText = input;
        setMessages(prev => [...prev, { role: 'user', text: userText }]);
        setInput('');
        setIsTyping(true);

        setTimeout(async () => {
            const response = await processInput(userText);
            setIsTyping(false);

            if (response.type === 'exit') {
                setMessages(prev => [...prev, { role: 'bot', text: response.text }]);
            } else if (response.action === 'close') {
                setMessages(prev => [...prev, { role: 'bot', text: response.text }]);
                setTimeout(() => setIsOpen(false), 2000);
            } else {
                const msg = { role: 'bot', text: response.text };
                if (response.choices) msg.choices = response.choices;
                if (response.selectionType) {
                    msg.selectionType = response.selectionType;
                    msg.options = response.options;
                    msg.min = response.min;
                    msg.max = response.max;
                }
                setMessages(prev => [...prev, msg]);
            }
        }, 600);
    };

    const startCheckout = () => {
        setBotState('CHECKOUT_START');
        setMessages(prev => [...prev,
        { role: 'user', text: 'Finalizar pedido' },
        { role: 'bot', text: '¡Perfecto! 🎉 Para cotizar tu pedido necesito algunos datos. ¿Listo? 😊' }
        ]);

        // Trigger primer paso
        setTimeout(() => {
            setBotState('ASK_PEOPLE_COUNT');
            setMessages(prev => [...prev,
            { role: 'bot', text: 'Primero: ¿Para cuántas personas es? 👥' }
            ]);
        }, 800);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed bottom-6 right-6 w-full max-w-sm glass-panel rounded-3xl z-50 flex flex-col overflow-hidden h-[500px] animate-fade-in border border-white/70 shadow-[0_20px_70px_rgba(0,0,0,0.15)]">
            <div className="bg-gradient-to-r from-slate-900 via-rose-600 to-amber-400 p-4 text-white flex justify-between items-center shadow-md">
                <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm"><Bot size={22} /></div>
                    <div>
                        <h3 className="font-bold text-base">Lunita IA 🌙</h3>
                        <span className="text-xs text-rose-100 flex items-center gap-1 opacity-90">
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_5px_#4ade80]"></span>
                            En línea
                        </span>
                    </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1.5 rounded-full transition-colors"><X size={20} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white/60 scroll-smooth">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm shadow-sm whitespace-pre-wrap ${msg.role === 'user' ? 'bg-slate-900 text-white rounded-br-sm' : 'bg-white/90 text-slate-800 rounded-bl-sm border border-white/70'}`}>{msg.text}</div>
                        {msg.choices && (
                            <div className="mt-2 flex flex-wrap gap-2">
                                {msg.choices.map(c => (
                                    <button
                                        key={c.id}
                                        onClick={() => handleChoiceClick(c)}
                                        className="text-xs bg-rose-100 text-rose-700 px-3 py-1 rounded-full hover:bg-rose-200 border border-rose-200 shadow-sm"
                                    >
                                        {c.name}
                                    </button>
                                ))}
                            </div>
                        )}
                        {msg.selectionType && (
                            <div className="mt-2 bg-white p-3 rounded-xl border border-gray-200 shadow-sm w-full">
                                <IngredientSelector
                                    options={msg.options}
                                    min={msg.min}
                                    max={msg.max}
                                    onConfirm={(selected) => handleSelectionConfirm(selected, msg.selectionType)}
                                />
                            </div>
                        )}
                    </div>
                ))}
                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-white/90 p-4 rounded-2xl rounded-bl-sm shadow-sm border border-white/70 flex gap-1.5 items-center">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Botón Finalizar Pedido */}
            {cart.length > 0 && botState === 'IDLE' && (
                <div className="p-3 bg-rose-50 border-t border-rose-100">
                    <button
                        onClick={startCheckout}
                        className="w-full bg-rose-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-rose-600 transition-colors shadow-lg"
                    >
                        <CheckCircle size={20} />
                        Finalizar mi pedido ({cart.length} items)
                    </button>
                </div>
            )}

            <form onSubmit={handleSend} className="p-3 bg-white/80 border-t border-white/70 flex gap-2 items-center">
                <input
                    autoFocus
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Escribe aquí..."
                    className="flex-1 bg-white rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all border border-slate-100 shadow-inner"
                />
                <button
                    type="submit"
                    className="bg-slate-900 text-white p-3 rounded-full hover:bg-rose-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg active:scale-95"
                    disabled={!input.trim()}
                >
                    <Send size={18} />
                </button>
            </form>
        </div>
    );
}

function IngredientSelector({ options, min, max, onConfirm }) {
    const [selected, setSelected] = useState([]);

    const toggle = (opt) => {
        if (selected.includes(opt)) {
            setSelected(selected.filter(i => i !== opt));
        } else {
            if (selected.length < max) {
                setSelected([...selected, opt]);
            }
        }
    };

    return (
        <div className="text-left">
            <p className="text-[10px] text-gray-400 mb-1">Selecciona entre {min} y {max}:</p>
            <div className="max-h-40 overflow-y-auto grid grid-cols-2 gap-1 mb-2">
                {options.map(opt => (
                    <button
                        key={opt}
                        onClick={() => toggle(opt)}
                        disabled={!selected.includes(opt) && selected.length >= max}
                        className={`text-[10px] p-1.5 rounded border text-left truncate ${selected.includes(opt)
                            ? 'bg-rose-500 text-white border-rose-500'
                            : 'bg-gray-50 text-gray-600 border-gray-100 disabled:opacity-50'
                            }`}
                    >
                        {opt}
                    </button>
                ))}
            </div>
            <button
                onClick={() => onConfirm(selected)}
                disabled={selected.length < min}
                className="w-full bg-green-500 text-white text-xs py-2 rounded font-bold hover:bg-green-600 disabled:bg-gray-300"
            >
                Confirmar ({selected.length})
            </button>
        </div>
    );
}
