// ============================================
// LUNITA IA - NATURAL LANGUAGE PROCESSING
// ============================================

// Normalizar texto (quitar acentos y convertir a minúsculas)
export const normalize = (str) =>
    str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

// ============================================
// INTENT PATTERNS
// ============================================

export const INTENT_PATTERNS = {
    greeting: {
        keywords: ["hola", "buenas", "qué onda", "quihubo", "quiubole", "hey"],
        phrases: [/^hola/i, /^buenas/i, /qu[eé].*onda/i, /quihubo/i, /hey/i]
    },

    event_context: {
        keywords: ["boda", "fiesta", "evento", "cumpleaños", "reunión", "celebración", "XV años", "quince años"],
        phrases: [
            /para.*boda/i,
            /para.*fiesta/i,
            /para.*evento/i,
            /para.*cumplea[ñn]os/i,
            /tengo.*boda/i,
            /tengo.*fiesta/i,
            /XV.*a[ñn]os/i,
            /quince.*a[ñn]os/i
        ]
    },

    ask_recommendation: {
        keywords: ["recomienda", "sugieres", "popular", "mejor", "famoso", "rico"],
        phrases: [
            /qu[eé].*recomiend/i,
            /qu[eé].*suger/i,
            /cu[aá]l.*mejor/i,
            /qu[eé].*rico/i,
            /qu[eé].*popula/i,
            /qu[eé].*pide.*gente/i,
            /qu[eé].*bueno/i
        ]
    },

    ask_price: {
        keywords: ["cuesta", "precio", "vale", "cuánto", "caro", "barato"],
        phrases: [
            /cu[aá]nto.*cuesta/i,
            /cu[aá]l.*precio/i,
            /qu[eé].*vale/i,
            /est[aá].*(caro|barato)/i,
            /cu[aá]nto.*es/i
        ]
    },

    view_menu: {
        keywords: ["men[uú]", "producto", "vende", "hay", "tiene", "opciones", "todo"],
        phrases: [
            /qu[eé].*vende/i,
            /qu[eé].*hay/i,
            /qu[eé].*tiene/i,
            /ver.*men[uú]/i,
            /mostrar.*producto/i,
            /cu[aá]les.*opciones/i,
            /^men[uú]$/i,
            /^todo$/i
        ]
    },

    ask_ingredients: {
        keywords: ["trae", "lleva", "ingrediente", "contiene", "incluye", "tiene"],
        phrases: [
            /qu[eé].*trae/i,
            /qu[eé].*lleva/i,
            /qu[eé].*incluye/i,
            /qu[eé].*ingrediente/i,
            /qu[eé].*contiene/i
        ]
    },

    ask_delivery: {
        keywords: ["entrega", "domicilio", "llevan", "mandan", "envían", "delivery"],
        phrases: [
            /hacen.*entrega/i,
            /entregan.*domicilio/i,
            /llevan.*casa/i,
            /mandan/i,
            /env[ií]an/i
        ]
    },

    ask_time: {
        keywords: ["tardan", "tiempo", "demora", "listo", "rápido"],
        phrases: [
            /cu[aá]nto.*tard/i,
            /cu[aá]nto.*tiempo/i,
            /cu[aá]ndo.*listo/i,
            /qu[eé].*r[aá]pido/i
        ]
    },

    thanks: {
        keywords: ["gracias", "grax", "thanks", "sale", "chido"],
        phrases: [/gracias/i, /grax/i, /de pelos/i, /chido/i]
    },

    goodbye: {
        keywords: ["bye", "adiós", "chao", "nos vemos", "ya", "listo", "todo"],
        phrases: [
            /^bye/i,
            /adi[oó]s/i,
            /nos vemos/i,
            /eso.*todo/i,
            /ya.*nada/i,
            /ser[ií]a.*todo/i,
            /ya est[aá]/i,
            /as[ií].*bien/i,
            /gracias.*todo/i,
            /nada m[aá]s/i
        ]
    },

    help: {
        keywords: ["ayuda", "help", "funciona", "cómo"],
        phrases: [/ayuda/i, /help/i, /c[oó]mo.*funciona/i]
    }
};

