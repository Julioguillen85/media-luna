import React, { useState, useEffect, useRef } from 'react';
import { X, Bot, CheckCircle, FileText } from 'lucide-react';
import {
    normalize,
    detectIntent,
    getRandomResponse,
    RESPONSES,
    validators,
    isDiscountActive
} from '../../lunitaUtils';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import IngredientSelector from './IngredientSelector';
import MenuCheckboxPanel from './MenuCheckboxPanel';

const BUSINESS_PHONE = '523123099318';

import { isCustomizable, isTray } from '../../App';

// Function isToday removed; discount applies to all same-day bookings

export default function ChatWindow({ isOpen, onClose, products, options, cart, onAddProducts, onSetQuantity, onAutoFillCheckout }) {
    const [messages, setMessages] = useState([{
        role: 'bot',
        text: getRandomResponse(RESPONSES.greeting)
    }]);
    const [quoteModal, setQuoteModal] = useState({
        open: false,
        product: null,
        peopleCount: '',
        date: '',
        splitMode: false,
        splitValue: 0,
        error: ''
    });
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [botState, setBotState] = useState('IDLE');
    const [currentBowl, setCurrentBowl] = useState({});
    const [customerData, setCustomerData] = useState({
        name: '', phone: '', email: '', peopleCount: '', eventLocation: '', date: '', time: ''
    });

    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const cartRef = useRef(cart);
    useEffect(() => { cartRef.current = cart; }, [cart]);
    const [useAI, setUseAI] = useState(true);
    const [orderSubmitted, setOrderSubmitted] = useState(false);

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
                    context: messages.slice(-30).map(m => ({
                        role: m.role === 'bot' ? 'assistant' : m.role,
                        content: m.text || ''
                    })),
                    businessContext: {
                        products: products.map(p => ({
                            id: p.id,
                            name: p.name,
                            desc: p.description,
                            category: p.category,
                            price: p.price,
                            rentalPricePerDay: p.rentalPricePerDay,  // ← Agregar esto
                            productType: p.productType,               // ← Y esto para que Lunita sepa si es renta
                            priceTiers: p.priceTiers,
                            quarterPriceTiers: p.quarterPriceTiers
                        })),
                        cart: cart.map(item => ({
                            name: item.name,
                            quantity: item.quantity || 1
                        })),
                        cartCount: cart.length,
                        currentState: botState,
                        eventPeopleCount: customerData.peopleCount || null

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

        const normalized = normalize(text);

        if (botState.startsWith('ASK_') || botState === 'CONFIRM_ORDER' || botState === 'CHECKOUT_START') {
            return handleCheckoutFlow(text);
        }

        if (botState === 'ASK_BASE' || botState === 'ASK_COMPLEMENTS' || botState === 'ASK_TOPPINGS' || botState === 'ASK_SIZE') {
            const isNewProductRequest = /tablon|mesa|brincolin|silla|crepaleta|tostiloco|elote|charola|brincolin/i.test(text);
            if (isNewProductRequest) {
                setBotState('IDLE'); // reset y dejar que el AI maneje
            } else {
                return handleBowlBuilder(text, normalized);
            }
        }

        if (useAI) {
            const aiResponse = await callGeminiBackend(text);
            if (aiResponse && aiResponse.message) {
                const rawMessage = aiResponse.message;

                // ── STEP 0: Extract ORDER_COMPLETE parameterized ──
                const orderCompleteMatch = /\|\|ORDER_COMPLETE:(.*?)\|\|/.exec(rawMessage);
                let orderCompleteData = null;
                if (orderCompleteMatch) {
                    const parts = orderCompleteMatch[1].split('|');
                    if (parts.length >= 6) {
                        orderCompleteData = {
                            name: parts[0],
                            phone: parts[1],
                            email: parts[2], // Email added based on prompt!
                            eventLocation: parts[3],
                            date: parts[4],
                            time: parts[5]
                        };
                    }
                }

                // ── STEP 1: Always strip ALL command markers from the text first ──
                let displayMessage = rawMessage
                    .replace(/\|\|ORDER_COMPLETE.*?\|\|/g, '')
                    .replace(/\|\|SET_QTY:\d+:.+?\|\|/g, '')
                    .replace(/\|\|ADD:\d+:.+?\|\|/g, '')
                    .replace(/\|\|REMOVE:.+?\|\|/g, '')
                    .replace(/\|\|PEOPLE:\d+\|\|/g, '')
                    .replace(/\|\|BOWL_SIZE:(quarter|half)\|\|/g, '')
                    .trim();

                if (!displayMessage) {
                    displayMessage = "¡Entendido! Aquí tienes tu pedido completo. 😊";
                }

                // (STEP 2 MOVED DOWN TO ENSURE CART UPDATES ARE EXECUTED)

                // ── STEP 2b: Extract and store people count if AI detected it ──
                const peopleMatch = /\|\|PEOPLE:(\d+)\|\|/.exec(rawMessage);
                if (peopleMatch) {
                    setCustomerData(prev => ({ ...prev, peopleCount: peopleMatch[1] }));
                }

                // ── PREPARE: Simulated cart to pass to backend immediately ──
                let simulatedCart = [...cart];

                // ── STEP 3: Execute REMOVE commands ──
                const removeRegex = /\|\|REMOVE:(.+?)\|\|/g;
                let removeMatch;
                while ((removeMatch = removeRegex.exec(rawMessage)) !== null) {
                    const productName = removeMatch[1].trim();
                    const productToRemove = products.find(p =>
                        p.name.toLowerCase().includes(productName.toLowerCase()) ||
                        productName.toLowerCase().includes(p.name.toLowerCase())
                    );
                    if (productToRemove && onSetQuantity) {
                        onSetQuantity(productToRemove, 0); // qty=0 triggers removal in App.jsx
                        simulatedCart = simulatedCart.filter(item => item.id !== productToRemove.id);
                    }
                }

                // ── PREPARATION: Variable to store intercepted customizable products ──
                let interceptedCustomizable = null;
                let preSelectedBowlSize = null;

                // ── STEP 3b: Extract BOWL_SIZE ──
                const bowlSizeMatch = /\|\|BOWL_SIZE:(quarter|half)\|\|/.exec(rawMessage); // ← FALTA ESTA LÍNEA
                const papasEnCarrito = cart.some(i => i.name?.toLowerCase().includes('papas preparadas'));
                const hasBowlSize = !papasEnCarrito && /\|\|BOWL_SIZE:(quarter|half)\|\|/.test(rawMessage);

                if (bowlSizeMatch && !papasEnCarrito) {
                    preSelectedBowlSize = bowlSizeMatch[1];
                }

                // ── STEP 4: Execute SET_QTY commands (Absolute Update) ──
                // ── STEP 4: Execute SET_QTY commands (Absolute Update) ──
                const setQtyRegex = /\|\|SET_QTY:(\d+):([^|:]+)(?::(\d+(?:\.\d+)?))?\|\|/g;
                let setMatch;

                // ── GUARD: bloquear SET_QTY si el cliente no confirmó ──
                const lastBotMessage = messages.filter(m => m.role === 'bot').slice(-1)[0]?.text || '';

                const botAskedConfirmation = /agrego al carrito|lo agrego|agregarlo|confirmas|deseas agregar|añado|es correcto|¿correcto|correcto\?|le parece bien|así quedamos|proceder|procedemos|te parece|confirmamos|esta combinación|esta opcion/i.test(lastBotMessage);

                const isDirectRentalOrder = /agrega|ponme|dame|añade|quiero|necesito|me das|me pones/i.test(text) && /tablon|mesa|brincolin|silla/i.test(text);

                const isVariantSelection = (
                    /con mantel|con sillas|solos|solas|sin sillas/i.test(text) ||
                    /\b(sí|si|ándale|va|dale|claro|ok|sale)\b/i.test(text)
                ) && /tablon|mesa|brincolin|silla.*mantel|sillas.*precio/i.test(lastBotMessage);

                const userConfirmed = /\b(un|uno|una|dos|tres|cuatro|cinco|sí|si|ándale|andale|va|dale|agr[eé]galo|claro|ok|okay|perfecto|adelante|ponlo|sale|así|listo)\b/i.test(text.trim());

                const isQuantitativeRequest = /\b\d+\b/.test(text.trim());

                const canExecuteSetQty = isDirectRentalOrder || hasBowlSize || (botAskedConfirmation && userConfirmed) || isQuantitativeRequest;

                while ((setMatch = setQtyRegex.exec(rawMessage)) !== null) {
                    const qty = parseInt(setMatch[1], 10);
                    const productName = setMatch[2].trim();
                    const priceOverride = setMatch[3] ? parseFloat(setMatch[3]) : null;

                    if (!canExecuteSetQty) {
                        console.warn('🚫 SET_QTY bloqueado — cliente no confirmó aún:', productName);
                        continue;
                    }

                    const normalizeName = (n) => n.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s]/g, "").replace(/e?s(?=\s|$)/gi, "").replace(/\s+/g, "");
                    const pNameSafe = normalizeName(productName);

                    // Priority 1: exact normalized match
                    let productToUpdate = products.find(p =>
                        normalizeName(p.name) === pNameSafe
                    );
                    // Priority 2: startsWith
                    if (!productToUpdate) {
                        productToUpdate = products.find(p =>
                            normalizeName(p.name).startsWith(pNameSafe) ||
                            pNameSafe.startsWith(normalizeName(p.name))
                        );
                    }
                    // Priority 3: includes
                    if (!productToUpdate) {
                        productToUpdate = products.find(p =>
                            normalizeName(p.name).includes(pNameSafe) ||
                            pNameSafe.includes(normalizeName(p.name))
                        );
                    }

                    if (productToUpdate) {
                        if (isCustomizable(productToUpdate) || isTray(productToUpdate)) {
                            interceptedCustomizable = { ...productToUpdate, quantity: qty, priceOverride: priceOverride };
                        } else if (onSetQuantity) {
                            onSetQuantity(productToUpdate, qty, null, priceOverride, productToUpdate.productType === 'RENTAL');
                            const existingIndex = simulatedCart.findIndex(item => item.id === productToUpdate.id);
                            if (existingIndex >= 0) {
                                if (qty > 0) simulatedCart[existingIndex] = { ...simulatedCart[existingIndex], quantity: qty, totalPrice: (priceOverride !== null ? priceOverride : (simulatedCart[existingIndex].rentalPricePerDay || simulatedCart[existingIndex].price) * qty) };
                                else simulatedCart.splice(existingIndex, 1);
                            } else if (qty > 0) {
                                simulatedCart.push({ ...productToUpdate, quantity: qty, isRental: productToUpdate.productType === 'RENTAL', totalPrice: (priceOverride !== null ? priceOverride : (productToUpdate.rentalPricePerDay || productToUpdate.price) * qty) });
                            }
                        }
                    }
                }

                // ── STEP 5: Execute Legacy ADD commands (Fallback) ──
                const commandRegex = /\|\|ADD:(\d+):(.+?)\|\|/g;
                let match;
                while ((match = commandRegex.exec(rawMessage)) !== null) {
                    const qty = parseInt(match[1], 10);
                    const productName = match[2].trim();

                    const productToAdd = products.find(p =>
                        normalize(p.name).includes(normalize(productName)) ||
                        normalize(productName).includes(normalize(p.name))
                    );

                    if (productToAdd) {
                        if (isCustomizable(productToAdd) || isTray(productToAdd)) {
                            // Intercept: Do not add to cart yet
                            interceptedCustomizable = { ...productToAdd, quantity: qty };
                        } else {
                            onAddProducts({
                                ...productToAdd,
                                quantity: qty,
                                isRental: productToAdd.productType === 'RENTAL',
                                totalPrice: (productToAdd.rentalPricePerDay || productToAdd.price) * qty
                            });
                            const existingIndex = simulatedCart.findIndex(item => item.id === productToAdd.id);
                            if (existingIndex >= 0) {
                                simulatedCart[existingIndex].quantity += qty;
                                simulatedCart[existingIndex].totalPrice += (productToAdd.rentalPricePerDay || productToAdd.price) * qty;
                            } else {
                                simulatedCart.push({ ...productToAdd, quantity: qty, isRental: productToAdd.productType === 'RENTAL', totalPrice: (productToAdd.rentalPricePerDay || productToAdd.price) * qty });
                            }
                        }
                    }
                }

                // ── STEP 6: Handle special UI actions ──
                // If a customizable product was intercepted, force the bowl builder flow
                if (interceptedCustomizable) {
                    setProductToCustomize(interceptedCustomizable);

                    let textResult = displayMessage;

                    if (isTray(interceptedCustomizable)) {
                        if (!textResult.toLowerCase().includes("personalizar")) {
                            textResult += `\n\n¡Genial! Vamos a personalizar tu ${interceptedCustomizable.name}.`;
                        }
                        setBotState('ASK_TRAY_BASE');
                        return {
                            text: textResult + '\n\nPrimero, selecciona tus 2 bases naturales:',
                            selectionType: 'bases',
                            options: options.bases,
                            min: 1,
                            max: 2
                        };
                    }

                    // If AI didn't include the armar phrases, append it safely
                    if (!textResult.toLowerCase().includes("vamos a armar") && !textResult.toLowerCase().includes("armar tus")) {
                        textResult += `\n\n¡Claro! Vamos a armar tus ${interceptedCustomizable.name}.`;
                    }

                    if (preSelectedBowlSize) {
                        setCurrentBowl({ ...currentBowl, size: preSelectedBowlSize });
                        setBotState('ASK_BASE');
                        return {
                            text: '¡Claro! Vamos a armar tus Papas Preparadas (Bowl).\n\nSelecciona tus 2 bases:',
                            selectionType: 'bases',
                            options: options.bases,
                            min: 2,
                            max: 2
                        };
                    } else {
                        setBotState('ASK_SIZE');
                        if (!textResult.toLowerCase().includes("tamaño")) {
                            textResult += ' ¿Qué tamaño prefieres? 🌙';
                        }
                        return {
                            text: textResult
                        };
                    }
                }

                // Normal bowl builder request without prior ADD/SET_QTY commands
                if (aiResponse.action === 'start_bowl_builder') {
                    // ── GUARD: solo activar bowl builder si el último mensaje del bot
                    // mencionaba papas/bowl, no cualquier otro producto ──
                    const lastBotText = messages.filter(m => m.role === 'bot').slice(-1)[0]?.text || '';
                    const wasTalkingAboutBowl = /papa|bowl|preparada/i.test(lastBotText);

                    if (wasTalkingAboutBowl) {
                        const bowlProduct = products.find(p => p.id === 6);
                        setProductToCustomize(bowlProduct);
                        setBotState('ASK_SIZE');
                        return {
                            text: displayMessage + '\n\n¿Qué tamaño quieres? 🌙'
                        };
                    }
                    // Si no era sobre papas, ignorar la acción y solo mostrar el mensaje
                    return { text: displayMessage };
                }

                if (aiResponse.action === 'start_tray_builder') {
                    const lastBotText = messages.filter(m => m.role === 'bot').slice(-1)[0]?.text || '';
                    if (/charola|snack/i.test(lastBotText)) {
                        const trayProduct = products.find(p => isTray(p)) || products.find(p => p.name.toLowerCase().includes('charola'));
                        setProductToCustomize(trayProduct);
                        setBotState('ASK_TRAY_BASE');
                        return {
                            text: displayMessage + '\n\nPrimero, selecciona tus 2 bases naturales:',
                            selectionType: 'bases',
                            options: options.bases,
                            min: 1,
                            max: 2
                        };
                    }
                    return { text: displayMessage };
                }

                // Quote request for bowl size
                if (aiResponse.action === 'ask_bowl_size_quote') {
                    return {
                        text: displayMessage
                    };
                }
                if (aiResponse.action === 'show_menu') {
                    const snacksAndDrinks = products.filter(
                        p => p.productType !== 'RENTAL'
                    );
                    return {
                        text: 'Te comparto nuestro menú por si quieres escoger algo y añadirlo al carrito. Si quieres la descripción o conocer algún producto antes de agregarlo, ¡pídeme y con gusto te lo describo! 🌙',
                        menuCheckbox: snacksAndDrinks
                    };
                }

                // ── STEP 2: Handle fully collected Order Complete ──
                if (orderCompleteData) {
                    const finalData = { ...customerData, ...orderCompleteData };
                    setCustomerData(finalData);
                    setBotState('IDLE');
                    // Delay para que React procese primero los SET_QTY anteriores
                    await new Promise(resolve => setTimeout(resolve, 100));
                    return {
                        text: displayMessage,
                        showOrderSummary: true
                    };
                }

                return { text: displayMessage };

            }
        }

        const intent = detectIntent(text, products);
        return handleIntent(intent, text);
    };

    const handleIntent = (intent, text) => {
        if (typeof intent === 'string') {
            switch (intent) {
                case 'goodbye':
                    if (cart.length > 0 && !orderSubmitted) {
                        return { text: getRandomResponse(RESPONSES.goodbye), showOrderSummary: true };
                    }
                    return { text: getRandomResponse(RESPONSES.goodbye), type: 'exit' };
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
                if (isCustomizable(product)) {
                    setBotState('ASK_SIZE');
                    setProductToCustomize(product);
                    return {
                        text: `¡Órale! 🥔 Vamos a armar tus ${product.name}. ¿Qué tamaño prefieres?`
                    };
                } else if (isTray(product)) {
                    setBotState('ASK_TRAY_BASE');
                    setProductToCustomize(product);
                    return {
                        text: `¡Genial! 🍉 Vamos a personalizar tu ${product.name}. Primero selecciona tus 2 bases naturales:`,
                        selectionType: 'bases',
                        options: options.bases,
                        min: 1,
                        max: 2
                    };
                } else {
                    const quantity = intent.quantity || 1;
                    onAddProducts({
                        ...product,
                        quantity,
                        isRental: product.productType === 'RENTAL',
                        totalPrice: (product.rentalPricePerDay || product.price) * quantity
                    });
                    const unitName = product.productType === 'RENTAL' ? (quantity > 1 ? 'unidades' : 'unidad') : '';
                    return { text: `¡Listo! ✅ Agregué ${quantity} ${product.name} a tu lista. ¿Algo más que se te antoje?` };
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
        return { text: "Por favor usa las opciones que te muestro en pantalla para armar tu pedido.👆" };
    };

    const handleChoiceClick = (choice) => {
        if (choice.category) { // Product click
            if (isCustomizable(choice)) {
                setBotState('ASK_SIZE');
                setProductToCustomize(choice);
                setMessages(prev => [...prev, { role: 'user', text: choice.name }, { role: 'bot', text: `¡Claro! Vamos a armar tus ${choice.name}. ¿Qué tamaño prefieres?` }]);
            } else if (isTray(choice)) {
                setBotState('ASK_TRAY_BASE');
                setProductToCustomize(choice);
                setMessages(prev => [...prev, { role: 'user', text: choice.name }, { role: 'bot', text: `¡Genial! Vamos a personalizar tu ${choice.name}. Primero selecciona tus 2 bases naturales:`, selectionType: 'bases', options: options.bases, min: 1, max: 2 }]);
            } else {
                handleSend({ preventDefault: () => { } }, `quiero ${choice.name}`);
            }
        } else if (choice.id === 'table_only') {
            handleSend({ preventDefault: () => { } }, "Solo el tablon");
        } else if (choice.id === 'table_package') {
            handleSend({ preventDefault: () => { } }, "En paquete con sillas");
        } else if (choice.id === 'sz_q_quote' || choice.id === 'sz_h_quote') { // Quote Size selection
            const text = choice.id === 'sz_q_quote' ? 'Bowl 1/4' : 'Bowl 1/2';
            handleSend({ preventDefault: () => { } }, text);
        } else if (choice.id === 'q' || choice.id === 'h') { // Size selection
            const size = choice.id === 'q' ? 'quarter' : 'half';
            setCurrentBowl({ ...currentBowl, size });
            setBotState('ASK_BASE');
            setMessages(prev => [...prev, { role: 'user', text: choice.name }, { role: 'bot', text: `¡Perfecto! ${choice.name} anotado. 📝\n\nAhora selecciona tus 2 bases:`, selectionType: 'bases', options: options.bases, min: 2, max: 2 }]);
        } else if (choice.id === 'confirm') { // Checkout confirm
            onAutoFillCheckout(customerData);
            submitOrderToBackend();
            setBotState('IDLE');
            setMessages(prev => [...prev, { role: 'user', text: choice.name }, { role: 'bot', text: "¡Listo! 🎉 Tu pedido ha sido registrado automáticamente. Puedes enviarnos los detalles por WhatsApp tocando el botón de abajo. 😊", whatsappCta: true }]);
        } else if (choice.id === 'cancel') {
            setBotState('IDLE');
            setMessages(prev => [...prev, { role: 'user', text: choice.name }, { role: 'bot', text: "Okay, cancelé. Tu pedido sigue en el carrito." }]);
        }
    };

    const handleSelectionConfirm = (selected, type) => {
        if (type === 'bases') {
            setCurrentBowl(prev => ({ ...prev, bases: selected }));
            if (botState === 'ASK_TRAY_BASE') {
                setBotState('ASK_TRAY_COMPLEMENTS');
                setMessages(prev => [...prev, { role: 'user', text: `Bases: ${selected.join(', ')}` }, { role: 'bot', text: '¡Van! 🔥 Ahora elige hasta 3 complementos (opcional):', selectionType: 'complements', options: options.complements, min: 0, max: 3 }]);
            } else {
                setBotState('ASK_COMPLEMENTS');
                setMessages(prev => [...prev, { role: 'user', text: `Bases: ${selected.join(', ')}` }, { role: 'bot', text: '¡Van! 🔥 Ahora elige hasta 4 complementos (opcional):', selectionType: 'complements', options: options.complements, min: 0, max: 4 }]);
            }
        } else if (type === 'complements') {
            setCurrentBowl(prev => ({ ...prev, complements: selected }));
            if (botState === 'ASK_TRAY_COMPLEMENTS') {
                setBotState('ASK_TRAY_TOPPINGS');
                setMessages(prev => [...prev, { role: 'user', text: `Complementos: ${selected.join(', ')}` }, { role: 'bot', text: '¡Listos! 👌 Por último, elige hasta 3 toppings dulces (opcional):', selectionType: 'toppings', options: options.toppings, min: 0, max: 3 }]);
            } else {
                setBotState('ASK_TOPPINGS');
                setMessages(prev => [...prev, { role: 'user', text: `Complementos: ${selected.join(', ')}` }, { role: 'bot', text: '¡Listos! 👌 Por último, elige hasta 6 toppings dulces (opcional):', selectionType: 'toppings', options: options.toppings, min: 0, max: 6 }]);
            }
        } else if (type === 'toppings') {
            const finalItem = { ...currentBowl, toppings: selected };
            onAddProducts(productToCustomize, finalItem);
            setBotState('IDLE');
            setMessages(prev => [...prev, { role: 'user', text: `Toppings: ${selected.join(', ')}` }, { role: 'bot', text: `¡Listo, listo! 🎉 Tu ${productToCustomize?.name || 'producto'} está en el carrito. ¿Algo más que desees ordenar o información? ¿O sería todo? 🌙` }]);
        }
    };

    // ============================================
    // CHECKOUT LOGIC
    // ============================================
    const startCheckout = () => {
        setMessages(prev => [...prev,
        { role: 'user', text: 'Finalizar pedido' },
        { role: 'bot', text: '¡Aquí está tu resumen! Revisa que todo esté correcto. 🌙', showOrderSummary: true }
        ]);
    };

    // ============================================
    // QUOTE (COTIZACIÓN) IN CHAT
    // ============================================
    const sendQuoteToChat = () => {
        if (cart.length === 0) return;

        const lines = cart.map(item => {
            const qty = item.quantity || 1;
            const unitPrice = item.rentalPricePerDay || item.price || 0;
            const subtotal = unitPrice * qty;
            const priceStr = unitPrice > 0
                ? `$${unitPrice.toLocaleString('es-MX')} × ${qty} = $${subtotal.toLocaleString('es-MX')}`
                : `${qty} unidad(es)`;
            return `• ${item.name}: ${priceStr}`;
        });

        let total = cart.reduce((acc, item) => {
            const qty = item.quantity || 1;
            const unitPrice = item.rentalPricePerDay || item.price || 0;
            return acc + unitPrice * qty;
        }, 0);

        const discountApplies = isDiscountActive();
        let discountAmount = 0;
        if (discountApplies && total > 0) {
            discountAmount = total * 0.15;
            total = total - discountAmount;
            lines.push(`\n🎁 *Descuento 15% (Apartado Hoy): -$${discountAmount.toLocaleString('es-MX')}*`);
        }

        const totalLine = total > 0 ? `\n💰 *Total estimado: $${total.toLocaleString('es-MX')} MXN*` : '';
        const quoteText = `📋 *Cotización de tu pedido:*\n\n${lines.join('\n')}${totalLine}\n\n_Precios pueden variar según confirmación. Si te interesa, puedes enviarnos esta cotización por WhatsApp tocando el botón de abajo. 🌙_`;

        setMessages(prev => [
            ...prev,
            { role: 'user', text: '📋 Ver cotización' },
            { role: 'bot', text: quoteText, whatsappCta: true }
        ]);
    };

    const handleCheckoutFlow = (text) => {
        if (text.toLowerCase().match(/cancel|olvida/i)) {
            setBotState('IDLE');
            return { text: "Okay, cancelé el proceso." };
        }

        switch (botState) {
            case 'CHECKOUT_START': setBotState('ASK_NAME'); return { text: "¡Perfecto! 🎉 Para registrar tu pedido necesito unos datos. Primero: ¿Cuál es tu nombre? 😊" };
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

                    // Call backend here and get the result synchronously for the chat
                    submitOrderToBackend().then((createdOrder) => {
                        const baseText = "¡Pedido confirmado! 🎉 Tu pedido ha sido registrado automáticamente.";

                        let finalMsg = { role: 'bot', text: baseText + " Aquí tienes el resumen final para enviarlo.", whatsappCta: true };

                        setMessages(prev => [...prev, finalMsg]);
                    });

                    // Return a temporary loading message for the chat bubble
                    return { text: "Procesando tu pedido, dame un segundito... ⏳", hideLoading: true };
                } else if (text.includes('Cancelar')) {
                    setBotState('IDLE');
                    return { text: "Cancelado." };
                }
                break;
        }
        return { text: "No entendí 😅" };
    };

    const createOrderSummary = (data, cart) => {
        const totalItems = cart.reduce((acc, item) => acc + (item.quantity || 1), 0);
        return `Resumen:\n${data.name} (${data.phone})\n${data.date} a las ${data.time}\n\n${totalItems} productos/artículos.\n\n¿Confirmar?`;
    };

    const submitOrderToBackend = async (data = customerData, currentCart = null) => {
        try {
            const effectiveCart = currentCart || cartRef.current;
            const finalItems = effectiveCart.map(item => ({
                id: item.id,
                name: item.name,
                price: item.totalPrice || item.price,
                quantity: item.quantity || 1,
                customization: item.customization || null
            }));

            const snackSubtotal = effectiveCart.filter(i => !i.isRental && !i.category?.includes('Renta') && i.productType !== 'RENTAL').reduce((acc, i) => acc + (i.totalPrice || 0), 0);
            const rawSubtotal = effectiveCart.reduce((acc, i) => acc + (i.totalPrice || 0), 0);
            const discountApplies = isDiscountActive();
            const discountAmount = discountApplies ? snackSubtotal * 0.15 : 0;
            const finalTotal = rawSubtotal - discountAmount;

            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customer: data.name || 'Cliente chat',
                    phone: data.phone || '',
                    peopleCount: data.peopleCount || '',
                    eventLocation: data.eventLocation || '',
                    email: data.email || '',
                    date: data.date || '',
                    time: data.time || '',
                    total: finalTotal,
                    items: finalItems,
                    status: 'PENDING',
                    createdAt: new Date().toISOString()
                })
            });
            console.log('Pedido enviado automáticamente al backend');
            if (response.ok) {
                return await response.json();
            }
            return null;
        } catch (error) {
            console.error('Error enviando pedido:', error);
            return null;
        }
    };

    const handleSend = async (e, textOverride = null) => {
        if (e) e.preventDefault();
        const userText = textOverride || input;
        if (!userText.trim()) return;

        setMessages(prev => [...prev, { role: 'user', text: userText }]);
        if (!textOverride) setInput('');
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
                if (response.menuCheckbox) msg.menuCheckbox = response.menuCheckbox;
                if (response.whatsappCta) msg.whatsappCta = true;
                if (response.showOrderSummary) msg.showOrderSummary = true;
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


    // ← esta línea ya existe
    if (!isOpen) return null;

    return (
        <div className="fixed bottom-6 right-6 w-full max-w-sm glass-panel rounded-3xl z-50 flex flex-col overflow-hidden h-[500px] animate-fade-in border border-white/70 shadow-[0_20px_70px_rgba(0,0,0,0.15)]">
            {/* Modal cotización */}
            {quoteModal.open && (
                <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center rounded-3xl">
                    <div className="bg-white rounded-2xl p-5 mx-4 shadow-xl w-full max-w-sm">
                        <h3 className="font-bold text-slate-800 text-sm mb-1">Detalles de Cotización 📋</h3>
                        <p className="text-xs text-rose-600 font-semibold bg-rose-50 p-2 rounded-lg mb-4">
                            ¡NUEVO! 🎁 ¡Aparta tu fecha HOY y recibe un -15% de descuento al instante en tu cotización!
                        </p>

                        <div className="flex flex-col gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">¿Para cuántas personas? 👥</label>
                                <input
                                    type="number"
                                    min="30"
                                    placeholder="Ej. 50 (Mínimo 30)"
                                    value={quoteModal.peopleCount}
                                    onChange={e => setQuoteModal(prev => ({ ...prev, peopleCount: e.target.value, error: '' }))}
                                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rose-400"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">¿Qué día es el evento? 📅</label>
                                <input
                                    type="date"
                                    value={quoteModal.date}
                                    min={new Date().toISOString().split('T')[0]}
                                    onChange={e => setQuoteModal(prev => ({ ...prev, date: e.target.value, error: '' }))}
                                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rose-400"
                                />
                            </div>

                            {/* Elote Split Selector */}
                            {(() => {
                                const isElote = ['elote en vaso', 'elote revolcado'].some(name => quoteModal.product?.name?.toLowerCase().includes(name));
                                if (!isElote || !quoteModal.peopleCount || isNaN(quoteModal.peopleCount) || parseInt(quoteModal.peopleCount) < 30) return null;

                                const total = parseInt(quoteModal.peopleCount);
                                const currentProdName = quoteModal.product.name;
                                const otherElote = products.find(p => ['elote en vaso', 'elote revolcado'].some(name => p.name?.toLowerCase().includes(name)) && p.id !== quoteModal.product.id);

                                if (!otherElote) return null;

                                return (
                                    <div className="mt-2 p-3 bg-amber-50 rounded-xl border border-amber-100">
                                        <div className="flex items-start gap-2">
                                            <input
                                                type="checkbox"
                                                id="splitMode"
                                                checked={quoteModal.splitMode}
                                                onChange={(e) => setQuoteModal(prev => ({ ...prev, splitMode: e.target.checked, splitValue: Math.floor(total / 2) }))}
                                                className="mt-1 accent-amber-500"
                                            />
                                            <label htmlFor="splitMode" className="text-xs text-amber-800 font-medium cursor-pointer">
                                                🌽 Al ser base elote, puedes combinar tu barra para tus invitados con {otherElote.name}.
                                            </label>
                                        </div>

                                        {quoteModal.splitMode && (
                                            <div className="mt-4 px-2">
                                                <div className="flex justify-between text-[10px] font-bold text-slate-600 mb-2 uppercase tracking-wide">
                                                    <span>{total - quoteModal.splitValue}x {currentProdName}</span>
                                                    <span>{quoteModal.splitValue}x {otherElote.name}</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="5"
                                                    max={total - 5}
                                                    step="5"
                                                    value={quoteModal.splitValue}
                                                    onChange={e => setQuoteModal(prev => ({ ...prev, splitValue: parseInt(e.target.value) }))}
                                                    className="w-full form-range accent-amber-500"
                                                />
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}
                        </div>

                        {quoteModal.error && <p className="text-xs text-red-500 mt-2">{quoteModal.error}</p>}

                        <div className="flex gap-2 mt-5">
                            <button
                                onClick={() => setQuoteModal({ open: false, product: null, peopleCount: '', date: '', splitMode: false, splitValue: 0, error: '' })}
                                className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-medium"
                            >Cancelar</button>
                            <button
                                onClick={() => {
                                    const n = parseInt(quoteModal.peopleCount);
                                    if (!n || n < 30) {
                                        setQuoteModal(prev => ({ ...prev, error: 'Mínimo 30 personas.' }));
                                        return;
                                    }
                                    if (!quoteModal.date) {
                                        setQuoteModal(prev => ({ ...prev, error: 'Por favor selecciona la fecha del evento.' }));
                                        return;
                                    }

                                    setCustomerData(prev => ({ ...prev, peopleCount: n.toString(), date: quoteModal.date }));
                                    const prod = quoteModal.product;
                                    const eventDate = quoteModal.date;
                                    const isSplit = quoteModal.splitMode;
                                    const splitVal = quoteModal.splitValue;

                                    setQuoteModal({ open: false, product: null, peopleCount: '', date: '', splitMode: false, splitValue: 0, error: '' });

                                    if (isSplit) {
                                        const otherElote = products.find(p => p.name.toLowerCase().includes('elote') && p.id !== prod.id);
                                        const mainCount = n - splitVal;
                                        handleSend({ preventDefault: () => { } }, `quiero cotizar ${prod.name} para ${mainCount} personas y ${otherElote.name} para ${splitVal} personas el día ${eventDate}`);
                                    } else {
                                        handleSend({ preventDefault: () => { } }, `quiero ${prod.name} para ${n} personas el día ${eventDate}`);
                                    }
                                }}
                                className="flex-1 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all"
                            >Cotizar ahora</button>
                        </div>
                    </div>
                </div>
            )}
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
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white/60 dark:bg-slate-900/80 scroll-smooth">
                {messages.map((msg, i) => (
                    <div key={i}>
                        <ChatMessage msg={msg} />
                        {msg.choices && (
                            <div className="mt-2 flex flex-wrap gap-2 justify-end">
                                {msg.choices.map(c => (
                                    <button key={c.id} onClick={() => handleChoiceClick(c)} className="text-xs bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 px-3 py-1 rounded-full hover:bg-rose-200 dark:hover:bg-rose-800 border border-rose-200 dark:border-rose-800/50 shadow-sm transition-colors">
                                        {c.name}
                                    </button>
                                ))}
                            </div>
                        )}
                        {msg.menuCheckbox && (
                            <MenuCheckboxPanel
                                products={msg.menuCheckbox}
                                onConfirm={(selected) => {
                                    if (selected.length === 0) return;
                                    if (selected.length === 1) {
                                        setQuoteModal({ open: true, product: selected[0], peopleCount: '', date: '', splitMode: false, splitValue: 0, error: '' });
                                    } else {
                                        // Para múltiples productos, procesarlos uno por uno con el modal
                                        // Por ahora abre modal para el primero
                                        setQuoteModal({ open: true, product: selected[0], peopleCount: '', date: '', splitMode: false, splitValue: 0, error: '' });
                                    }
                                }}
                            />
                        )}
                        {msg.showOrderSummary && cart.length > 0 && !orderSubmitted && (() => {
                            let subtotal = cart.reduce((acc, i) => acc + (i.totalPrice || 0), 0);
                            const snackSubtotal = cart.filter(i => !i.isRental && !i.category?.includes('Renta') && i.productType !== 'RENTAL').reduce((acc, i) => acc + (i.totalPrice || 0), 0);
                            const discountApplies = true;
                            const discountAmount = discountApplies ? snackSubtotal * 0.15 : 0;
                            const total = subtotal - discountAmount;

                            return (
                                <div className="mt-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-md overflow-hidden w-full">
                                    {/* Header */}
                                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 px-4 py-2.5 border-b border-slate-100 dark:border-slate-700/50 flex justify-between items-center">
                                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">📋 Resumen final</p>
                                        {discountApplies && <span className="bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm flex items-center gap-1"><span className="animate-pulse">✨</span> 15% OFF</span>}
                                    </div>
                                    {/* Items */}
                                    <div className="px-4 py-3 space-y-2">
                                        {cart.map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-center text-xs">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 font-bold px-1.5 py-0.5 rounded-full text-[10px]">×{item.quantity || 1}</span>
                                                    <span className="text-slate-700 dark:text-slate-300 font-medium">{item.name}</span>
                                                </div>
                                                {item.totalPrice > 0 && (
                                                    <span className="text-slate-500 dark:text-slate-400 font-semibold">${item.totalPrice.toLocaleString('es-MX')}</span>
                                                )}
                                            </div>
                                        ))}
                                        {subtotal > 0 && (
                                            <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-700/50 mb-1">
                                                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Total regular</span>
                                                <span className="text-sm font-bold text-slate-600 dark:text-slate-400">${subtotal.toLocaleString('es-MX')} MXN</span>
                                            </div>
                                        )}
                                        {discountApplies && snackSubtotal > 0 && (
                                            <div className="flex justify-between items-end bg-rose-50 dark:bg-rose-900/10 p-2 rounded-lg -mx-1 mt-1">
                                                <span className="text-[10px] font-bold text-rose-500 uppercase flex items-center gap-1"><span className="animate-pulse">✨</span> Si apartas tu fecha HOY:</span>
                                                <span className="text-sm font-black text-rose-600 dark:text-rose-400">${total.toLocaleString('es-MX')} MXN</span>
                                            </div>
                                        )}
                                    </div>
                                    {/* Actions */}
                                    <div className="px-4 pb-4">
                                        <button
                                            onClick={() => {
                                                submitOrderToBackend(); // Se mandará con base en customerData y cart

                                                // Disable this button on the current message
                                                const updatedMessages = [...messages];
                                                const currentMsgIndex = updatedMessages.findIndex(m => m === msg);
                                                if (currentMsgIndex !== -1) {
                                                    updatedMessages[currentMsgIndex].showOrderSummary = false;
                                                    setMessages(updatedMessages);
                                                }

                                                // Append success response with WhatsApp fallback
                                                setMessages(prev => [
                                                    ...prev,
                                                    {
                                                        role: 'bot',
                                                        text: "¡Perfecto! 🎉 Tu pedido ha sido registrado en el sistema. Puedes esperar a que te contactemos, o si lo prefieres, puedes agilizar tu pedido enviándolo directo por WhatsApp con el botón de abajo. 👇",
                                                        whatsappCta: true
                                                    }
                                                ]);
                                                setBotState('IDLE');
                                                setOrderSubmitted(true);
                                            }}
                                            className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-lg text-sm"
                                        >
                                            <CheckCircle size={18} /> Mandar solicitud para agendar
                                        </button>
                                    </div>
                                </div>
                            );
                        })()}
                        {msg.whatsappCta && cart.length > 0 && (() => {
                            let subtotal = cart.reduce((acc, i) => acc + (i.totalPrice || 0), 0);
                            const snackSubtotal = cart.filter(i => !i.isRental && !i.category?.includes('Renta') && i.productType !== 'RENTAL').reduce((acc, i) => acc + (i.totalPrice || 0), 0);
                            const discountApplies = true;
                            const discountAmount = discountApplies ? snackSubtotal * 0.15 : 0;
                            const total = subtotal - discountAmount;

                            let waItemsText = cart.map(i => `• ${i.name} ×${i.quantity || 1}${i.totalPrice ? ` — $${i.totalPrice.toLocaleString('es-MX')}` : ''}`).join('\n');
                            if (discountApplies && total > 0) {
                                waItemsText += `\n🎁 Descuento 15% (Apartado Hoy): -$${discountAmount.toLocaleString('es-MX')}`;
                            }

                            const waText = encodeURIComponent(
                                `🌙 *PEDIDO MEDIA LUNA SNACK BAR*\n\n` +
                                `👤 *Cliente:* ${customerData.name || 'No especificado'}\n` +
                                `📱 *Teléfono:* ${customerData.phone || 'No especificado'}\n` +
                                `📧 *Correo:* ${customerData.email || 'No especificado'}\n` +
                                `📍 *Lugar:* ${customerData.eventLocation || 'No especificado'}\n` +
                                `📅 *Fecha:* ${customerData.date || 'No especificado'}\n` +
                                `🕐 *Hora:* ${customerData.time || 'No especificado'}\n\n` +
                                `📦 *PRODUCTOS:*\n${waItemsText}${total > 0 ? `\n\n💰 *Total estimado: $${total.toLocaleString('es-MX')} MXN*` : ''}\n\n💬 Confirmo este pedido. ¡Gracias! 😊`
                            );
                            return (
                                <div className="mt-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-md overflow-hidden w-full">
                                    {/* Header */}
                                    <div className="bg-gradient-to-r from-rose-50 to-amber-50 dark:from-rose-900/20 dark:to-amber-900/20 px-4 py-2.5 border-b border-slate-100 dark:border-slate-700/50 flex justify-between items-center">
                                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">📋 Resumen de tu pedido</p>
                                        {discountApplies && <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm flex items-center gap-1"><span className="animate-pulse">✨</span> 15% OFF</span>}
                                    </div>
                                    {/* Items */}
                                    <div className="px-4 py-3 space-y-2">
                                        {cart.map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-center text-xs">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 font-bold px-1.5 py-0.5 rounded-full text-[10px]">×{item.quantity || 1}</span>
                                                    <span className="text-slate-700 dark:text-slate-300 font-medium">{item.name}</span>
                                                </div>
                                                {item.totalPrice > 0 && (
                                                    <span className="text-slate-500 dark:text-slate-400 font-semibold">${item.totalPrice.toLocaleString('es-MX')}</span>
                                                )}
                                            </div>
                                        ))}
                                        {discountApplies && subtotal > 0 && (
                                            <div className="flex justify-between items-center text-xs text-rose-600 dark:text-rose-400 font-bold pt-1">
                                                <span className="flex items-center gap-1">🎁 Descuento (Apartado Hoy)</span>
                                                <span>-${discountAmount.toLocaleString('es-MX')}</span>
                                            </div>
                                        )}
                                        {total > 0 && (
                                            <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-700/50">
                                                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Total final</span>
                                                <span className="text-sm font-bold text-rose-600 dark:text-rose-400">${total.toLocaleString('es-MX')} MXN</span>
                                            </div>
                                        )}
                                    </div>
                                    {/* Actions */}
                                    <div className="px-4 pb-4 space-y-2">
                                        <div className="w-full bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 text-xs font-medium py-2 rounded-xl text-center border border-slate-200 dark:border-slate-600/50">
                                            ✓ Pedido registrado en sistema
                                        </div>
                                        {/* WhatsApp */}
                                        <a
                                            href={`https://wa.me/${BUSINESS_PHONE}?text=${waText}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center gap-2 w-full bg-[#25D366] text-white text-xs font-semibold py-2.5 rounded-xl hover:bg-[#1ebe5d] transition-colors shadow-sm"
                                        >
                                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" /><path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.555 4.118 1.529 5.847L.057 23.882l6.218-1.447A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.933a9.926 9.926 0 01-5.036-1.369l-.361-.214-3.691.859.901-3.6-.235-.371A9.917 9.917 0 012.067 12C2.067 6.509 6.509 2.067 12 2.067S21.933 6.509 21.933 12 17.491 21.933 12 21.933z" /></svg>
                                            Agilizar con WhatsApp
                                        </a>
                                    </div>
                                </div>
                            );
                        })()}

                        {msg.selectionType && (
                            <div className="mt-2 bg-white dark:bg-slate-800 p-3 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm w-full">
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

            {/* Checkout buttons fully managed by AI now */}
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