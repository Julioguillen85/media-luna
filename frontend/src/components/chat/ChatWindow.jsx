import React, { useState, useEffect, useRef } from 'react';
import { X, Bot, CheckCircle } from 'lucide-react';
import {
    normalize,
    detectIntent,
    getRandomResponse,
    RESPONSES,
    validators
} from '../../lunitaUtils';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import IngredientSelector from './IngredientSelector';

const CUSTOMIZABLE_IDS = [6];

export default function ChatWindow({ isOpen, onClose, products, options, cart, onAddProducts, onAutoFillCheckout }) {
    const [messages, setMessages] = useState([{
        role: 'bot',
        text: getRandomResponse(RESPONSES.greeting)
    }]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [botState, setBotState] = useState('IDLE');
    const [currentBowl, setCurrentBowl] = useState({});
    const [customerData, setCustomerData] = useState({
        name: '', phone: '', peopleCount: '', eventLocation: '', date: '', time: ''
    });
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const [useAI, setUseAI] = useState(true);

    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
            // Focus input when opened
            setTimeout(() => inputRef.current?.focus(), 100);
        }
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
                            id: p.id, name: p.name, desc: p.desc, category: p.category
                        })),
                        cartCount: cart.length,
                        currentState: botState
                    }
                })
            });

            if (!response.ok) throw new Error('API request failed');
            return await response.json();
        } catch (error) {
            console.error('Error calling Gemini backend:', error);
            return null;
        }
    };

    // ============================================
    // PROCESS INPUT
    // ============================================
    const processInput = async (text) => {
        const lower = text.toLowerCase();
        const normalized = normalize(text);

        if (botState.startsWith('ASK_') || botState === 'CONFIRM_ORDER' || botState === 'CHECKOUT_START') {
            return handleCheckoutFlow(text);
        }

        if (botState.startsWith('ASK_SIZE') || botState === 'ASK_BASE' || botState === 'ASK_COMPLEMENTS' || botState === 'ASK_TOPPINGS') {
            return handleBowlBuilder(text, normalized);
        }

        if (useAI) {
            const aiResponse = await callGeminiBackend(text);
            if (aiResponse && aiResponse.message) {
                if (aiResponse.action === 'start_bowl_builder') {
                    setBotState('ASK_SIZE');
                    return {
                        text: aiResponse.message + '\n\n¿Qué tamaño quieres? 🌙',
                        choices: [{ id: 'q', name: 'Bowl 1/4' }, { id: 'h', name: 'Bowl 1/2' }]
                    };
                }
                if (aiResponse.action === 'show_menu') {
                    return { text: aiResponse.message, choices: products.slice(0, 6) };
                }
                if (aiResponse.message.toLowerCase().includes('agregué') || aiResponse.message.toLowerCase().includes('agregado')) {
                    const lowerMsg = aiResponse.message.toLowerCase();
                    const productsToAdd = products.filter(p => {
                        const lowerName = p.name.toLowerCase();
                        return lowerMsg.includes(lowerName) || (p.keywords && p.keywords.some(k => lowerMsg.includes(k.toLowerCase())));
                    });
                    if (productsToAdd.length > 0) productsToAdd.forEach(p => onAddProducts(p));
                }
                return { text: aiResponse.message };
            }
        }

        const intent = detectIntent(text, products);
        return handleIntent(intent, text);
    };

    const handleIntent = (intent, text) => {
        if (typeof intent === 'string') {
            switch (intent) {
                case 'goodbye': return { text: getRandomResponse(RESPONSES.goodbye), type: 'exit' };
                case 'greeting': return { text: getRandomResponse(RESPONSES.greeting) };
                default:
                    // Simple mapping for other intents based on lunitaUtils responses, or just generic
                    const responseKey = intent;
                    if (RESPONSES[responseKey]) return { text: getRandomResponse(RESPONSES[responseKey]) };
                    return { text: getRandomResponse(RESPONSES.unknown) };
            }
        }

        if (intent.type === 'order_product' && intent.products) {
            const matched = intent.products;
            if (matched.length === 1) {
                const product = matched[0];
                if (CUSTOMIZABLE_IDS.includes(product.id)) {
                    setBotState('ASK_SIZE');
                    setProductToCustomize(product);
                    return {
                        text: `¡Órale! 🥔 Vamos a armar tus ${product.name}. ¿Qué tamaño prefieres?`,
                        choices: [{ id: 'q', name: 'Bowl 1/4' }, { id: 'h', name: 'Bowl 1/2' }]
                    };
                } else {
                    onAddProducts(product);
                    return { text: `¡Listo! ✅ Agregué ${product.name} a tu lista. ¿Algo más que se te antoje?` };
                }
            } else {
                return { text: `Encontré varias opciones. ¿Cuál te late?`, choices: matched.slice(0, 3) };
            }
        }
        return { text: getRandomResponse(RESPONSES.unknown) };
    };

    // ============================================
    // BOWL BUILDER LOGIC
    // ============================================
    const [productToCustomize, setProductToCustomize] = useState(null);

    const handleBowlBuilder = (text) => {
        if (text.includes("cancel")) {
            setBotState('IDLE');
            return { text: "Okay, cancelé el armado. ¿Quieres intentar con otro producto? 😊" };
        }
        return { text: "Por favor usa las opciones que te muestro en pantalla para armar tu pedido. 👆" };
    };

    const handleChoiceClick = (choice) => {
        if (choice.category) { // Product click
            if (CUSTOMIZABLE_IDS.includes(choice.id)) {
                setBotState('ASK_SIZE');
                setProductToCustomize(choice);
                setMessages(prev => [...prev, { role: 'user', text: choice.name }, { role: 'bot', text: `¡Claro! Vamos a armar tus ${choice.name}. ¿Qué tamaño prefieres?`, choices: [{ id: 'q', name: 'Bowl 1/4' }, { id: 'h', name: 'Bowl 1/2' }] }]);
            } else {
                onAddProducts(choice);
                setMessages(prev => [...prev, { role: 'user', text: choice.name }, { role: 'bot', text: `¡Listo! Agregué ${choice.name} a tu carrito. ¿Algo más? 😋` }]);
            }
        } else if (choice.id === 'q' || choice.id === 'h') { // Size selection
            const size = choice.id === 'q' ? 'quarter' : 'half';
            setCurrentBowl({ ...currentBowl, size });
            setBotState('ASK_BASE');
            setMessages(prev => [...prev, { role: 'user', text: choice.name }, { role: 'bot', text: `¡Perfecto! ${choice.name} anotado. 📝\n\nAhora selecciona tus 2 bases:`, selectionType: 'bases', options: options.bases, min: 2, max: 2 }]);
        } else if (choice.id === 'confirm') { // Checkout confirm
            onAutoFillCheckout(customerData);
            setBotState('IDLE');
            setMessages(prev => [...prev, { role: 'user', text: choice.name }, { role: 'bot', text: "¡Listo! 🎉 Tu carrito está listo. Puedes revisarlo y cuando quieras regresar aquí o pedir el menú 😊" }]);
            setTimeout(onClose, 2000);
        } else if (choice.id === 'cancel') {
            setBotState('IDLE');
            setMessages(prev => [...prev, { role: 'user', text: choice.name }, { role: 'bot', text: "Okay, cancelé. Tu pedido sigue en el carrito." }]);
        }
    };

    const handleSelectionConfirm = (selected, type) => {
        if (type === 'bases') {
            setCurrentBowl(prev => ({ ...prev, bases: selected }));
            setBotState('ASK_COMPLEMENTS');
            setMessages(prev => [...prev, { role: 'user', text: `Bases: ${selected.join(', ')}` }, { role: 'bot', text: '¡Van! 🔥 Ahora elige hasta 4 complementos (opcional):', selectionType: 'complements', options: options.complements, min: 0, max: 4 }]);
        } else if (type === 'complements') {
            setCurrentBowl(prev => ({ ...prev, complements: selected }));
            setBotState('ASK_TOPPINGS');
            setMessages(prev => [...prev, { role: 'user', text: `Complementos: ${selected.join(', ')}` }, { role: 'bot', text: '¡Listos! 👌 Por último, elige hasta 6 toppings dulces (opcional):', selectionType: 'toppings', options: options.toppings, min: 0, max: 6 }]);
        } else if (type === 'toppings') {
            const finalBowl = { ...currentBowl, toppings: selected };
            onAddProducts(productToCustomize, finalBowl);
            setBotState('IDLE');
            setMessages(prev => [...prev, { role: 'user', text: `Toppings: ${selected.join(', ')}` }, { role: 'bot', text: '¡Listo, listo! 🎉 Tu bowl está en el carrito.' }]);
        }
    };

    // ============================================
    // CHECKOUT LOGIC
    // ============================================
    const startCheckout = () => {
        setBotState('CHECKOUT_START');
        setMessages(prev => [...prev, { role: 'user', text: 'Finalizar pedido' }, { role: 'bot', text: '¡Perfecto! 🎉 Para cotizar tu pedido necesito algunos datos.' }]);
        setTimeout(() => {
            setBotState('ASK_PEOPLE_COUNT');
            setMessages(prev => [...prev, { role: 'bot', text: 'Primero: ¿Para cuántas personas es? 👥' }]);
        }, 800);
    };

    const handleCheckoutFlow = (text) => {
        if (text.toLowerCase().match(/cancel|olvida/i)) {
            setBotState('IDLE');
            return { text: "Okay, cancelé el proceso." };
        }

        switch (botState) {
            case 'CHECKOUT_START': setBotState('ASK_PEOPLE_COUNT'); return { text: "¿Para cuántas personas es? 👥" };
            case 'ASK_PEOPLE_COUNT':
                const peopleCount = validators.peopleCount(text);
                if (peopleCount) {
                    setCustomerData(prev => ({ ...prev, peopleCount: peopleCount.toString() }));
                    setBotState('ASK_NAME');
                    return { text: `¡Perfecto! ${peopleCount} personas. ¿Cuál es tu nombre? 😊` };
                }
                return { text: "No entendí bien el número 😅" };
            case 'ASK_NAME':
                const name = validators.name(text);
                if (name) {
                    setCustomerData(prev => ({ ...prev, name }));
                    setBotState('ASK_PHONE');
                    return { text: `¡Hola ${name}! ¿A qué número de WhatsApp te contactamos? 📱` };
                }
                return { text: "¿Me das tu nombre completo?" };
            case 'ASK_PHONE':
                const phone = validators.phone(text);
                if (phone) {
                    setCustomerData(prev => ({ ...prev, phone }));
                    setBotState('ASK_LOCATION');
                    return { text: `Anotado ${phone}. ¿Dónde será el evento? 📍` };
                }
                return { text: "El número debe ser de 10 dígitos." };
            case 'ASK_LOCATION':
                const location = validators.location(text);
                if (location) {
                    setCustomerData(prev => ({ ...prev, eventLocation: location }));
                    setBotState('ASK_DATE');
                    return { text: `Super, ${location}. ¿Qué día es el evento? 📅` };
                }
                return { text: "Necesito un poco más de detalle del lugar." };
            case 'ASK_DATE':
                const date = validators.date(text);
                if (date) {
                    setCustomerData(prev => ({ ...prev, date }));
                    setBotState('ASK_TIME');
                    return { text: `Anotado. ¿A qué hora? (2 PM - 8 PM) 🕐` };
                }
                return { text: "No entendí la fecha. Intenta 'mañana' o '15 de febrero'." };
            case 'ASK_TIME':
                const time = validators.time(text);
                if (time) {
                    const finalData = { ...customerData, time };
                    setCustomerData(finalData);
                    setBotState('CONFIRM_ORDER');
                    return { text: createOrderSummary(finalData, cart), choices: [{ id: 'confirm', name: '✅ Confirmar' }, { id: 'cancel', name: '❌ Cancelar' }] };
                }
                return { text: "Solo trabajamos de 2 PM a 8 PM." };
            case 'CONFIRM_ORDER':
                if (text.includes('Confirmar') || text.match(/s[ií]|ok/i)) {
                    onAutoFillCheckout(customerData);
                    setBotState('IDLE');
                    setTimeout(onClose, 2000);
                    return { text: "¡Pedido confirmado! 🎉 Revisando carrito...", action: 'close' };
                } else if (text.includes('Cancelar')) {
                    setBotState('IDLE');
                    return { text: "Cancelado." };
                }
                break;
        }
        return { text: "No entendí 😅" };
    };

    const createOrderSummary = (data, cart) => {
        return `Resumen:\n${data.name} (${data.phone})\n${data.peopleCount} personas\n${data.date} a las ${data.time}\n\n${cart.length} productos.\n\n¿Confirmar?`;
    };

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
                setTimeout(onClose, 2000);
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

    if (!isOpen) return null;

    return (
        <div className="fixed bottom-6 right-6 w-full max-w-sm glass-panel rounded-3xl z-50 flex flex-col overflow-hidden h-[500px] animate-fade-in border border-white/70 shadow-[0_20px_70px_rgba(0,0,0,0.15)]">
            {/* Header */}
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
                <button onClick={onClose} className="hover:bg-white/20 p-1.5 rounded-full transition-colors"><X size={20} /></button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white/60 scroll-smooth">
                {messages.map((msg, i) => (
                    <div key={i}>
                        <ChatMessage msg={msg} />
                        {msg.choices && (
                            <div className="mt-2 flex flex-wrap gap-2 justify-end">
                                {msg.choices.map(c => (
                                    <button key={c.id} onClick={() => handleChoiceClick(c)} className="text-xs bg-rose-100 text-rose-700 px-3 py-1 rounded-full hover:bg-rose-200 border border-rose-200 shadow-sm">
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
                {isTyping && <div className="text-xs text-slate-400 italic ml-10">Escribiendo...</div>}
                <div ref={messagesEndRef} />
            </div>

            {/* Checkout Button */}
            {cart.length > 0 && botState === 'IDLE' && (
                <div className="p-3 bg-rose-50 border-t border-rose-100">
                    <button onClick={startCheckout} className="w-full bg-rose-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-rose-600 transition-colors shadow-lg">
                        <CheckCircle size={20} /> Finalizar pedido ({cart.length})
                    </button>
                </div>
            )}

            {/* Input */}
            <ChatInput
                input={input}
                setInput={setInput}
                handleSend={handleSend}
                isLoading={isTyping}
                inputRef={inputRef}
            />
        </div>
    );
}