// ============================================
// RESPONSE TEMPLATES (con variaciones)
// ============================================

export const RESPONSES = {
    greeting: [
        "¡Hola! 🌙 Soy Lunita, tu asistente para antojos. ¿Qué se te antoja hoy?",
        "¡Qué onda! 🍉 Bienvenido a Media Luna. ¿Listo para armar tu pedido?",
        "¡Hola! 😊 ¿Antojo de algo rico? Yo te ayudo a elegir."
    ],

    event_context: [
        "¡Qué emoción! 🎉 Perfecto, te ayudo a armar el pedido para tu evento. ¿Qué se te antoja que llevemos?",
        "¡Genial! Me late ayudarte con eso 😊 ¿Qué productos te gustaría cotizar?",
        "¡Claro que sí! 🌙 Cuéntame, ¿qué se te antoja para tu celebración?"
    ],

    ask_recommendation: [
        "¡Uy! Nuestro TOP 3 es:\n🥇 Papas Preparadas (puedes armarlas a tu gusto)\n🥈 Tostilocos (un clásico)\n🥉 Elote en Vaso\n\n¿Cuál te late? 😋",
        "Si es tu primera vez, te súper recomiendo las Papas Preparadas. ¡Tú eliges todo! O si prefieres algo más rápido, los Tostilocos están buenísimos. ¿Qué dices?",
        "Lo más pedido 🔥:\n• Papas Preparadas (100% personalizable)\n• Duros Preparados\n• Fresas con Crema\n\n¿Te late alguno?"
    ],

    ask_price: [
        "Los precios varían según tamaño e ingredientes 💰. Si me dices qué quieres, armo tu pedido y al final te mando la cotización. ¿Qué te gustaría pedir?",
        "¡Buena pregunta! Como todo es personalizado, el precio depende de lo que elijas. Pero no te preocupes, al terminar tu pedido te doy el precio exacto. ¿Empezamos? 😊"
    ],

    ask_delivery: [
        "📍 Servicio exclusivo en Manzanillo, Colima. Por ahora solo cotizamos por aquí, pero al final te paso con el equipo por WhatsApp para confirmar entrega. ¿Armamos tu pedido?",
        "Estamos en Manzanillo, Colima 🌴. Arma tu pedido aquí y al final te comunicas directo con el equipo para coordinar la entrega. ¿Le entramos?"
    ],

    ask_time: [
        "Todo se prepara al momento, fresco y rico 🔥. El tiempo depende de tu pedido, pero el equipo te confirma al cotizar. ¿Qué se te antoja?",
        "¡Todo fresquecito! ⏱️ Preparamos al momento. El equipo te dice el tiempo exacto cuando coordines tu pedido. ¿Empezamos?"
    ],

    ask_ingredients: (productName) => [
        `Las ${productName} traen un chorro de opciones. ¿Quieres que te ayude a armarlas paso a paso? 😋`,
        `¡Buena pregunta! En las ${productName} TÚ eliges todo: base, complementos y toppings. ¿Las armamos juntos?`
    ],

    view_menu: [
        "¡Tenemos de todo! 🍽️\n\n🍟 Snacks: Papas Preparadas, Tostilocos, Elote en Vaso, Duros, Crepaletas, Fresas con Crema...\n🍹 Bebidas: Micheladas y Cantaritos\n\nEscribe lo que se te antoje o dime '¿qué me recomiendas?' 😊",
        "Mira todo lo que tenemos:\n• Papas Preparadas (arma tu bowl)\n• Tostilocos\n• Maruchan Preparada\n• Elote en Vaso\n• Y mucho más...\n\n¿Qué se te antoja? 🤤"
    ],

    thanks: [
        "¡De nada! 😊 Es un placer. ¿En qué más te puedo ayudar?",
        "¡Para eso estoy! 🌙 ¿Algo más que necesites?",
        "¡Claro que sí! ¿Te ayudo con algo más?"
    ],

    goodbye: [
        "¡Sale! 👋 Cuando quieras regresas. Que te vaya súper bien 🌙",
        "¡Órale! Nos vemos. ¡Que disfrutes tu pedido! 🍉😋",
        "¡Perfecto! 🎉 Ahí nos vemos. Saludos 👋"
    ],

    unknown: [
        "Mmm 🤔 no estoy segura de qué es eso. ¿Me puedes decir de otra forma? O escribe 'menú' para ver todo lo que tenemos.",
        "No te entendí bien 😅. Intenta escribir algo como 'quiero papas' o '¿qué me recomiendas?'",
        "Uy, no caché bien 🙈. ¿Qué tal si me dices qué se te antoja? O escribe 'ayuda' para ver cómo funciono."
    ],

    help: [
        "¡Claro! 🌙 Así funciono:\n\n💬 Escribe lo que quieras en lenguaje normal:\n• 'Quiero papas preparadas'\n• 'Qué me recomiendas?'\n• 'Cuánto cuestan los tostilocos?'\n\n📋 También puedes escribir:\n• 'menú' - Ver todo\n• 'popular' - Lo más pedido\n\n¿Qué se te antoja? 😋"
    ]
};

