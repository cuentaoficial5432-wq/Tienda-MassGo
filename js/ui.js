/**
 * ui.js — Funciones de interfaz del catálogo (index.html)
 * Renderizado de productos locales, filtros, búsqueda y timer.
 * Depende de: massgo.js (PRODUCTOS, agregarAlCarrito)
 */

/* ─────────────────────────────────────────
   ESTADO DE PAGINACIÓN LOCAL
───────────────────────────────────────── */
const PRODUCTOS_POR_PAGINA = 8;   // 2 filas × 4 columnas
let _listaActual   = [];   // lista completa en uso (filtrada o completa)
let _paginaActual  = 1;    // página visible actualmente

/* ─────────────────────────────────────────
   HELPERS
───────────────────────────────────────── */

function renderEstrellas(rating) {
    let html = '';
    for (let i = 1; i <= 5; i++) {
        if (rating >= i)            html += '<i class="bi bi-star-fill" style="color:var(--amarillo-fuerte);font-size:.75rem;"></i>';
        else if (rating >= i - 0.5) html += '<i class="bi bi-star-half" style="color:var(--amarillo-fuerte);font-size:.75rem;"></i>';
        else                        html += '<i class="bi bi-star" style="color:#ddd;font-size:.75rem;"></i>';
    }
    return html;
}

function verProducto(id) {
    window.location.href = `producto.html?id=${id}`;
}

/* ─────────────────────────────────────────
   RENDER DE UNA CARD
───────────────────────────────────────── */

function _cardHTML(p) {
    return `
        <div class="col-6 col-md-3 fade-in-up">
            <div class="card-producto position-relative" onclick="verProducto(${p.id})">
                ${p.descuento > 0
                    ? `<span class="badge-oferta">-${p.descuento}%</span>`
                    : ''}
                ${p.badge && p.descuento === 0
                    ? `<span class="badge-oferta" style="background:var(--celeste-fuerte);color:white;">${p.badge}</span>`
                    : ''}
                <div class="img-container">
                    <img src="${p.imagen}" alt="${p.nombre}" loading="lazy">
                </div>
                <div class="card-body">
                    <div class="estrellas">${renderEstrellas(p.rating)}</div>
                    <div class="nombre-producto">${p.nombre}</div>
                    <div class="precio-producto">
                        S/ ${p.precio.toFixed(2)}
                        ${p.precioAntiguo
                            ? `<span class="precio-antiguo">S/ ${p.precioAntiguo.toFixed(2)}</span>`
                            : ''}
                    </div>
                    ${p.stock === 0
                        ? `<button class="btn-agregar" disabled style="background:#ccc;cursor:not-allowed;">Sin stock</button>`
                        : `<button class="btn-agregar" onclick="event.stopPropagation(); agregarAlCarrito(${p.id})">
                               <i class="bi bi-plus-lg me-1"></i> Agregar
                           </button>`
                    }
                </div>
            </div>
        </div>`;
}

/* ─────────────────────────────────────────
   RENDER GRID — muestra 6, expande con botón
───────────────────────────────────────── */

/**
 * Renderiza la lista de productos.
 * Siempre muestra los primeros 6; el resto se expande con "Ver más".
 * @param {Array}   lista       - Productos a mostrar
 * @param {boolean} expandir    - Si true, muestra todos (sin límite)
 */
function renderProductos(lista, expandir = false) {
    const grid    = document.getElementById('gridProductos');
    const wrapBtn = document.getElementById('wrapVerMasProductos');
    if (!grid) return;

    // Guardar lista actual para el botón "Ver más"
    _listaActual  = lista || [];
    _paginaActual = expandir ? 2 : 1;

    if (_listaActual.length === 0) {
        grid.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="bi bi-search" style="font-size:2.5rem;color:#ccc;"></i>
                <p class="text-muted mt-2">No se encontraron productos.</p>
            </div>`;
        if (wrapBtn) wrapBtn.style.display = 'none';
        return;
    }

    const visibles = expandir
        ? _listaActual
        : _listaActual.slice(0, PRODUCTOS_POR_PAGINA);

    grid.innerHTML = visibles.map(_cardHTML).join('');

    // Botón "Ver más" / "Ver menos"
    if (wrapBtn) {
        const hayMas = _listaActual.length > PRODUCTOS_POR_PAGINA;
        wrapBtn.style.display = hayMas ? 'block' : 'none';

        const btn = document.getElementById('btnVerMasProductos');
        if (btn) {
            if (expandir) {
                btn.innerHTML = '<i class="bi bi-chevron-up me-1"></i> Ver menos';
                btn.onclick = () => renderProductos(_listaActual, false);
            } else {
                btn.innerHTML = `<i class="bi bi-grid me-1"></i> Ver más productos (${_listaActual.length - PRODUCTOS_POR_PAGINA} restantes)`;
                btn.onclick = () => renderProductos(_listaActual, true);
            }
        }
    }
}

/* ─────────────────────────────────────────
   FILTROS Y BÚSQUEDA
───────────────────────────────────────── */

function filtrarProductos() {
    const q = document.getElementById('inputBusqueda').value.toLowerCase().trim();
    const filtrados = PRODUCTOS.filter(p =>
        p.nombre.toLowerCase().includes(q) ||
        p.categoria.toLowerCase().includes(q)
    );
    renderProductos(filtrados);
    document.getElementById('tituloSeccion').textContent =
        q ? `Resultados para "${q}"` : 'Recomendados para ti';

    const btnLimpiar = document.getElementById('btnLimpiarFiltro');
    if (btnLimpiar) btnLimpiar.classList.toggle('d-none', !q);
}

function filtrarPorCategoria(cat) {
    const filtrados = PRODUCTOS.filter(p => p.categoria === cat);
    renderProductos(filtrados);
    document.getElementById('tituloSeccion').textContent = cat;
    document.getElementById('btnLimpiarFiltro').classList.remove('d-none');
    document.getElementById('catalogo').scrollIntoView({ behavior: 'smooth' });
}

function limpiarFiltro() {
    renderProductos(PRODUCTOS);
    document.getElementById('tituloSeccion').textContent = 'Recomendados para ti';
    document.getElementById('btnLimpiarFiltro').classList.add('d-none');
    const inp = document.getElementById('inputBusqueda');
    if (inp) inp.value = '';
}

/* ─────────────────────────────────────────
   TIMER OFERTAS RELÁMPAGO
───────────────────────────────────────── */

function iniciarTimer() {
    let total = 2 * 3600 + 30 * 60;
    const el = document.getElementById('timerOferta');
    if (!el) return;

    setInterval(() => {
        if (total > 0) total--;
        const h = String(Math.floor(total / 3600)).padStart(2, '0');
        const m = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
        const s = String(total % 60).padStart(2, '0');
        el.textContent = `${h}:${m}:${s}`;
    }, 1000);
}
