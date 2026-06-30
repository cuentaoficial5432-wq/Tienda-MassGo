/**
 * chatbot.js — Asistente MassGo con Gemini API
 * Se inyecta automáticamente en todas las páginas.
 * Contexto: solo responde sobre MassGo (supermercado, pedidos, productos, etc.)
 */

const CHATBOT_CONFIG = {
    // La API key de Gemini se gestiona desde el backend (config.py / .env)
    // El frontend llama a /api/ai/gemini-proxy para evitar exponer la key.
    whatsappNumber: '+51972097791',
    siteName: 'MassGo',
    siteUrl: 'massgo.pe',
};

const SYSTEM_PROMPT = `Eres el asistente virtual oficial de ${CHATBOT_CONFIG.siteName} (${CHATBOT_CONFIG.siteUrl}), un supermercado de barrio a domicilio en Trujillo, Perú.

Tu función es ÚNICAMENTE ayudar con temas relacionados a ${CHATBOT_CONFIG.siteName}. NO respondas preguntas fuera de este contexto.

## Lo que SÍ puedes hacer:
- Ayudar a encontrar productos por nombre, descripción o tipo de plato (ej: "busco algo para hacer lomo saltado", "quiero una bebida sin azúcar")
- Consultar disponibilidad de productos en stock
- Ayudar a modificar pedidos en curso
- Explicar cómo rastrear un delivery
- Resolver reclamos o dudas sobre devoluciones y cambios
- Recordar preferencias de clientes frecuentes
- Ayudar a armar pedidos recurrentes ("pídeme lo de siempre")
- Explicar promociones, ofertas flash y medios de pago
- Dar información sobre horarios de atención, zonas de reparto, tiempos de entrega

## Lo que NO puedes hacer:
- Responder temas políticos, religiosos, médicos, legales
- Hacer cálculos matemáticos, programación, etc.
- Hablar de otras marcas o compettidores
- Dar información personal de usuarios

## Reglas de respuesta:
- Sé amable, cercano y con estilo peruano (puedes usar "pues", "ya pe")
- Si te preguntan algo fuera de contexto, responde amablemente: "Lo siento, solo puedo ayudarte con temas relacionados a ${CHATBOT_CONFIG.siteName}. ¿Tienes alguna consulta sobre nuestros productos, pedidos o delivery?"
- Sé conciso (máximo 3 párrafos)
- Si no sabes algo específico, sugiere contactar por WhatsApp o visitar la web
- Usa emojis moderadamente 🛒`;

// ── Estado ──
let chatHistory = [];
let isProcessing = false;
let productCatalog = '';

async function fetchProductCatalog() {
    try {
        const res = await fetch('/api/productos/?limite=200');
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const productos = await res.json();
        if (!productos || productos.length === 0) return;
        const lines = productos.map(p => {
            const cat = p.categoria?.nombre || '';
            const oferta = p.es_oferta_flash ? ' 🏷️ OFERTA' : '';
            if (p.estado === 'Disponible' && p.stock > 0) {
                return `  - ${p.nombre} - S/${p.precio.toFixed(2)} (${p.stock} und)${cat ? ' [' + cat + ']' : ''}${oferta}`;
            }
            return `  - ${p.nombre} - AGOTADO`;
        });
        productCatalog = '\n## CATALOGO DE PRODUCTOS (precios en Soles):\n' + lines.join('\n') +
            '\n\n## Importante: USA EL CATALOGO para responder. Indica precio exacto y stock. Si no hay, sugiere alternativas del mismo catalogo.';
    } catch (e) {
        console.warn('No se pudo cargar catalogo:', e);
    }
}

async function buscarPedido(mensaje) {
    const patrones = [
        /#MG[-\s]*(\d+)/i,
        /MG[-\s]*(\d+)/i,
        /pedido\s*#?\s*(\d+)/i,
        /n[°º]\s*(\d+)/i,
    ];
    let id = null;
    for (const p of patrones) {
        const m = mensaje.match(p);
        if (m) { id = parseInt(m[1]); break; }
    }
    if (!id) return null;
    try {
        const res = await fetch(`/api/pedidos/${id}`);
        if (!res.ok) return null;
        const pedido = await res.json();
        let info = `\n[INFORMACION REAL DEL PEDIDO #MG-${pedido.id_pedido}]:\n`;
        info += `- Estado: ${pedido.estado}\n`;
        info += `- Total: S/${pedido.total?.toFixed(2)}\n`;
        info += `- Fecha: ${pedido.fecha || 'No disponible'}\n`;
        if (pedido.envio) {
            info += `- Direccion de entrega: ${pedido.envio.direccion_entrega}\n`;
            info += `- Estado del envio: ${pedido.envio.estado}\n`;
        }
        if (pedido.detalles && pedido.detalles.length > 0) {
            info += `- Productos:\n`;
            pedido.detalles.forEach(d => {
                info += `  * ${d.producto_nombre || 'Producto'} x${d.cantidad} - S/${(d.cantidad * d.precio_unitario).toFixed(2)}\n`;
            });
        }
        if (pedido.pagos && pedido.pagos.length > 0) {
            info += `- Pago: ${pedido.pagos[0].metodo_pago || 'No registrado'} - S/${pedido.pagos[0].monto?.toFixed(2)}\n`;
        }
        info += `[USA ESTA INFORMACION REAL para responder al usuario. NO digas que no tienes acceso.]\n`;
        return info;
    } catch (e) {
        return null;
    }
}