// Obtener respuesta aleatoria de un array
export const getRandomResponse = (responseArray) => {
    if (typeof responseArray === 'function') {
        return responseArray;
    }
    return responseArray[Math.floor(Math.random() * responseArray.length)];
};

// ============================================
// INTENT DETECTION
// ============================================

export const detectIntent = (text, products) => {
    const lower = text.toLowerCase();
    const normalized = normalize(text);

    // Buscar coincidencias de patrones
    for (const [intent, config] of Object.entries(INTENT_PATTERNS)) {
        // Verificar keywords
        const hasKeyword = config.keywords?.some(kw =>
            normalized.includes(normalize(kw))
        );

        // Verificar frases regex
        const matchesPhrase = config.phrases?.some(regex =>
            regex.test(text)
        );

        if (hasKeyword || matchesPhrase) {
            return intent;
        }
    }

    // Búsqueda de productos con sistema de scoring mejorado
    const productScores = products.map(p => {
        const productName = normalize(p.name);
        const productNameClean = productName.replace(/\(.*?\)/g, '').trim(); // Remover paréntesis como "(Bowl)"
        let score = 0;

        // 1. Match exacto del nombre (sin paréntesis) - alta prioridad
        if (normalized === productNameClean) {
            score += 100;
        }

        // 2. El input contiene el nombre completo del producto (sin paréntesis)
        if (normalized.includes(productNameClean)) {
            score += 50;
        }

        // 3. Todas las palabras del nombre (sin paréntesis) están en el input
        const productWords = productNameClean.split(' ').filter(w => w.length > 2); // Ignorar palabras muy cortas
        if (productWords.length > 0 && productWords.every(word => normalized.includes(word))) {
            score += 30;
        }

        // 4. Match de keywords individual
        const matchedKeywords = p.keywords.filter(k => normalized.includes(normalize(k)));
        score += matchedKeywords.length * 10;

        // 5. Bonus si hay múltiples keywords que matchean
        if (matchedKeywords.length >= 2) {
            score += 20;
        }

        return { product: p, score };
    });

    // Filtrar solo productos con algún score y ordenar por score descendente
    const matched = productScores
        .filter(ps => ps.score > 0)
        .sort((a, b) => b.score - a.score)
        .map(ps => ps.product);

    if (matched.length > 0) {
        return { type: 'order_product', products: matched };
    }

    return 'unknown';
};

// ============================================
// CHECKOUT VALIDATORS
// ============================================

