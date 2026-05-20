/**
 * navbar.js — Inyecta el navbar unificado en todas las páginas
 * Detecta la página actual para marcar el link activo.
 * Detecta sesión en localStorage para mostrar usuario o links de auth.
 */

(function() {
    const pagina   = window.location.pathname.split('/').pop() || 'index.html';
    const usuario  = JSON.parse(localStorage.getItem('massgo_usuario') || 'null');
    const logueado = usuario && usuario.logueado;

    /* ── Links de autenticación ── */
    const authLinks = logueado
        ? `<li class="nav-item d-flex align-items-center gap-1">
               <span class="nav-link" style="cursor:default;">
                   <i class="bi bi-person-check"></i>
                   Hola, <strong>${usuario.nombre}</strong>
               </span>
               <a class="nav-link" href="#" onclick="cerrarSesion()" title="Cerrar sesión"
                  style="color:rgba(255,255,255,.6)!important;padding:6px 8px!important;">
                   <i class="bi bi-box-arrow-right"></i>
               </a>
           </li>`
        : `<li class="nav-item">
               <a class="nav-link${pagina === 'login.html' ? ' active' : ''}" href="login.html">
                   <i class="bi bi-person"></i> Iniciar sesión
               </a>
           </li>
           <div class="nav-divider d-none d-lg-block"></div>
           <li class="nav-item">
               <a class="nav-link btn-registrarse${pagina === 'registro.html' ? ' active' : ''}" href="registro.html">
                   Registrarse
               </a>
           </li>`;

    /* ── Carrito ── */
    const carritoBtn = `
        <li class="nav-item ms-1">
            <button class="btn-carrito-nav" onclick="window.location.href='carrito.html'">
                <i class="bi bi-cart3"></i>
                <span id="contadorCarrito" class="carrito-badge">0</span>
            </button>
        </li>`;

    /* ── HTML del navbar ── */
    const html = `
    <nav class="navbar navbar-expand-lg navbar-massgo sticky-top">
        <div class="container-fluid px-3 px-lg-5">

            <a class="navbar-brand me-3" href="index.html">
                <div class="brand-icon"><i class="bi bi-bag-fill"></i></div>
                MASSGO
            </a>

            <div class="navbar-search d-none d-lg-block">
                <i class="bi bi-search"></i>
                <input type="text"
                       id="inputBusqueda"
                       placeholder="Busca productos, marcas y más..."
                       autocomplete="off"
                       oninput="typeof filtrarProductos === 'function' && filtrarProductos()">
            </div>

            <!-- Carrito siempre visible + toggler en mobile -->
            <div class="d-flex align-items-center gap-2 ms-auto d-lg-none">
                <button class="btn-carrito-nav" onclick="window.location.href='carrito.html'">
                    <i class="bi bi-cart3"></i>
                    <span id="contadorCarritoMobile" class="carrito-badge">0</span>
                </button>
                <button class="navbar-toggler border-0" type="button"
                        data-bs-toggle="collapse" data-bs-target="#navbarNav"
                        style="color:white;padding:4px 6px;">
                    <i class="bi bi-list" style="font-size:1.5rem;"></i>
                </button>
            </div>

            <div class="collapse navbar-collapse flex-grow-0 ms-3" id="navbarNav">
                <ul class="navbar-nav align-items-center gap-1">
                    <li class="nav-item">
                        <a class="nav-link${pagina === 'index.html' || pagina === '' ? ' active' : ''}"
                           href="${pagina === 'index.html' || pagina === '' ? '#mas-productos' : 'index.html#mas-productos'}"
                           ${pagina === 'index.html' || pagina === '' ? 'onclick="event.preventDefault(); document.getElementById(\'mas-productos\').scrollIntoView({behavior:\'smooth\'})"' : ''}>
                            <i class="bi bi-grid"></i> Catálogo
                        </a>
                    </li>
                    ${authLinks}
                    <!-- Carrito en desktop -->
                    <li class="nav-item ms-1 d-none d-lg-block">
                        <button class="btn-carrito-nav" onclick="window.location.href='carrito.html'">
                            <i class="bi bi-cart3"></i>
                            <span id="contadorCarrito" class="carrito-badge">0</span>
                        </button>
                    </li>
                </ul>
            </div>

        </div>
    </nav>`;

    /* ── Inyectar antes del primer elemento del body ── */
    document.body.insertAdjacentHTML('afterbegin', html);

    /* ── Actualizar contador del carrito ── */
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
})();

/* ── Cerrar sesión (global) ── */
function cerrarSesion() {
    localStorage.removeItem('massgo_usuario');
    window.location.href = 'index.html';
}