async function procesarAccionPedido(mensaje) {
    const msg = mensaje.toLowerCase();
    const patrones = [/#MG[-\s]*(\d+)/i, /MG[-\s]*(\d+)/i, /pedido\s*#?\s*(\d+)/i, /n[°º]\s*(\d+)/i];
    let id = null;
    for (const p of patrones) {
        const m = mensaje.match(p);
        if (m) { id = parseInt(m[1]); break; }
    }
    if (!id) return null;

    const esCancelar = /cancela|cancelar|cancelo|anula|anular|anulo/i.test(msg);
    const esRastrear = /rastrea|rastrear|rastreo|donde.*est[aá]|seguimiento|tracking|ubicar|estado/i.test(msg);

    if (esCancelar) {
        try {
            const res = await fetch(`/api/pedidos/${id}/cancelar`, { method: 'PATCH' });
            const data = await res.json();
            if (res.ok) {
                return `Tu pedido **#MG-${id}** ha sido cancelado exitosamente. ${data.mensaje || ''}`;
            } else {
                const detail = data.detail || 'No se pudo cancelar el pedido.';
                return `No pude cancelar el pedido **#MG-${id}**: ${detail}`;
            }
        } catch (e) {
            return `Hubo un error al intentar cancelar el pedido #MG-${id}. Inténtalo de nuevo.`;
        }
    }

    if (esRastrear) {
        try {
            const res = await fetch(`/api/pedidos/${id}`);
            if (!res.ok) return `No encontré el pedido **#MG-${id}**.`;
            const p = await res.json();
            let info = `📦 **Estado del pedido #MG-${id}**\n`;
            info += `Estado: **${p.estado}**\n`;
            info += `Total: S/${p.total?.toFixed(2)}\n`;
            if (p.envio) {
                info += `Dirección: ${p.envio.direccion_entrega}\n`;
                info += `Envío: ${p.envio.estado || 'Pendiente'}\n`;
                if (p.envio.fecha_envio) info += `Fecha estimada: ${String(p.envio.fecha_envio).slice(0, 16)}\n`;
            }
            if (p.codigo_seguimiento) info += `Código: ${p.codigo_seguimiento}\n`;
            return info;
        } catch (e) {
            return `No pude obtener la información del pedido #MG-${id}.`;
        }
    }

    return null;
}

// ── Inyectar HTML del chatbot al final del body ──
(function injectChatbot() {
    const html = `
    <button class="chatbot-fab" id="chatbotFab" title="Asistente ${CHATBOT_CONFIG.siteName}" aria-label="Abrir chat">
        <i class="bi bi-robot fab-icon-open"></i>
        <i class="bi bi-x-lg fab-icon-close"></i>
    </button>

    <div class="chatbot-panel" id="chatbotPanel">
        <div class="chatbot-header">
            <div class="chatbot-header-icon">
                <i class="bi bi-robot"></i>
            </div>
            <div class="chatbot-header-info">
                <h6>Asistente ${CHATBOT_CONFIG.siteName}</h6>
                <small><i class="bi bi-circle-fill" style="font-size:.5rem;color:#4caf50;"></i> En línea</small>
            </div>
        </div>

        <div class="chatbot-messages" id="chatbotMessages">
            <div class="msg msg-bot">
                ¡Hola! Soy el asistente de <strong>${CHATBOT_CONFIG.siteName}</strong> 🛒<br>
                ¿En qué puedo ayudarte? Puedes preguntarme sobre productos, pedidos, delivery o promociones.
            </div>
        </div>

        <div class="quick-replies" id="chatbotQuickReplies">
            <button class="quick-reply-btn" onclick="enviarMensajeRapido('¿Qué productos tienen en oferta?')">🎯 Ofertas</button>
            <button class="quick-reply-btn" onclick="enviarMensajeRapido('¿Cómo rastrear mi pedido?')">📦 Rastrear</button>
            <button class="quick-reply-btn" onclick="enviarMensajeRapido('Horarios y zonas de reparto')">⏰ Horarios</button>
            <button class="quick-reply-btn" onclick="enviarMensajeRapido('Formas de pago')">💳 Pagos</button>
        </div>

        <div class="chatbot-input-wrap">
            <input type="text" class="chatbot-input" id="chatbotInput" placeholder="Escribe tu consulta..." autocomplete="off">
            <button class="chatbot-send" id="chatbotSend" aria-label="Enviar">
                <i class="bi bi-send-fill"></i>
            </button>
        </div>

        <div class="chatbot-whatsapp-bar">
            <i class="bi bi-whatsapp"></i>
            ¿Prefieres hablar por WhatsApp?
            <a href="https://wa.me/${CHATBOT_CONFIG.whatsappNumber}?text=Hola%2C%20necesito%20ayuda%20con%20mi%20pedido%20de%20${CHATBOT_CONFIG.siteName}" target="_blank" rel="noopener">Chatear ahora</a>
        </div>
    </div>
    `;

    // Insertar al final del body (después del footer)
    document.body.insertAdjacentHTML('beforeend', html);
})();

// ── UI: inicializar eventos ──
document.addEventListener('DOMContentLoaded', function () {
    const fab = document.getElementById('chatbotFab');
    const panel = document.getElementById('chatbotPanel');
    const input = document.getElementById('chatbotInput');
    const sendBtn = document.getElementById('chatbotSend');

    if (!fab || !panel) return;

    fab.addEventListener('click', function () {
        const isOpen = panel.classList.toggle('open');
        fab.classList.toggle('active', isOpen);
        if (isOpen) setTimeout(() => input?.focus(), 300);
    });

    // Cargar catalogo al iniciar
    fetchProductCatalog();

    function sendMessage() {
        const text = input?.value.trim();
        if (text && !isProcessing) {
            input.value = '';
            agregarMensajeUsuario(text);
            consultarGemini(text);
        }
    }

    sendBtn?.addEventListener('click', sendMessage);
    input?.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') sendMessage();
    });
});

