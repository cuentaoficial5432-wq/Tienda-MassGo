const CATALOGO_POR_PAGINA = 8;
let _listaCatalogo = null;
let _catalogoExpandido = false;
let _recomendacionesIA = [];

const CATEGORIA_ESTILOS = {
    'Bebidas':   { icono: 'bi-droplet-fill',   color: '#43A047', bg: '#E8F5E9', id: 'cc-bebidas' },
    'Snacks':    { icono: 'bi-bag-heart-fill',  color: '#F9A825', bg: '#FFF8E1', id: 'cc-snacks' },
    'Lácteos':   { icono: 'bi-cup-straw',       color: '#1E88E5', bg: '#E3F2FD', id: 'cc-lacteos' },
    'Limpieza':  { icono: 'bi-stars',           color: '#8E24AA', bg: '#F3E5F5', id: 'cc-limpieza' },
    'Abarrotes': { icono: 'bi-box-seam-fill',   color: '#FF6B35', bg: '#FFF0E6', id: 'cc-abarrotes' },
};

const CACHE_KEY = 'massgo_cache';
const CACHE_TTL = 300000; // 5 min

function _cacheGet(key) {
    try {
        const raw = sessionStorage.getItem(CACHE_KEY + '_' + key);
        if (!raw) return null;
        const { ts, data } = JSON.parse(raw);
        if (Date.now() - ts > CACHE_TTL) { sessionStorage.removeItem(CACHE_KEY + '_' + key); return null; }
        return data;
    } catch { return null; }
}
function _cacheSet(key, data) {
    try { sessionStorage.setItem(CACHE_KEY + '_' + key, JSON.stringify({ ts: Date.now(), data })); } catch {}
}

function _transformarProducto(p) {
    const catObj = p.categoria || {};
    return {
        id: p.id_producto,
        nombre: p.nombre,
        descripcion: p.descripcion || '',
        precio: p.precio,
        stock: p.stock,
        estado: p.estado || 'Disponible',
        imagen: p.imagen_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&h=300&fit=crop',
        categoria: catObj.nombre || '',
        categoria_id: p.id_categoria,
        es_oferta_flash: p.es_oferta_flash || false,
    };
}

async function fetchProductos() {
    const grid = document.getElementById('gridProductos');

    // Try cache first
    const cached = _cacheGet('productos');
    if (cached && cached.length > 0) {
        window.productos = cached;
        renderRecomendados(window.productos);
        renderCatalogo(window.productos);
        renderOfertasFlash();
        fetchCategorias();
        // Refresh in background (skip render, already rendered from cache)
        setTimeout(() => _fetchProductosFresh(grid, true), 100);
        return;
    }

    _fetchProductosFresh(grid, false);
}

async function _fetchProductosFresh(grid, skipRender) {
    if (!skipRender && grid) grid.innerHTML = '<div class="col-12 text-center py-5"><div class="spinner-border" style="color:var(--rosa-fuerte);" role="status"></div></div>';

    try {
        const res = await fetch('/api/productos/?limite=200');
        const data = await res.json();
        const lista = Array.isArray(data) ? data : (data.value || []);
        window.productos = lista.map(_transformarProducto);
        _cacheSet('productos', window.productos);
    } catch (e) {
        console.error('Error al cargar productos:', e);
        window.productos = [];
        if (grid) grid.innerHTML = '<div class="col-12 text-center py-5"><i class="bi bi-exclamation-triangle" style="font-size:2.5rem;color:#ccc;"></i><p class="text-muted mt-2">Error al cargar productos.</p></div>';
        return;
    }

    await Promise.all([
        cargarRecomendacionesIA(),
        fetchCategorias(),
    ]);
    if (!skipRender) {
        renderRecomendados(window.productos);
        renderCatalogo(window.productos);
        renderOfertasFlash();
    }
}

async function cargarRecomendacionesIA() {
    try {
        if (!_cacheGet('ia_entrenado')) {
            const res = await fetch('/api/ai/entrenar/recomendaciones', { method: 'POST' });
            if (!res.ok) throw new Error('Error al entrenar modelo');
            _cacheSet('ia_entrenado', true);
        }

        const recRes = await fetch('/api/ai/recomendar/producto', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ producto_id: 1, top_n: 6 })
        });
        if (recRes.ok) {
            _recomendacionesIA = await recRes.json();
        }
    } catch (e) {
        console.warn('No se pudieron cargar recomendaciones IA:', e);
        _recomendacionesIA = [];
    }
}

