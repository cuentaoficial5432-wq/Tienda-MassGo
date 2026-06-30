function getCarrito() {
    const data = localStorage.getItem('massgo_carrito');
    return data ? JSON.parse(data) : [];
}

function setCarrito(carrito) {
    localStorage.setItem('massgo_carrito', JSON.stringify(carrito));
}

function buscarProductoPorId(id) {
    if (window.productos) {
        const p = window.productos.find(p => p.id === id);
        if (p) return p;
    }
    return null;
}

function agregarAlCarrito(productoId, cantidad = 1) {
    let producto = buscarProductoPorId(productoId);
    if (!producto) return;
    if (producto.stock === 0) {
        mostrarToast('Producto sin stock disponible', 'warning');
        return;
    }
    let carrito = getCarrito();
    const idx = carrito.findIndex(i => i.id === productoId);
    if (idx >= 0) {
        carrito[idx].cantidad += cantidad;
    } else {
        carrito.push({
            id: producto.id,
            nombre: producto.nombre,
            precio: producto.precio,
            imagen: producto.imagen,
            cantidad: cantidad,
            stock: producto.stock,
        });
    }
    setCarrito(carrito);
    actualizarContadorCarrito();
    mostrarToast(`"${producto.nombre}" agregado al carrito`);
}

// Para páginas donde window.productos no está disponible (carrito, etc.)
function agregarAlCarritoDirecto(id, nombre, precio, imagen, stock = 99, cantidad = 1) {
    if (stock === 0) {
        mostrarToast('Producto sin stock disponible', 'warning');
        return;
    }
    let carrito = getCarrito();
    const idx = carrito.findIndex(i => i.id === id);
    if (idx >= 0) {
        carrito[idx].cantidad += cantidad;
    } else {
        carrito.push({ id, nombre, precio, imagen, cantidad, stock });
    }
    setCarrito(carrito);
    actualizarContadorCarrito();
    mostrarToast(`"${nombre}" agregado al carrito`);
}

function eliminarDelCarrito(productoId) {
    let carrito = getCarrito();
    carrito = carrito.filter(i => i.id !== productoId);
    setCarrito(carrito);
    actualizarContadorCarrito();
}

function cambiarCantidad(productoId, delta) {
    let carrito = getCarrito();
    const idx = carrito.findIndex(i => i.id === productoId);
    if (idx < 0) return;
    carrito[idx].cantidad += delta;
    if (carrito[idx].cantidad <= 0) carrito.splice(idx, 1);
    setCarrito(carrito);
    actualizarContadorCarrito();
}

function vaciarCarrito() {
    setCarrito([]);
    actualizarContadorCarrito();
}

function getTotalCarrito() {
    return getCarrito().reduce((sum, i) => sum + i.precio * i.cantidad, 0);
}

function getCantidadTotal() {
    return getCarrito().reduce((sum, i) => sum + i.cantidad, 0);
}

function actualizarContadorCarrito() {
    const total = getCantidadTotal();
    ['contadorCarrito', 'contadorCarritoMobile'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = total;
    });
}

function mostrarToast(mensaje, tipo = 'success') {
    const alerta = document.getElementById('alertaCarrito');
    if (!alerta) return;
    const iconos = { success: 'fa-check-circle', warning: 'fa-exclamation-triangle', error: 'fa-times-circle' };
    const colores = { success: 'linear-gradient(135deg, #fe0c65, #ff4d8a)', warning: 'linear-gradient(135deg, #f1b81b, #ff9500)', error: 'linear-gradient(135deg, #e53935, #ef5350)' };
    alerta.innerHTML = `<i class="fas ${iconos[tipo] || iconos.success} me-2"></i> ${mensaje}`;
    alerta.style.background = colores[tipo] || colores.success;
    alerta.style.display = 'block';
    setTimeout(() => { alerta.style.display = 'none'; }, 2800);
}

function generarNumeroPedido() {
    return '#MG-' + Math.floor(1000000 + Math.random() * 9000000);
}

document.addEventListener('DOMContentLoaded', () => {
    actualizarContadorCarrito();
});

window.addEventListener('storage', function(e) {
    if (e.key === 'massgo_carrito') actualizarContadorCarrito();
});

document.addEventListener('visibilitychange', function() {
    if (!document.hidden) actualizarContadorCarrito();
});