// ── Funciones del chat ──

function agregarMensajeUsuario(texto) {
    const container = document.getElementById('chatbotMessages');
    if (!container) return;
    const div = document.createElement('div');
    div.className = 'msg msg-user';
    div.textContent = texto;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
    chatHistory.push({ role: 'user', parts: [{ text: texto }] });
}

function agregarMensajeBot(texto) {
    const container = document.getElementById('chatbotMessages');
    if (!container) return;
    const div = document.createElement('div');
    div.className = 'msg msg-bot';
    div.innerHTML = texto;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
    chatHistory.push({ role: 'model', parts: [{ text: texto.replace(/<[^>]*>/g, '') }] });
}

function mostrarTyping() {
    const container = document.getElementById('chatbotMessages');
    if (!container) return;
    const div = document.createElement('div');
    div.className = 'typing-indicator';
    div.id = 'chatbotTyping';
    div.innerHTML = '<span></span><span></span><span></span>';
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

function ocultarTyping() {
    const el = document.getElementById('chatbotTyping');
    if (el) el.remove();
}

function enviarMensajeRapido(texto) {
    const input = document.getElementById('chatbotInput');
    if (input && !isProcessing) {
        input.value = texto;
        const sendBtn = document.getElementById('chatbotSend');
        sendBtn?.click();
    }
}

// ── Gemini API ──

async function consultarGemini(mensajeUsuario) {
    isProcessing = true;
    mostrarTyping();

    const accionPedido = await procesarAccionPedido(mensajeUsuario);
    if (accionPedido) {
        ocultarTyping();
        agregarMensajeBot(formatearRespuesta(accionPedido));
        isProcessing = false;
        return;
    }

    if (chatHistory.length > 40) {
        chatHistory = chatHistory.slice(-40);
    }

    const pedidoInfo = await buscarPedido(mensajeUsuario);
    const fullPrompt = SYSTEM_PROMPT + (productCatalog || '') + (pedidoInfo || '');

    const contents = [
        { role: 'user', parts: [{ text: fullPrompt }] },
        { role: 'model', parts: [{ text: 'Entendido. Soy el asistente de MassGo y solo responderé sobre eso.' }] },
        ...chatHistory,
    ];

    try {
        const res = await fetch('/api/ai/gemini-proxy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents,
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 500,
                    topP: 0.9,
                },
            }),
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.detail || `HTTP ${res.status}`);
        }

        const texto = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Lo siento, no pude procesar tu consulta. Intenta de nuevo.';
        ocultarTyping();
        agregarMensajeBot(formatearRespuesta(texto));
    } catch (e) {
        ocultarTyping();
        agregarMensajeBot(`Lo siento, tuve un problema al conectarme. Por favor intenta de nuevo. ${e.message ? '(<em>' + e.message + '</em>)' : ''}`);
    } finally {
        isProcessing = false;
    }
}

function formatearRespuesta(texto) {
    return texto
        .replace(/\n\n/g, '<br><br>')
        .replace(/\n/g, '<br>')
        .replace(/\*([^*]+)\*/g, '<strong>$1</strong>');
}
