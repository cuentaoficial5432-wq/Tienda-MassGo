const CATALOGO_POR_PAGINA = 8;
let _listaCatalogo = null;
let _catalogoExpandido = false;

const CATEGORIA_ESTILOS = {
    'Bebidas':   { icono: 'bi-droplet-fill',   color: '#43A047', bg: '#E8F5E9', id: 'cc-bebidas' },
    'Snacks':    { icono: 'bi-bag-heart-fill',  color: '#F9A825', bg: '#FFF8E1', id: 'cc-snacks' },
    'Lácteos':   { icono: 'bi-cup-straw',       color: '#1E88E5', bg: '#E3F2FD', id: 'cc-lacteos' },
    'Limpieza':  { icono: 'bi-stars',           color: '#8E24AA', bg: '#F3E5F5', id: 'cc-limpieza' },
    'Abarrotes': { icono: 'bi-box-seam-fill',   color: '#FF6B35', bg: '#FFF0E6', id: 'cc-abarrotes' },
};

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
    if (grid) grid.innerHTML = '<div class="col-12 text-center py-5"><div class="spinner-border" style="color:var(--rosa-fuerte);" role="status"></div><p class="text-muted mt-2">Cargando productos...</p></div>';

    try {
        const res = await fetch('/api/productos/?limite=200');
        const data = await res.json();
        const lista = Array.isArray(data) ? data : (data.value || []);
        window.productos = lista.map(_transformarProducto);
    } catch (e) {
        console.error('Error al cargar productos:', e);
        window.productos = [];
        if (grid) grid.innerHTML = '<div class="col-12 text-center py-5"><i class="bi bi-exclamation-triangle" style="font-size:2.5rem;color:#ccc;"></i><p class="text-muted mt-2">Error al cargar productos. Verifica que el backend esté corriendo.</p></div>';
    }

    renderRecomendados(window.productos);
    renderCatalogo(window.productos);
    renderOfertasFlash();
    fetchCategorias();
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

/* ── RECOMENDADOS PARA TI (4 productos, sin paginación) ── */
function renderRecomendados(lista) {
    const grid = document.getElementById('gridProductos');
    if (!grid) return;
    if (!lista || lista.length === 0) {
        grid.innerHTML = '<div class="col-12 text-center py-5"><i class="bi bi-search" style="font-size:2.5rem;color:#ccc;"></i><p class="text-muted mt-2">No hay productos disponibles.</p></div>';
        return;
    }
    grid.innerHTML = lista.slice(0, 4).map(_cardHTML).join('');
}

/* ── CATÁLOGO DE PRODUCTOS (8 + Ver más) ── */
function renderCatalogo(lista, expandir) {
    const grid = document.getElementById('gridCatalogo');
    const wrapBtn = document.getElementById('wrapVerMasCatalogo');
    if (!grid) return;

    if (expandir !== undefined) _catalogoExpandido = expandir;
    _listaCatalogo = lista;

    if (!lista || lista.length === 0) {
        grid.innerHTML = '<div class="col-12 text-center py-5"><i class="bi bi-search" style="font-size:2.5rem;color:#ccc;"></i><p class="text-muted mt-2">No se encontraron productos.</p></div>';
        if (wrapBtn) wrapBtn.style.display = 'none';
        return;
    }

    const visibles = _catalogoExpandido ? lista : lista.slice(0, CATALOGO_POR_PAGINA);
    grid.innerHTML = visibles.map(_cardHTML).join('');

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

function filtrarProductos() {
    const q = document.getElementById('inputBusqueda').value.toLowerCase().trim();
    if (!window.productos) return;
    const filtrados = window.productos.filter(p =>
        p.nombre.toLowerCase().includes(q) ||
        p.categoria.toLowerCase().includes(q)
    );
    _catalogoExpandido = false;
    renderCatalogo(filtrados);
    const btn = document.getElementById('btnLimpiarFiltroCatalogo');
    if (btn) btn.classList.toggle('d-none', !q);
}

function filtrarPorCategoria(cat) {
    if (!window.productos) return;
    const filtrados = window.productos.filter(p => p.categoria === cat);
    _catalogoExpandido = false;
    renderCatalogo(filtrados);
    const btn = document.getElementById('btnLimpiarFiltroCatalogo');
    if (btn) btn.classList.remove('d-none');
    const sec = document.getElementById('mas-productos');
    if (sec) sec.scrollIntoView({ behavior: 'smooth' });
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
}

function renderOfertasFlash() {
    const cont = document.getElementById('ofertasFlashGrid');
    if (!cont || !window.productos) return;

    const ofertas = window.productos.filter(p => p.es_oferta_flash && p.stock > 0);
    if (ofertas.length === 0) {
        document.getElementById('seccionOfertas').style.display = 'none';
        return;
    }
    cont.innerHTML = ofertas.map(p => {
        const stars = Math.floor(Math.random() * 2) + 4;
        return `
        <div class="col-6 col-md-3 fade-in-up">
            <div class="card-producto position-relative" onclick="window.location.href='producto.html?id=${p.id}'">
                <span class="badge-oferta"><i class="bi bi-lightning-fill me-1"></i>OFERTA</span>
                <div class="img-container">
                    <img src="${p.imagen}" alt="${p.nombre}" loading="lazy"
                         onerror="this.src='https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&h=300&fit=crop'">
                </div>
                <div class="card-body">
                    ${p.categoria ? `<div class="cat-tag">${p.categoria}</div>` : ''}
                    <div class="nombre-producto">${p.nombre}</div>
                    <div class="estrellas">${_estrellas(stars)}</div>
                    <div class="precio-producto">S/ ${p.precio.toFixed(2)}</div>
                    <button class="btn-agregar" onclick="event.stopPropagation(); agregarAlCarrito(${p.id})">
                        <i class="bi bi-plus-lg"></i> Agregar
                    </button>
                </div>
            </div>
        </div>`;
    }).join('');
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
