(function() {
    const pagina = window.location.pathname.split('/').pop() || 'index.html';

    let usuarioActual = null;
    let nombreActual  = null;

    function init() {
        renderNavbar();
        setTimeout(async () => {
            try {
                if (typeof massgo !== 'undefined') {
                    const { data } = await massgo.auth.getSession();
                    if (data?.session?.user) {
                        const u = data.session.user;
                        usuarioActual = u;
                        const n2 = u.user_metadata?.nombres || '';
                        const a2 = u.user_metadata?.apellidos || '';
                        nombreActual = `${n2} ${a2}`.trim() || u.email?.split('@')[0] || 'Usuario';
                        actualizarNav(nombreActual);
                    }
                    massgo.auth.onAuthStateChange((event, session) => {
                        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                            const u = session.user;
                            usuarioActual = u;
                            const n = u.user_metadata?.nombres || '';
                            const a = u.user_metadata?.apellidos || '';
                            nombreActual = `${n} ${a}`.trim() || u.email?.split('@')[0] || 'Usuario';
                            actualizarNav(nombreActual);
                        } else if (event === 'SIGNED_OUT') {
                            usuarioActual = null;
                            nombreActual = null;
                            actualizarNav(null);
                        }
                    });
                } else {
                    const ls = JSON.parse(localStorage.getItem('massgo_usuario') || 'null');
                    if (ls?.logueado) {
                        nombreActual = ls.nombre;
                        actualizarNav(nombreActual);
                    } else {
                        actualizarNav(null);
                    }
                }
            } catch (e) {
                console.warn('Navbar auth error:', e);
            }
        }, 0);
    }

    function renderNavbar() {
        const logueado = nombreActual !== null;

        const authLinks = logueado
            ? `<li class="nav-item d-flex align-items-center gap-1">
                   <a class="nav-link" href="#" onclick="event.preventDefault(); cerrarSesion()" title="Cerrar sesión">
                       <i class="bi bi-person-check"></i> Hola, <strong>${nombreActual}</strong>
                       <i class="bi bi-box-arrow-right ms-2" style="opacity:.5;"></i>
                   </a>
               </li>
               <div class="nav-divider d-none d-lg-block"></div>
               <li class="nav-item">
                   <a class="btn btn-registrarse${pagina === 'registro.html' ? ' active' : ''}" href="registro.html">
                       Registrarse
                   </a>
               </li>`
            : `<li class="nav-item">
                   <a class="nav-link${pagina === 'login.html' ? ' active' : ''}" href="login.html">
                       <i class="bi bi-person"></i> Iniciar sesión
                   </a>
               </li>
               <div class="nav-divider d-none d-lg-block"></div>
               <li class="nav-item">
                   <a class="btn btn-registrarse${pagina === 'registro.html' ? ' active' : ''}" href="registro.html">
                       Registrarse
                   </a>
               </li>`;

        const html = `
        <nav class="navbar navbar-expand-lg navbar-massgo sticky-top">
            <div class="container-fluid">

                <a class="navbar-brand" href="index.html">
                    <div class="brand-icon">
                        <img src="img/apple-touch-icon.png" alt="MASSGO" style="width:28px;height:28px;border-radius:7px;">
                    </div>
                    MASSGO
                </a>

                <div class="navbar-search">
                    <i class="bi bi-search"></i>
                    <input type="text" id="inputBusqueda"
                           placeholder="Busca productos, marcas y más..."
                           autocomplete="off">
                    <button class="voice-btn-nav" onclick="iniciarBusquedaVoz()" title="Buscar por voz">
                        <i class="bi bi-mic-fill"></i>
                    </button>
                    <button class="scan-btn-nav" onclick="escanearProducto()" title="Escanear producto con cámara">
                        <i class="bi bi-camera-fill"></i>
                    </button>
                    <div class="suggestions-container" id="suggestionsContainer"></div>
                </div>

                <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav ms-auto align-items-center gap-1">
                        <li class="nav-item">
                            <a class="nav-link${pagina === 'index.html' || pagina === '' ? ' active' : ''}"
                               href="${pagina === 'index.html' || pagina === '' ? '#mas-productos' : 'index.html#mas-productos'}"
                               ${pagina === 'index.html' || pagina === '' ? 'onclick="event.preventDefault(); document.getElementById(\'mas-productos\').scrollIntoView({behavior:\'smooth\'})"' : ''}>
                                <i class="bi bi-grid"></i> Catálogo
                            </a>
                        </li>
                        ${authLinks}
                        <li class="nav-item ms-2 d-none d-lg-block">
                            <button class="btn-carrito-nav" onclick="irAlCarrito()">
                                <i class="bi bi-cart3"></i>
                                <span id="contadorCarrito" class="carrito-badge">0</span>
                            </button>
                        </li>
                    </ul>
                </div>

                <div class="d-flex align-items-center gap-2 d-lg-none">
                    <button class="btn-carrito-nav" onclick="irAlCarrito()">
                        <i class="bi bi-cart3"></i>
                        <span id="contadorCarritoMobile" class="carrito-badge">0</span>
                    </button>
                    <button class="navbar-toggler border-0" type="button"
                            data-bs-toggle="collapse" data-bs-target="#navbarNav">
                        <i class="bi bi-list" style="font-size:1.6rem;"></i>
                    </button>
                </div>

            </div>
        </nav>`;

        document.body.insertAdjacentHTML('afterbegin', html);

        // ── Smart Search ──
        function _renderSuggestions(container, items, label) {
            if (!items || items.length === 0) {
                container.innerHTML = '<div class="suggestion-item disabled">No se encontraron productos</div>';
                container.classList.add('show');
                return;
            }
            const header = label ? `<div class="search-panel-header">${label}</div>` : '';
            container.innerHTML = header + items.map(p => `
                <div class="suggestion-item" onclick="selectSuggestion(${p.id})">
                    <img class="suggestion-img" src="${p.imagen}" alt="${p.nombre}" loading="lazy"
                         onerror="this.src='https://images.unsplash.com/photo-1542838132-92c53300491e?w=80&h=80&fit=crop'">
                    <div class="suggestion-info">
                        <span class="suggestion-name">${p.nombre}</span>
                        <span class="suggestion-cat">${p.categoria || ''}</span>
                    </div>
                    <span class="suggestion-price">S/ ${p.precio.toFixed(2)}</span>
                </div>`).join('');
            container.classList.add('show');
        }

        window.initSmartSearch = function() {
            const input = document.getElementById('inputBusqueda');
            const container = document.getElementById('suggestionsContainer');
            if (!input || !container) return;

            input.addEventListener('focus', function() {
                const q = this.value.trim();
                if (!q) {
                    const prods = window.productos || [];
                    const shuffled = [...prods].sort(() => Math.random() - 0.5).slice(0, 5);
                    _renderSuggestions(container, shuffled, 'Productos recomendados');
                    return;
                }
                const filtered = (window.productos || []).filter(p =>
                    p.nombre.toLowerCase().includes(q.toLowerCase()) ||
                    p.categoria.toLowerCase().includes(q.toLowerCase())
                ).slice(0, 8);
                _renderSuggestions(container, filtered, 'Resultados');
            });

            input.addEventListener('input', function() {
                clearTimeout(this._debounce);
                const q = this.value.trim();
                if (!q) { container.classList.remove('show'); return; }
                this._debounce = setTimeout(() => {
                    const filtered = (window.productos || []).filter(p =>
                        p.nombre.toLowerCase().includes(q.toLowerCase()) ||
                        p.categoria.toLowerCase().includes(q.toLowerCase()) ||
                        (p.descripcion || '').toLowerCase().includes(q.toLowerCase())
                    ).slice(0, 8);
                    _renderSuggestions(container, filtered, 'Resultados');
                }, 150);
            });

            input.addEventListener('blur', () => setTimeout(() => container.classList.remove('show'), 250));
        };

        window.selectSuggestion = function(id) {
            window.location.href = 'producto.html?id=' + id;
        };

        window.initSmartSearch();

        function _syncContadores(total) {
            ['contadorCarrito', 'contadorCarritoMobile'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.textContent = total;
            });
        }

        if (typeof actualizarContadorCarrito === 'function') {
            actualizarContadorCarrito();
        } else {
            const carrito = JSON.parse(localStorage.getItem('massgo_carrito') || '[]');
            const total   = carrito.reduce((s, i) => s + i.cantidad, 0);
            _syncContadores(total);
        }
    }

    function actualizarNav(nombre) {
        const nav = document.querySelector('.navbar-massgo');
        if (!nav) return;
        const ul = nav.querySelector('.navbar-nav');
        if (!ul) return;
        const isAuthPage = window.location.pathname.includes('login.html') || window.location.pathname.includes('registro.html');
        if (nombre) {
            ul.innerHTML = `
                <li class="nav-item">
                    <a class="nav-link" href="${window.location.pathname.includes('index.html') ? '#mas-productos' : 'index.html#mas-productos'}">
                        <i class="bi bi-grid"></i> Catálogo
                    </a>
                </li>
                <li class="nav-item d-flex align-items-center gap-1">
                    <a class="nav-link" href="#" onclick="event.preventDefault(); cerrarSesion()">
                        <i class="bi bi-person-check"></i> Hola, <strong>${nombre}</strong>
                        <i class="bi bi-box-arrow-right ms-2" style="opacity:.5;"></i>
                    </a>
                </li>
                <li class="nav-item ms-1 d-none d-lg-block">
                    <button class="btn-carrito-nav" onclick="irAlCarrito()">
                        <i class="bi bi-cart3"></i>
                        <span id="contadorCarrito" class="carrito-badge">0</span>
                    </button>
                </li>`;
        } else if (!isAuthPage) {
            ul.innerHTML = `
                <li class="nav-item">
                    <a class="nav-link" href="index.html#mas-productos"><i class="bi bi-grid"></i> Catálogo</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="login.html"><i class="bi bi-person"></i> Iniciar sesión</a>
                </li>
                <div class="nav-divider d-none d-lg-block"></div>
                <li class="nav-item">
                    <a class="btn btn-registrarse" href="registro.html">Registrarse</a>
                </li>
                <li class="nav-item ms-1 d-none d-lg-block">
                    <button class="btn-carrito-nav" onclick="irAlCarrito()">
                        <i class="bi bi-cart3"></i>
                        <span id="contadorCarrito" class="carrito-badge">0</span>
                    </button>
                </li>`;
        }
        const total = (JSON.parse(localStorage.getItem('massgo_carrito') || '[]')).reduce((s, i) => s + i.cantidad, 0);
        nav.querySelectorAll('.carrito-badge').forEach(el => el.textContent = total);
    }

    init();
})();

async function cerrarSesion() {
    if (typeof massgoLogout === 'function') {
        try {
            await massgoLogout();
        } catch (_) {}
    }
    localStorage.removeItem('massgo_usuario');
    window.location.href = 'index.html';
}