/* ── Búsqueda por voz (global para todo el sitio) ── */
window.reconocimientoVoz = null;
window.iniciarBusquedaVoz = function() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        const inp = document.getElementById('inputBusqueda');
        if (inp) { inp.focus(); inp.click(); }
        return;
    }
    if (window.reconocimientoVoz) {
        window.reconocimientoVoz.stop();
    }
    const recognition = new SpeechRecognition();
    window.reconocimientoVoz = recognition;
    recognition.lang = 'es-PE';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    const btn = document.querySelector('.voice-btn-nav');
    if (btn) {
        btn.innerHTML = '<i class="bi bi-mic-fill" style="color:var(--rosa-fuerte);"></i>';
        btn.style.background = 'var(--rosa-pastel)';
        btn.style.animation = 'pulse 1s infinite';
    }

    const onEnd = () => {
        if (btn) {
            btn.innerHTML = '<i class="bi bi-mic-fill"></i>';
            btn.style.background = '';
            btn.style.animation = '';
        }
    };

    recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        const input = document.getElementById('inputBusqueda');
        if (input) {
            input.value = transcript;
            input.focus();
            input.dispatchEvent(new Event('input', { bubbles: true }));
        }
        onEnd();
    };
    recognition.onerror = onEnd;
    recognition.onend = onEnd;
    recognition.start();
};

function escanearProducto() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async function(e) {
        const file = e.target.files[0];
        if (!file) return;

        const container = document.getElementById('suggestionsContainer');

        container.innerHTML = '<div class="suggestion-item disabled" style="justify-content:center;gap:8px;"><div class="spinner-border spinner-border-sm" style="color:var(--rosa-fuerte);"></div> Analizando imagen...</div>';
        container.classList.add('show');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/ai/escanear-producto', { method: 'POST', body: formData });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                container.innerHTML = `<div class="suggestion-item disabled">${err.detail || 'No se pudo analizar la imagen'}</div>`;
                return;
            }
            const productos = await res.json();
            if (!productos || productos.length === 0) {
                container.innerHTML = '<div class="suggestion-item disabled">No se encontraron productos</div>';
                return;
            }
            container.innerHTML = '<div class="search-panel-header">Resultados del escaneo</div>' +
                productos.map(p => {
                    const pid = p.id_producto || p.id;
                    const img = p.imagen_url || p.imagen || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=80&h=80&fit=crop';
                    const cat = typeof p.categoria === 'object' ? p.categoria?.nombre || '' : p.categoria || '';
                    return `
                    <div class="suggestion-item" onclick="window.location.href='producto.html?id=${pid}'">
                        <img class="suggestion-img" src="${img}" alt="${p.nombre}"
                             loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1542838132-92c53300491e?w=80&h=80&fit=crop'">
                        <div class="suggestion-info">
                            <span class="suggestion-name">${p.nombre}</span>
                            <span class="suggestion-cat">${cat}</span>
                        </div>
                        <span class="suggestion-price">S/ ${Number(p.precio).toFixed(2)}</span>
                    </div>`;
                }).join('');
        } catch (e) {
            container.innerHTML = `<div class="suggestion-item disabled">Error de conexión: ${e.message}</div>`;
        }
    };
    input.click();
}

function mostrarModalLogin(mensaje) {
    const existing = document.getElementById('modalLoginRequerido');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'modalLoginRequerido';
    overlay.className = 'modal-overlay-login';
    overlay.innerHTML = `
        <div class="modal-box-login">
            <button class="modal-x-login" onclick="document.getElementById('modalLoginRequerido').remove()">
                <i class="bi bi-x-lg"></i>
            </button>
            <div class="modal-icon-login">
                <i class="bi bi-shield-lock-fill"></i>
            </div>
            <h3 class="modal-title-login">Inicia sesión</h3>
            <p class="modal-text-login">${mensaje || 'Debes iniciar sesión para acceder a esta funcionalidad.'}</p>
            <a href="login.html" class="modal-btn-login">Iniciar sesión</a>
            <button class="modal-close-login" onclick="document.getElementById('modalLoginRequerido').remove()">Continuar sin sesión</button>
        </div>`;
    document.body.appendChild(overlay);
}

async function irAlCarrito() {
    try {
        if (typeof massgo !== 'undefined' && massgo?.auth) {
            const { data: { user } } = await massgo.auth.getUser();
            if (!user) {
                mostrarModalLogin('Inicia sesión para acceder a tu carrito y disfrutar de la Lista Inteligente personalizada.');
                return;
            }
        }
    } catch (e) {
        /* si falla la verificación, igual permite acceso */
    }
    window.location.href = 'carrito.html';
}