async function fetchCategorias() {
    try {
        const res = await fetch('/api/productos/categorias');
        const data = await res.json();
        const cats = Array.isArray(data) ? data : (data.value || []);
        renderCategorias(cats);
    } catch (e) {
        console.error('Error al cargar categorias:', e);
    }
}

function _estrellas(rating) {
    let html = '';
    for (let i = 1; i <= 5; i++) {
        if (rating >= i) html += '<i class="bi bi-star-fill" style="color:var(--amarillo-fuerte);font-size:.75rem;"></i>';
        else html += '<i class="bi bi-star" style="color:#ddd;font-size:.75rem;"></i>';
    }
    return html;
}

function _cardHTML(p) {
    const stars = Math.floor(Math.random() * 2) + 4;
    return `
        <div class="col-6 col-md-3 fade-in-up">
            <div class="card-producto position-relative" onclick="window.location.href='producto.html?id=${p.id}'">
                ${p.es_oferta_flash ? '<span class="badge-oferta"><i class="bi bi-lightning-fill me-1"></i>OFERTA</span>' : ''}
                <div class="img-container">
                    <img src="${p.imagen}" alt="${p.nombre}" loading="lazy"
                         onerror="this.src='https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&h=300&fit=crop'">
                </div>
                <div class="card-body">
                    ${p.categoria ? `<div class="cat-tag">${p.categoria}</div>` : ''}
                    <div class="nombre-producto">${p.nombre}</div>
                    <div class="estrellas">${_estrellas(stars)}</div>
                    <div class="precio-producto">S/ ${p.precio.toFixed(2)}</div>
                    ${p.stock === 0
                        ? `<button class="btn-agregar" disabled>Sin stock</button>`
                        : `<button class="btn-agregar" onclick="event.stopPropagation(); agregarAlCarrito(${p.id})">
                               <i class="bi bi-plus-lg"></i> Agregar
                           </button>`
                    }
                </div>
            </div>
        </div>`;
}

/* ── RECOMENDADOS PARA TI (IA + fallback a populares) ── */
function renderRecomendados(lista) {
    const grid = document.getElementById('gridProductos');
    if (!grid) return;
    if (!lista || lista.length === 0) {
        grid.innerHTML = '<div class="col-12 text-center py-5"><i class="bi bi-search" style="font-size:2.5rem;color:#ccc;"></i><p class="text-muted mt-2">No hay productos disponibles.</p></div>';
        return;
    }

    let recomendados;
    if (_recomendacionesIA && _recomendacionesIA.length > 0) {
        recomendados = _recomendacionesIA.map(r => {
            const p = lista.find(x => x.id === (r.id_producto || r.id));
            return p || null;
        }).filter(Boolean);
    }

    if (!recomendados || recomendados.length < 4) {
        recomendados = [...lista].sort((a, b) => {
            const aScore = (a.stock > 0 ? 1 : 0) + (a.es_oferta_flash ? 2 : 0);
            const bScore = (b.stock > 0 ? 1 : 0) + (b.es_oferta_flash ? 2 : 0);
            return bScore - aScore;
        });
    }

    grid.innerHTML = recomendados.slice(0, 4).map(_cardHTML).join('');
}

/* ── CATÁLOGO DE PRODUCTOS (8 + Ver más) ── */
function renderCatalogo(lista, expandir) {
    const grid = document.getElementById('gridCatalogo');
    const wrapBtn = document.getElementById('wrapVerMasCatalogo');
    const counterEl = document.getElementById('catalogoCounter');
    if (!grid) return;

    if (expandir !== undefined) _catalogoExpandido = expandir;
    _listaCatalogo = lista;

    if (!lista || lista.length === 0) {
        grid.innerHTML = '<div class="col-12 text-center py-5"><i class="bi bi-search" style="font-size:2.5rem;color:#ccc;"></i><p class="text-muted mt-2">No se encontraron productos.</p></div>';
        if (wrapBtn) wrapBtn.style.display = 'none';
        if (counterEl) counterEl.textContent = '0 productos';
        return;
    }

    const visibles = _catalogoExpandido ? lista : lista.slice(0, CATALOGO_POR_PAGINA);
    grid.innerHTML = visibles.map(_cardHTML).join('');

    if (counterEl) {
        const total = lista.length;
        const mostrando = visibles.length;
        counterEl.textContent = total <= CATALOGO_POR_PAGINA
            ? `${total} productos`
            : `Mostrando ${mostrando} de ${total} productos`;
    }

    if (wrapBtn) {
        const hayMas = lista.length > CATALOGO_POR_PAGINA;
        const btn = document.getElementById('btnVerMasCatalogo');
        if (btn) {
            if (_catalogoExpandido) {
                wrapBtn.style.display = 'block';
                btn.innerHTML = '<i class="bi bi-chevron-up me-1"></i> Ver menos';
                btn.onclick = () => renderCatalogo(lista, false);
            } else if (hayMas) {
                wrapBtn.style.display = 'block';
                btn.innerHTML = `<i class="bi bi-grid me-1"></i> Ver más productos (${lista.length - CATALOGO_POR_PAGINA} restantes)`;
                btn.onclick = () => renderCatalogo(lista, true);
            } else {
                wrapBtn.style.display = 'none';
            }
        }
    }
}