export const validators = {
    peopleCount: (text) => {
        const num = parseInt(text.match(/\d+/)?.[0]);
        return num && num > 0 ? num : null;
    },

    name: (text) => {
        const cleanName = text
            .replace(/^(me llamo|soy|mi nombre es)\s+/i, '')
            .trim();
        return cleanName.length >= 2 ? cleanName : null;
    },

    phone: (text) => {
        const digits = text.replace(/\D/g, '');
        const cleanDigits = digits.replace(/^(52)?/, '');
        if (cleanDigits.length === 10) {
            return cleanDigits;
        }
        return null;
    },

    location: (text) => {
        return text.trim().length >= 3 ? text.trim() : null;
    },

    date: (text) => {
        const lower = text.toLowerCase();
        const today = new Date();

        if (lower.includes('hoy')) {
            return today.toISOString().split('T')[0];
        }

        if (lower.includes('mañana')) {
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            return tomorrow.toISOString().split('T')[0];
        }

        if (lower.match(/pasado mañana|pasado ma[ñn]ana/)) {
            const dayAfter = new Date(today);
            dayAfter.setDate(dayAfter.getDate() + 2);
            return dayAfter.toISOString().split('T')[0];
        }

        const spanishDateMatch = text.match(/(\d{1,2})\s+de\s+(\w+)/i);
        if (spanishDateMatch) {
            const day = parseInt(spanishDateMatch[1]);
            const monthStr = spanishDateMatch[2].toLowerCase();
            const months = {
                'enero': 0, 'febrero': 1, 'marzo': 2, 'abril': 3,
                'mayo': 4, 'junio': 5, 'julio': 6, 'agosto': 7,
                'septiembre': 8, 'octubre': 9, 'noviembre': 10, 'diciembre': 11,
                'ene': 0, 'feb': 1, 'mar': 2, 'abr': 3,
                'may': 4, 'jun': 5, 'jul': 6, 'ago': 7,
                'sep': 8, 'oct': 9, 'nov': 10, 'dic': 11
            };

            const month = months[monthStr];
            if (month !== undefined) {
                // Crear fecha en zona horaria local
                const date = new Date(today.getFullYear(), month, day);
                const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                if (date < todayStart) {
                    date.setFullYear(date.getFullYear() + 1);
                }
                // Formatear manualmente para evitar conversión UTC
                const year = date.getFullYear();
                const monthFormatted = String(date.getMonth() + 1).padStart(2, '0');
                const dayFormatted = String(date.getDate()).padStart(2, '0');
                return `${year}-${monthFormatted}-${dayFormatted}`;
            }
        }

        if (text.match(/^\d{4}-\d{2}-\d{2}$/)) {
            const date = new Date(text);
            if (date >= today) {
                return text;
            }
        }

        return null;
    },

    time: (text) => {
        const lower = text.toLowerCase().trim();
        let hour = 0;
        let minute = 0;
        let found = false;

        // 1. Explicit AM/PM format (e.g. "6:30 pm", "6pm", "6:30 de la tarde")
        const matchAMPM = lower.match(/(\d{1,2})(?::(\d{2}))?\s*(pm|p\.m\.|am|a\.m\.|de la tarde|de la mañana)/);
        if (matchAMPM) {
            hour = parseInt(matchAMPM[1]);
            minute = matchAMPM[2] ? parseInt(matchAMPM[2]) : 0;
            const isPM = /pm|p\.m\.|tarde/.test(matchAMPM[3]);

            if (isPM && hour < 12) hour += 12;
            if (!isPM && hour === 12) hour = 0;
            found = true;
        }

        // 2. 24H format or loose "H:MM" (e.g. "18:30", "6:30")
        if (!found) {
            const matchTime = lower.match(/(?:a\s+)?(?:las\s+)?(\d{1,2})(?::(\d{2}))?/);
            if (matchTime) {
                hour = parseInt(matchTime[1]);
                minute = matchTime[2] ? parseInt(matchTime[2]) : 0;

                // Heuristic: If hour is 1-11, assume PM context (since store opens 2pm)
                // Exception: if hour is 0-11 but clearly meant as AM (unlikely given store hours)
                // We map 1-11 to 13-23.
                if (hour >= 1 && hour <= 11) {
                    hour += 12;
                }
                found = true;
            }
        }

        if (found) {
            // Validation: 14:00 (2 PM) to 20:00 (8 PM)
            const totalMinutes = hour * 60 + minute;
            const startMinutes = 14 * 60;
            const endMinutes = 20 * 60;

            if (totalMinutes >= startMinutes && totalMinutes <= endMinutes) {
                return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            }
        }

        return null;
    }
};