/* ── VISTA POR CATEGORIA (reemplaza todo el contenido principal) ── */
let _categoriaActiva = null;
let _categoriaProductos = [];
let _categoriaPagina = 0;
const CATEGORIA_POR_PAGINA = 8;

function filtrarPorCategoria(cat) {
    if (!window.productos) return;
    const filtrados = window.productos.filter(p => p.categoria === cat);
    if (filtrados.length === 0) return;

    _categoriaActiva = cat;
    _categoriaProductos = filtrados;
    _categoriaPagina = 0;

    // Ocultar contenido principal
    document.getElementById('contenidoPrincipal').classList.add('categoria-oculta');

    // Configurar y mostrar vista de categoría
    const sec = document.getElementById('productos-por-categoria');
    const grid = document.getElementById('categoriaProductosGrid');
    const nombreEl = document.getElementById('categoriaNombre');
    const counterEl = document.getElementById('categoriaCounter');
    if (!sec || !grid || !nombreEl) return;

    nombreEl.textContent = cat;
    if (counterEl) counterEl.textContent = `${filtrados.length} productos`;

    renderCategoriaProductos();
    sec.classList.add('show');
    sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderCategoriaProductos() {
    const grid = document.getElementById('categoriaProductosGrid');
    const wrapBtn = document.getElementById('wrapVerMasCategoria');
    const counterEl = document.getElementById('categoriaCounter');
    if (!grid) return;

    const start = _categoriaPagina * CATEGORIA_POR_PAGINA;
    const visibles = _categoriaProductos.slice(start, start + CATEGORIA_POR_PAGINA);

    if (visibles.length === 0) {
        grid.innerHTML = '<div class="col-12 text-center py-5"><i class="bi bi-search" style="font-size:2.5rem;color:#ccc;"></i><p class="text-muted mt-2">No hay productos en esta categoría.</p></div>';
        if (wrapBtn) wrapBtn.style.display = 'none';
        return;
    }

    grid.innerHTML = visibles.map(_cardHTML).join('');

    if (counterEl) {
        const total = _categoriaProductos.length;
        const showing = start + visibles.length;
        counterEl.textContent = total <= CATEGORIA_POR_PAGINA
            ? `${total} productos`
            : `Mostrando ${showing} de ${total} productos`;
    }

    if (wrapBtn) {
        const hayMas = start + CATEGORIA_POR_PAGINA < _categoriaProductos.length;
        const btn = document.getElementById('btnVerMasCategoria');
        if (btn) {
            if (!hayMas && _categoriaPagina > 0) {
                // Ya mostró todos, botón para volver al inicio
                wrapBtn.style.display = 'block';
                btn.innerHTML = '<i class="bi bi-chevron-up me-1"></i> Ver menos';
                btn.onclick = () => { _categoriaPagina = 0; renderCategoriaProductos(); };
            } else if (hayMas) {
                wrapBtn.style.display = 'block';
                const restantes = _categoriaProductos.length - start - CATEGORIA_POR_PAGINA;
                btn.innerHTML = `<i class="bi bi-grid me-1"></i> Ver más productos (${restantes} restantes)`;
                btn.onclick = () => { _categoriaPagina++; renderCategoriaProductos(); };
            } else {
                wrapBtn.style.display = 'none';
            }
        }
    }
}

function limpiarCategoriaProductos() {
    const sec = document.getElementById('productos-por-categoria');
    const main = document.getElementById('contenidoPrincipal');

    if (sec) sec.classList.remove('show');
    if (main) main.classList.remove('categoria-oculta');

    _categoriaActiva = null;
    _categoriaProductos = [];
    _categoriaPagina = 0;

    // Scroll al inicio de la página
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ── LEGACY: filtrarProductos ya no modifica el catálogo inferior ── */
function filtrarProductos() {
    // Ahora solo sirve para mantener compatibilidad con el dropdown de búsqueda
    const q = document.getElementById('inputBusqueda').value.toLowerCase().trim();
    if (!q) {
        limpiarFiltroCatalogo();
    }
}

function limpiarFiltroCatalogo() {
    if (window.productos) {
        _catalogoExpandido = false;
        renderCatalogo(window.productos);
    }
    const btn = document.getElementById('btnLimpiarFiltroCatalogo');
    if (btn) btn.classList.add('d-none');
    const inp = document.getElementById('inputBusqueda');
    if (inp) inp.value = '';
    const cont = document.getElementById('suggestionsContainer');
    if (cont) { cont.innerHTML = ''; cont.classList.remove('show'); }
}

function renderOfertasFlash() {
    const row = document.getElementById('ofertasFlashRow');
    if (!row || !window.productos) return;

    let ofertas = window.productos.filter(p => p.es_oferta_flash && p.stock > 0);
    if (ofertas.length === 0) {
        const sec = document.getElementById('seccionOfertas');
        if (sec) sec.style.display = 'none';
        return;
    }

    // Mostrar solo 4-6 aleatorios en la fila horizontal
    ofertas = [...ofertas].sort(() => Math.random() - 0.5).slice(0, 6);

    row.innerHTML = ofertas.map(p => `
        <div class="oferta-card" onclick="window.location.href='producto.html?id=${p.id}'">
            <span class="badge-oferta-mini"><i class="bi bi-lightning-fill me-1"></i>-${Math.floor(Math.random() * 30 + 10)}%</span>
            <div class="img-wrap">
                <img src="${p.imagen}" alt="${p.nombre}" loading="lazy"
                     onerror="this.src='https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&h=200&fit=crop'">
            </div>
            <div class="info">
                <div class="name">${p.nombre}</div>
                <div class="price">
                    S/ ${p.precio.toFixed(2)}
                    <span class="price-old">S/ ${(p.precio * 1.25).toFixed(2)}</span>
                </div>
            </div>
            <button class="btn-add-mini" onclick="event.stopPropagation(); agregarAlCarrito(${p.id})">
                <i class="bi bi-plus"></i>
            </button>
        </div>`).join('');
}

function verTodasOfertas() {
    const sec = document.getElementById('mas-productos');
    if (sec) {
        // Filtrar catálogo para mostrar solo ofertas
        if (window.productos) {
            const ofertas = window.productos.filter(p => p.es_oferta_flash && p.stock > 0);
            _catalogoExpandido = true;
            renderCatalogo(ofertas);
            const btn = document.getElementById('btnLimpiarFiltroCatalogo');
            if (btn) btn.classList.remove('d-none');
        }
        sec.scrollIntoView({ behavior: 'smooth' });
    }
}

function renderCategorias(cats) {
    const cont = document.getElementById('gridCategorias');
    if (!cont) return;

    cont.innerHTML = cats.map(c => {
        const est = CATEGORIA_ESTILOS[c.nombre] || { icono: 'bi-grid-fill', color: '#888', bg: '#f5f5f5', id: 'cc-default' };
        return `
            <div class="card-cat-pro ${est.id}" onclick="filtrarPorCategoria('${c.nombre.replace(/'/g, "\\'")}')">
                <div class="cat-ico-wrap" style="background:${est.bg};">
                    <i class="bi ${est.icono}" style="color:${est.color};"></i>
                </div>
                <span class="cat-label">${c.nombre}</span>
            </div>`;
    }).join('');
}

function iniciarTimer() {
    let total = 2 * 3600 + 30 * 60;
    const els = ['timerOferta', 'timerOfertaMobile'].map(id => document.getElementById(id)).filter(Boolean);
    if (els.length === 0) return;
    setInterval(() => {
        if (total > 0) total--;
        const h = String(Math.floor(total / 3600)).padStart(2, '0');
        const m = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
        const s = String(total % 60).padStart(2, '0');
        const t = `${h}:${m}:${s}`;
        els.forEach(el => el.textContent = t);
    }, 1000);
}
