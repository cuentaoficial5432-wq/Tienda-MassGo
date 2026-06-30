/* ============================================
   MASSGO DASHBOARD - 100% datos de Supabase vía API
   ============================================ */

const API_BASE = 'http://localhost:8000/api';

// ===== STATE =====
let productosData = [];
let pedidosData = [];
let usuariosData = [];
let categoriasData = [];
let comprobantesData = [];
let productoEditandoId = null;
let categoriaEditandoId = null;

// Paginación
const PAGE_SIZE = 6;
let productosPage = 1;
let pedidosPage = 1;
let usuariosPage = 1;
let categoriasPage = 1;
let comprobantesPage = 1;
let descuentosPage = 1;
let descuentosData = [];

// Real-time auto-refresh
let autoRefreshInterval = null;
let pedidosCountAnterior = 0;
const AUTO_REFRESH_MS = 15000;

// ===== API CLIENT =====
async function apiFetch(endpoint, options = {}) {
    const res = await fetch(`${API_BASE}${endpoint}`, {
        headers: { 'Content-Type': 'application/json', ...options.headers },
        ...options,
    });
    if (!res.ok) {
        const msg = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status}: ${msg || res.statusText}`);
    }
    if (endpoint.endsWith('/csv')) return await res.text();
    return await res.json();
}

// ===== VIEW SWITCHING =====
function showView(viewName) {
    document.querySelectorAll('.dash-view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const view = document.getElementById('view-' + viewName);
    const nav = document.querySelector(`.nav-item[data-view="${viewName}"]`);
    if (view) view.classList.add('active');
    if (nav) nav.classList.add('active');
    if (viewName === 'productos') { renderProductos(); renderPaginacionProductos(); }
    if (viewName === 'pedidos') { renderPedidos(); renderPaginacionPedidos(); }
    if (viewName === 'usuarios') { renderUsuarios(); renderPaginacionUsuarios(); }
    if (viewName === 'categorias') { renderCategorias(); renderPaginacionCategorias(); }
    if (viewName === 'comprobantes') { renderComprobantes(); renderPaginacionComprobantes(); }
    if (viewName === 'whatsapp') { renderWhatsApp(); }
    if (viewName === 'descuentos') { renderDescuentos(); renderPaginacionDescuentos(); }
}

// ===== SIDEBAR TOGGLE =====
document.addEventListener('DOMContentLoaded', async function () {
    // Login check
    const overlay = document.getElementById('loginOverlay');
    if (overlay && sessionStorage.getItem('massgo_admin') === 'true') {
        overlay.style.display = 'none';
    }

    const toggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('dashSidebar');
    if (toggle && sidebar) {
        toggle.addEventListener('click', () => sidebar.classList.toggle('open'));
        document.addEventListener('click', function (e) {
            if (window.innerWidth <= 768 && !sidebar.contains(e.target) && !toggle.contains(e.target)) {
                sidebar.classList.remove('open');
            }
        });
    }

    const searchProd = document.getElementById('searchProductos');
    if (searchProd) searchProd.addEventListener('input', function () { productosPage = 1; renderProductos(); renderPaginacionProductos(); });
    const searchPed = document.getElementById('searchPedidos');
    if (searchPed) searchPed.addEventListener('input', function () { pedidosPage = 1; renderPedidos(); renderPaginacionPedidos(); });
    const filterEstado = document.getElementById('filterEstadoPedido');
    if (filterEstado) filterEstado.addEventListener('change', function () {
        pedidosPage = 1;
        renderPedidos();
        renderPaginacionPedidos();
    });
    const filterFecha = document.getElementById('filterFechaPedido');
    if (filterFecha) filterFecha.addEventListener('change', function () {
        pedidosPage = 1;
        renderPedidos();
        renderPaginacionPedidos();
    });
    const searchUsu = document.getElementById('searchUsuarios');
    if (searchUsu) searchUsu.addEventListener('input', function () { usuariosPage = 1; renderUsuarios(); renderPaginacionUsuarios(); });
    const filterEstUsu = document.getElementById('filterEstadoUsuario');
    if (filterEstUsu) filterEstUsu.addEventListener('change', function () { usuariosPage = 1; renderUsuarios(); renderPaginacionUsuarios(); });
    const filterRolUsu = document.getElementById('filterRolUsuario');
    if (filterRolUsu) filterRolUsu.addEventListener('change', function () { usuariosPage = 1; renderUsuarios(); renderPaginacionUsuarios(); });

    const filterCat = document.getElementById('filterCategoriaProducto');
    if (filterCat) filterCat.addEventListener('change', function () { productosPage = 1; renderProductos(); renderPaginacionProductos(); });
    const filterStock = document.getElementById('filterStockProducto');
    if (filterStock) filterStock.addEventListener('change', function () { productosPage = 1; renderProductos(); renderPaginacionProductos(); });

    const searchCat = document.getElementById('searchCategorias');
    if (searchCat) searchCat.addEventListener('input', function () { categoriasPage = 1; renderCategorias(); renderPaginacionCategorias(); });
    const searchComp = document.getElementById('searchComprobantes');
    if (searchComp) searchComp.addEventListener('input', function () { comprobantesPage = 1; renderComprobantes(); renderPaginacionComprobantes(); });
    const filterTipoComp = document.getElementById('filterTipoComprobante');
    if (filterTipoComp) filterTipoComp.addEventListener('change', function () { comprobantesPage = 1; renderComprobantes(); renderPaginacionComprobantes(); });
    const searchDesc = document.getElementById('searchDescuentos');
    if (searchDesc) searchDesc.addEventListener('input', function () { descuentosPage = 1; renderDescuentos(); renderPaginacionDescuentos(); });

    try {
        await Promise.all([
            cargarDatosIniciales(),
            renderDashboard(),
            cargarCategoriasFiltro(),
        ]);
    } catch (e) {
        mostrarErrorPanel(e.message);
    }
    renderProductos();
    renderPaginacionProductos();
    renderPedidos();
    renderPaginacionPedidos();
    await cargarUsuarios();
    poblarRolesFiltro();
    renderCategorias();
    renderPaginacionCategorias();
    renderComprobantes();
    renderPaginacionComprobantes();

    // Inicializar contador de pedidos para detección de nuevos
    pedidosCountAnterior = pedidosData.length;

    // Iniciar auto-refresh en tiempo real
    iniciarAutoRefresh();
});

function mostrarErrorPanel(msg) {
    document.querySelectorAll('.dash-view').forEach(v => {
        v.innerHTML = `
            <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:60vh;gap:16px;">
                <i class="bi bi-cloud-slash" style="font-size:3rem;color:#E6005C;"></i>
                <h5 style="color:#E6005C;font-weight:700;">Error de conexión</h5>
                <p style="color:var(--dash-text-muted);text-align:center;max-width:400px;">
                    No se pudo conectar con el servidor.<br>
                    <strong>Asegúrate de que el backend esté corriendo:</strong><br>
                    <code style="background:#f4f4f6;padding:6px 12px;border-radius:8px;display:inline-block;margin-top:8px;">
                        venv\Scripts\python backend\main.py
                    </code>
                </p>
                <p style="font-size:.8rem;color:#b0b8c4;">${msg}</p>
                <button onclick="location.reload()" class="pill-btn pill-primary">
                    <i class="bi bi-arrow-clockwise"></i> Reintentar
                </button>
            </div>`;
    });
}

async function cargarDatosIniciales() {
    [productosData, pedidosData, categoriasData, comprobantesData, descuentosData] = await Promise.all([
        apiFetch('/productos/?limite=100'),
        apiFetch('/pedidos/?limite=100'),
        apiFetch('/categorias/'),
        apiFetch('/comprobantes/?limite=100'),
        apiFetch('/descuentos/'),
    ]);
    if (!Array.isArray(productosData)) throw new Error('Formato inválido en /productos');
    if (!Array.isArray(pedidosData)) throw new Error('Formato inválido en /pedidos');
    if (!Array.isArray(categoriasData)) categoriasData = [];
    if (!Array.isArray(comprobantesData)) comprobantesData = [];
}

// ===== RENDER DASHBOARD (métricas + pedidos recientes + alertas stock) =====
async function renderDashboard() {
    const data = await apiFetch('/dashboard/data');
    if (!data) throw new Error('No se pudo obtener data del dashboard');

    // Métricas
    document.getElementById('metrica-pendientes').textContent =
        String(data.metricas?.pedidos_pendientes ?? 0);
    document.getElementById('metrica-pedidos').textContent =
        String(data.metricas?.total_pedidos ?? 0);
    document.getElementById('metrica-usuarios').textContent =
        String(data.metricas?.usuarios_activos ?? 0);

    // Pedidos Recientes
    const recientes = data.pedidos_recientes || [];
    const tbody = document.getElementById('dashboardPedidosBody');
    if (tbody) {
        tbody.innerHTML = recientes.length
            ? recientes.map(p => {
                const estados = { 'Preparando': 'badge-preparando', 'En despacho': 'badge-en-camino', 'Entregado': 'badge-entregado', 'Cancelado': 'badge-cancelado', 'Pendiente': 'badge-preparando' };
                return `<tr>
                    <td><span class="order-id">#MG-${p.id_pedido}</span></td>
                    <td>${p.cliente || `Usuario #${p.id_usuario || ''}`}</td>
                    <td>S/ ${Number(p.total).toFixed(2)}</td>
                    <td><span class="badge-dash ${estados[p.estado] || 'badge-preparando'}">${p.estado}</span></td>
                </tr>`;
            }).join('')
            : '<tr><td colspan="4" class="text-center py-3 text-muted">No hay pedidos recientes</td></tr>';
    }

    // Alertas Stock
    const alertas = data.alertas_stock || [];
    const container = document.getElementById('dashboardAlertasStock');
    if (container) {
        container.innerHTML = alertas.length
            ? alertas.map(p => {
                const isOut = p.stock === 0 || p.estado === 'Agotado';
                return `<div class="stock-item ${isOut ? 'stock-out' : 'stock-low'}">
                    <div class="stock-img" style="background:${isOut ? '#FFE6EE' : '#FFF0E6'};">
                        <i class="bi ${isOut ? 'bi-bag-x' : 'bi-basket'}" style="color:${isOut ? '#E6005C' : '#FF6B35'};"></i>
                    </div>
                    <div class="stock-info">
                        <span class="stock-name">${p.nombre}</span>
                        <span class="stock-meta">${isOut ? '<strong>Agotado</strong>' : `Quedan <strong>${p.stock}</strong> unidades`}</span>
                    </div>
                    <span class="stock-badge ${isOut ? 'badge-stock-agotado' : 'badge-stock-bajo'}">${isOut ? 'Agotado' : 'Stock Bajo'}</span>
                </div>`;
            }).join('')
            : '<div class="text-center py-3 text-muted">No hay alertas de stock</div>';
    }
}

// ===== RENDER PRODUCTOS (card-style) =====
function renderProductos() {
    const container = document.getElementById('productosList');
    if (!container) return;
    const lista = filtrarProductos();
    const start = (productosPage - 1) * PAGE_SIZE;
    const pageItems = lista.slice(start, start + PAGE_SIZE);

    container.innerHTML = pageItems.length
        ? pageItems.map(p => {
            const stock = p.stock ?? 0;
            const badgeCls = stock === 0 ? 'badge-p-agotado' : stock <= 5 ? 'badge-p-bajo' : 'badge-p-normal';
            const badgeTxt = stock === 0 ? 'Agotado' : stock <= 5 ? 'Stock Bajo' : 'Normal';
            const img = p.imagen_url || '';
            const cat = (p.categoria || {}).nombre || 'Sin categoría';
            return `
                <div class="prod-card">
                    <div class="prod-col prod-col--img">
                        <div class="prod-thumb">
                            ${img
                                ? `<img src="${img}" alt="${p.nombre}" loading="lazy" onerror="this.style.display='none';this.parentNode.innerHTML='<i class=\\'bi bi-box\\' style=\\'font-size:1.1rem;color:#8892a4;\\'></i>'">`
                                : `<i class="bi bi-box" style="font-size:1.1rem;color:#8892a4;"></i>`
                            }
                        </div>
                    </div>
                    <div class="prod-col prod-col--nombre">
                        <span class="prod-nombre">${p.nombre || 'Sin nombre'}</span>
                        <span class="prod-categoria">${cat}</span>
                    </div>
                    <div class="prod-col prod-col--precio">S/ ${Number(p.precio).toFixed(2)}</div>
                    <div class="prod-col prod-col--stock">${stock} unid.</div>
                    <div class="prod-col prod-col--estado"><span class="badge-producto ${badgeCls}">${badgeTxt}</span></div>
                    <div class="prod-col prod-col--detalle">
                        <button class="btn-eye" title="Ver producto" onclick="verDetalleProducto(${p.id_producto})">
                            <i class="bi bi-eye"></i>
                        </button>
                    </div>
                    <div class="prod-col prod-col--accion">
                        <button class="btn-action btn-edit" title="Editar" onclick="editarProducto(${p.id_producto})">
                            <i class="bi bi-pencil-fill"></i>
                        </button>
                        <button class="btn-action btn-delete" title="Eliminar" onclick="eliminarProducto(${p.id_producto})">
                            <i class="bi bi-trash3-fill"></i>
                        </button>
                    </div>
                </div>`;
        }).join('')
        : '<div class="text-center py-5 text-muted"><i class="bi bi-inbox" style="font-size:2rem;display:block;margin-bottom:8px;"></i>No se encontraron productos</div>';
}

// ===== RENDER PEDIDOS (card-style) =====
function renderPedidos(filtro) {
    const container = document.getElementById('pedidosBody');
    if (!container) return;
    const lista = filtrarPedidos();
    const start = (pedidosPage - 1) * PAGE_SIZE;
    const pageItems = lista.slice(start, start + PAGE_SIZE);

    container.innerHTML = pageItems.length
        ? pageItems.map(p => {
            const badge = badgePedido(p.estado);
            const bloqueado = p.estado === 'En despacho' || p.estado === 'Entregado';
            const cantProd = (p.detalles || []).reduce((s, d) => s + (d.cantidad || 0), 0);
            const inicial = (p.cliente_nombre || '?')[0].toUpperCase();
            const fecha = p.fecha ? String(p.fecha).slice(0, 10) : '-';
            const email = p.cliente_email || '';
            return `
                <div class="pedido-card">
                    <div class="pc-col pc-col--id">#MG-${p.id_pedido}</div>
                    <div class="pc-col pc-col--cliente">
                        <div class="pc-avatar" style="background:#FFE6EE;color:#E6005C;">${inicial}</div>
                        <div class="pc-cliente-info">
                            <span class="pc-cliente-nombre">${p.cliente_nombre || `Usuario #${p.id_usuario || ''}`}</span>
                            ${email ? `<span class="pc-cliente-email">${email}</span>` : ''}
                        </div>
                    </div>
                    <div class="pc-col pc-col--productos">${cantProd} prod.</div>
                    <div class="pc-col pc-col--total">S/ ${Number(p.total).toFixed(2)}</div>
                    <div class="pc-col pc-col--fecha">${fecha}</div>
                    <div class="pc-col pc-col--estado"><span class="badge-dash ${badge}">${p.estado}</span></div>
                    <div class="pc-col pc-col--detalle">
                        <button class="btn-eye" title="Ver detalle" onclick="verDetallePedido(${p.id_pedido})">
                            <i class="bi bi-eye"></i>
                        </button>
                    </div>
                    <div class="pc-col pc-col--accion">
                        ${bloqueado
                            ? `<div style="display:flex;align-items:center;gap:6px;"><span class="select-estado" style="background:#f4f4f6;color:#b0b8c4;opacity:0.6;padding:6px 12px;font-size:.78rem;border-radius:50px;cursor:not-allowed;">${p.estado}</span><span class="estado-bloqueado"><i class="bi bi-lock-fill"></i></span></div>`
                            : `<select class="select-estado" onchange="cambiarEstadoPedido(${p.id_pedido}, this.value)">
                                <option value="Preparando" ${p.estado === 'Preparando' ? 'selected' : ''}>Preparando</option>
                                <option value="En despacho" ${p.estado === 'En despacho' ? 'selected' : ''}>En despacho</option>
                                <option value="Entregado" ${p.estado === 'Entregado' ? 'selected' : ''}>Entregado</option>
                                <option value="Cancelado" ${p.estado === 'Cancelado' ? 'selected' : ''}>Cancelado</option>
                            </select>`
                        }
                    </div>
                </div>`;
        }).join('')
        : '<div class="text-center py-5 text-muted"><i class="bi bi-inbox" style="font-size:2rem;display:block;margin-bottom:8px;"></i>No se encontraron pedidos</div>';
}

function badgePedido(estado) {
    const map = { 'Preparando': 'badge-preparando', 'En despacho': 'badge-en-camino', 'Entregado': 'badge-entregado', 'Cancelado': 'badge-cancelado', 'Pendiente': 'badge-preparando' };
    return map[estado] || 'badge-preparando';
}

// ===== DETALLE PEDIDO MODAL =====
function verDetallePedido(id) {
    const p = pedidosData.find(x => x.id_pedido === id);
    if (!p) return;

    document.getElementById('modalDetalleTitulo').innerHTML = `<i class="bi bi-receipt"></i> Pedido #MG-${p.id_pedido}`;

    const detalles = p.detalles || [];
    const subtotal = detalles.reduce((s, d) => s + (d.cantidad * d.precio_unitario), 0);
    const fecha = p.fecha ? String(p.fecha).slice(0, 16) : '-';
    const envio = p.envio || null;
    const pagos = p.pagos || [];
    const metodoPago = pagos.length > 0 ? pagos[0].metodo_pago || '-' : '-';

    let productosHtml = detalles.map(d => {
        const img = d.producto_imagen || '';
        return `
            <tr>
                <td>
                    <div class="detalle-producto-cell">
                        <div class="detalle-producto-img">
                            ${img ? `<img src="${img}" alt="" onerror="this.style.display='none'">` : `<i class="bi bi-box"></i>`}
                        </div>
                        ${d.producto_nombre || `Producto #${d.id_producto}`}
                    </div>
                </td>
                <td>${d.cantidad}</td>
                <td>S/ ${Number(d.precio_unitario).toFixed(2)}</td>
                <td style="font-weight:600;">S/ ${Number(d.cantidad * d.precio_unitario).toFixed(2)}</td>
            </tr>`;
    }).join('');

    const body = `
        <div class="detalle-pedido-grid">
            <div class="detalle-info-box">
                <h6>Información del Pedido</h6>
                <div class="detalle-info-row"><span class="label">Estado</span><span class="value"><span class="badge-dash ${badgePedido(p.estado)}">${p.estado}</span></span></div>
                <div class="detalle-info-row"><span class="label">Fecha</span><span class="value">${fecha}</span></div>
                <div class="detalle-info-row"><span class="label">Total</span><span class="value" style="color:var(--dash-fucsia);">S/ ${Number(p.total).toFixed(2)}</span></div>
                ${p.codigo_usado ? `<div class="detalle-info-row"><span class="label">Cupón</span><span class="value" style="font-weight:700;">${p.codigo_usado} ${p.descuento_aplicado > 0 ? `(-S/ ${Number(p.descuento_aplicado).toFixed(2)})` : ''}</span></div>` : ''}
            </div>
            <div class="detalle-info-box">
                <h6>Cliente & Pago</h6>
                <div class="detalle-info-row"><span class="label">Cliente</span><span class="value">${p.cliente_nombre || '—'}</span></div>
                <div class="detalle-info-row"><span class="label">ID Usuario</span><span class="value">#${p.id_usuario || '—'}</span></div>
                <div class="detalle-info-row"><span class="label">Método Pago</span><span class="value">${metodoPago}</span></div>
            </div>
        </div>
        ${envio ? `
        <div class="detalle-info-box" style="margin-bottom:16px;">
            <h6>Envío</h6>
            <div class="detalle-info-row"><span class="label">Dirección</span><span class="value">${envio.direccion_entrega || '—'}</span></div>
            ${envio.fecha_envio ? `<div class="detalle-info-row"><span class="label">${String(envio.fecha_envio).includes(' - ') ? 'Programado' : 'Fecha'}</span><span class="value">${String(envio.fecha_envio)}</span></div>` : ''}
        </div>` : ''}
        <h6 style="font-size:.8rem;font-weight:700;margin:0 0 8px 0;color:var(--dash-text-muted);text-transform:uppercase;letter-spacing:0.3px;">Productos</h6>
        <table class="detalle-productos-table">
            <thead><tr><th>Producto</th><th>Cant.</th><th>Precio Unit.</th><th>Subtotal</th></tr></thead>
            <tbody>${productosHtml}</tbody>
            <tfoot>
                <tr><td colspan="3" style="text-align:right;font-weight:600;">Total</td><td style="font-weight:800;color:var(--dash-fucsia);">S/ ${Number(p.total).toFixed(2)}</td></tr>
            </tfoot>
        </table>`;

    document.getElementById('modalDetalleBody').innerHTML = body;
    document.getElementById('modalDetallePedido').classList.add('show');
}

function cerrarDetallePedido() {
    document.getElementById('modalDetallePedido').classList.remove('show');
}

// ===== RENDER USUARIOS (card-style) =====
let usuariosDataRaw = [];

async function cargarUsuarios() {
    try {
        const data = await apiFetch('/usuarios/?limite=100');
        usuariosDataRaw = Array.isArray(data) ? data : [];
        usuariosData = usuariosDataRaw.map(u => {
            const pedidosUser = pedidosData.filter(p => p.id_usuario === u.id_usuario);
            return {
                ...u,
                total_pedidos: pedidosUser.length,
                total_gastado: pedidosUser.reduce((s, p) => s + p.total, 0),
            };
        });
    } catch (e) {
        usuariosData = [];
    }
    renderUsuarios();
    renderPaginacionUsuarios();
}

function renderUsuarios() {
    const container = document.getElementById('usuariosBody');
    if (!container) return;
    const lista = filtrarUsuarios();
    const start = (usuariosPage - 1) * PAGE_SIZE;
    const pageItems = lista.slice(start, start + PAGE_SIZE);

    container.innerHTML = pageItems.length
        ? pageItems.map(u => {
            const nombreCompleto = [u.nombres, u.apellidos].filter(Boolean).join(' ') || u.username;
            const inicial = (u.nombres || u.username || '?')[0].toUpperCase();
            const fecha = u.fecha_registro ? String(u.fecha_registro).slice(0, 10) : '-';
            const rolesStr = (u.roles || []).join(', ') || '—';
            const isActivo = u.estado === 'Activo';
            return `
                <div class="user-card">
                    <div class="uc-col uc-col--user">
                        <div class="uc-avatar" style="background:#FFE6EE;color:#E6005C;font-weight:700;">${inicial}</div>
                        <div class="uc-user-info">
                            <span class="uc-user-nombre">${nombreCompleto}</span>
                            <span class="uc-user-username">@${u.username || '—'}</span>
                        </div>
                    </div>
                    <div class="uc-col uc-col--email">${u.email || '-'}</div>
                    <div class="uc-col uc-col--roles">${rolesStr}</div>
                    <div class="uc-col uc-col--pedidos">${u.total_pedidos || 0}</div>
                    <div class="uc-col uc-col--gasto">S/ ${Number(u.total_gastado || 0).toFixed(2)}</div>
                    <div class="uc-col uc-col--registro">${fecha}</div>
                    <div class="uc-col uc-col--estado"><span class="badge-dash ${isActivo ? 'badge-entregado' : 'badge-cancelado'}">${u.estado || 'Activo'}</span></div>
                    <div class="uc-col uc-col--detalle">
                        <button class="btn-eye" title="Ver usuario" onclick="verDetalleUsuario(${u.id_usuario})">
                            <i class="bi bi-eye"></i>
                        </button>
                    </div>
                </div>`;
        }).join('')
        : '<div class="text-center py-5 text-muted"><i class="bi bi-inbox" style="font-size:2rem;display:block;margin-bottom:8px;"></i>No se encontraron usuarios</div>';
}

// ===== DETALLE USUARIO MODAL =====
function verDetalleUsuario(id) {
    const u = usuariosData.find(x => x.id_usuario === id);
    if (!u) return;
    const nombreCompleto = [u.nombres, u.apellidos].filter(Boolean).join(' ') || u.username;
    const inicial = (u.nombres || u.username || '?')[0].toUpperCase();
    const fecha = u.fecha_registro ? String(u.fecha_registro).slice(0, 10) : '-';
    const rolesStr = (u.roles || []).join(', ') || '—';
    const isActivo = u.estado === 'Activo';

    document.getElementById('modalDetalleTitulo').innerHTML = `<i class="bi bi-people-fill"></i> ${nombreCompleto}`;
    document.getElementById('modalDetalleBody').innerHTML = `
        <div style="display:flex;gap:20px;flex-wrap:wrap;margin-bottom:20px;">
            <div style="width:100px;height:100px;border-radius:50%;background:#FFE6EE;color:#E6005C;display:flex;align-items:center;justify-content:center;font-size:2.5rem;font-weight:800;flex-shrink:0;">${inicial}</div>
            <div style="flex:1;min-width:200px;">
                <div class="detalle-info-box" style="height:100%;">
                    <h6>Información del Usuario</h6>
                    <div class="detalle-info-row"><span class="label">Nombre</span><span class="value">${nombreCompleto}</span></div>
                    <div class="detalle-info-row"><span class="label">Username</span><span class="value">@${u.username || '—'}</span></div>
                    <div class="detalle-info-row"><span class="label">Email</span><span class="value">${u.email || '—'}</span></div>
                    <div class="detalle-info-row"><span class="label">Roles</span><span class="value">${rolesStr}</span></div>
                    <div class="detalle-info-row"><span class="label">Estado</span><span class="value"><span class="badge-dash ${isActivo ? 'badge-entregado' : 'badge-cancelado'}">${u.estado || 'Activo'}</span></span></div>
                    <div class="detalle-info-row"><span class="label">Registro</span><span class="value">${fecha}</span></div>
                    <div class="detalle-info-row"><span class="label">Pedidos</span><span class="value" style="font-weight:600;">${u.total_pedidos || 0}</span></div>
                    <div class="detalle-info-row"><span class="label">Total Gastado</span><span class="value" style="color:var(--dash-fucsia);font-weight:700;">S/ ${Number(u.total_gastado || 0).toFixed(2)}</span></div>
                </div>
            </div>
        </div>`;

    document.getElementById('modalDetallePedido').classList.add('show');
}

// ===== ACCIONES PRODUCTOS =====
// ===== PRODUCTOS =====
function poblarCategoriasSelect() {
    const sel = document.getElementById('inputCategoriaProducto');
    if (!sel) return;
    sel.innerHTML = '<option value="">Seleccionar categoría</option>';
    (categoriasData || []).forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.id_categoria;
        opt.textContent = c.nombre;
        sel.appendChild(opt);
    });
}

function abrirModalProducto() {
    poblarCategoriasSelect();
    productoEditandoId = null;
    document.getElementById('modalProductoTitulo').innerHTML = '<i class="bi bi-plus-circle"></i> Nuevo Producto';
    document.getElementById('inputNombreProducto').value = '';
    document.getElementById('inputPrecioProducto').value = '';
    document.getElementById('inputStockProducto').value = '';
    document.getElementById('inputCategoriaProducto').value = '';
    document.getElementById('inputEstadoProducto').value = 'Disponible';
    document.getElementById('inputDescripcionProducto').value = '';
    document.getElementById('inputImagenProducto').value = '';
    document.getElementById('modalProducto').classList.add('show');
}

function cerrarModalProducto() {
    document.getElementById('modalProducto').classList.remove('show');
    productoEditandoId = null;
}

function editarProducto(id) {
    const p = productosData.find(x => x.id_producto === id);
    if (!p) return;
    poblarCategoriasSelect();
    productoEditandoId = id;
    document.getElementById('modalProductoTitulo').innerHTML = '<i class="bi bi-pencil-fill"></i> Editar Producto';
    document.getElementById('inputNombreProducto').value = p.nombre || '';
    document.getElementById('inputPrecioProducto').value = p.precio || '';
    document.getElementById('inputStockProducto').value = p.stock ?? 0;
    document.getElementById('inputCategoriaProducto').value = p.id_categoria || '';
    document.getElementById('inputEstadoProducto').value = p.estado || 'Disponible';
    document.getElementById('inputDescripcionProducto').value = p.descripcion || '';
    document.getElementById('inputImagenProducto').value = p.imagen_url || '';
    document.getElementById('modalProducto').classList.add('show');
}

async function guardarProducto() {
    const nombre = document.getElementById('inputNombreProducto').value.trim();
    const precio = parseFloat(document.getElementById('inputPrecioProducto').value);
    const stock = parseInt(document.getElementById('inputStockProducto').value) || 0;
    const id_categoria = parseInt(document.getElementById('inputCategoriaProducto').value) || null;
    const estado = document.getElementById('inputEstadoProducto').value;
    const descripcion = document.getElementById('inputDescripcionProducto').value.trim();
    const imagen_url = document.getElementById('inputImagenProducto').value.trim() || null;

    if (!nombre) { alert('El nombre del producto es obligatorio'); return; }
    if (!precio || precio <= 0) { alert('Ingresa un precio válido'); return; }

    const payload = { nombre, precio, stock, estado, descripcion, imagen_url };
    if (id_categoria) payload.id_categoria = id_categoria;

    try {
        if (productoEditandoId) {
            const res = await apiFetch(`/productos/${productoEditandoId}`, {
                method: 'PUT',
                body: JSON.stringify(payload),
            });
            const idx = productosData.findIndex(p => p.id_producto === productoEditandoId);
            if (idx !== -1) productosData[idx] = res;
        } else {
            const res = await apiFetch('/productos/', {
                method: 'POST',
                body: JSON.stringify(payload),
            });
            productosData.push(res);
        }
        cerrarModalProducto();
        renderProductos();
        renderPaginacionProductos();
    } catch (e) {
        alert('Error al guardar producto: ' + e.message);
    }
}

// ===== DETALLE PRODUCTO MODAL =====
function verDetalleProducto(id) {
    const p = productosData.find(x => x.id_producto === id);
    if (!p) return;
    const stock = p.stock ?? 0;
    const badgeCls = stock === 0 ? 'badge-p-agotado' : stock <= 5 ? 'badge-p-bajo' : 'badge-p-normal';
    const badgeTxt = stock === 0 ? 'Agotado' : stock <= 5 ? 'Stock Bajo' : 'Normal';
    const cat = (p.categoria || {}).nombre || 'Sin categoría';
    const img = p.imagen_url || '';

    document.getElementById('modalDetalleTitulo').innerHTML = `<i class="bi bi-box-seam"></i> ${p.nombre || 'Producto'}`;
    document.getElementById('modalDetalleBody').innerHTML = `
        <div style="display:flex;gap:20px;flex-wrap:wrap;margin-bottom:20px;">
            <div class="prod-detail-img">
                ${img
                    ? `<img src="${img}" alt="${p.nombre}" onerror="this.style.display='none'">`
                    : `<i class="bi bi-box" style="font-size:2.5rem;color:#8892a4;"></i>`
                }
            </div>
            <div style="flex:1;min-width:200px;">
                <div class="detalle-info-box" style="height:100%;">
                    <h6>Información del Producto</h6>
                    <div class="detalle-info-row"><span class="label">Nombre</span><span class="value">${p.nombre || '—'}</span></div>
                    <div class="detalle-info-row"><span class="label">Categoría</span><span class="value">${cat}</span></div>
                    <div class="detalle-info-row"><span class="label">Precio</span><span class="value" style="color:var(--dash-fucsia);font-weight:700;">S/ ${Number(p.precio).toFixed(2)}</span></div>
                    <div class="detalle-info-row"><span class="label">Stock</span><span class="value">${stock} unid.</span></div>
                    <div class="detalle-info-row"><span class="label">Estado</span><span class="value"><span class="badge-producto ${badgeCls}">${badgeTxt}</span></span></div>
                    ${p.descripcion ? `<div class="detalle-info-row"><span class="label">Descripción</span><span class="value">${p.descripcion}</span></div>` : ''}
                </div>
            </div>
        </div>
        <div style="display:flex;gap:10px;justify-content:flex-end;">
            <button class="btn-action btn-edit" onclick="cerrarDetallePedido();editarProducto(${p.id_producto})" title="Editar">
                <i class="bi bi-pencil-fill"></i> Editar
            </button>
        </div>`;

    document.getElementById('modalDetallePedido').classList.add('show');
}

async function eliminarProducto(id) {
    if (!confirm('¿Eliminar este producto?')) return;
    try {
        await apiFetch(`/productos/${id}`, { method: 'DELETE' });
        productosData = productosData.filter(p => p.id_producto !== id);
        renderProductos();
        renderPaginacionProductos();
    } catch (e) {
        alert('Error al eliminar: ' + e.message);
    }
}

async function cambiarEstadoPedido(id, nuevoEstado) {
    try {
        await apiFetch(`/pedidos/${id}/estado`, {
            method: 'PATCH',
            body: JSON.stringify({ estado: nuevoEstado }),
        });
        const pedido = pedidosData.find(p => p.id_pedido === id);
        if (pedido) pedido.estado = nuevoEstado;
        renderPedidos();
    } catch (e) {
        alert('Error al cambiar estado: ' + e.message);
    }
}

// ===== EXPORTAR CSV =====
async function exportarCSV() {
    const estadoFilter = document.getElementById('filterEstadoPedido')?.value || '';
    const params = estadoFilter ? `?estado=${encodeURIComponent(estadoFilter)}` : '';
    try {
        const csv = await apiFetch(`/pedidos/exportar/csv${params}`);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `pedidos_massgo_${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
    } catch (e) {
        alert('Error al exportar: ' + e.message);
    }
}

// ===== PAGINACIÓN =====
function irPaginaProductos(p) { productosPage = p; renderProductos(); renderPaginacionProductos(); }
function irPaginaPedidos(p) { pedidosPage = p; renderPedidos(); renderPaginacionPedidos(); }
function irPaginaUsuarios(p) { usuariosPage = p; renderUsuarios(); renderPaginacionUsuarios(); }
function irPaginaCategorias(p) { categoriasPage = p; renderCategorias(); renderPaginacionCategorias(); }
function irPaginaComprobantes(p) { comprobantesPage = p; renderComprobantes(); renderPaginacionComprobantes(); }

function renderPaginacionProductos() {
    const filtrados = filtrarProductos();
    renderPaginacionCircular('paginacionProductos', filtrados, productosPage, 'irPaginaProductos', 'producto', 'productos');
}

function filtrarProductos() {
    let lista = productosData;
    const q = document.getElementById('searchProductos')?.value;
    if (q) {
        const lq = q.toLowerCase();
        lista = lista.filter(p =>
            (p.nombre || '').toLowerCase().includes(lq) ||
            ((p.categoria || {}).nombre || '').toLowerCase().includes(lq) ||
            (p.descripcion || '').toLowerCase().includes(lq)
        );
    }
    const cf = document.getElementById('filterCategoriaProducto');
    if (cf && cf.value) {
        const catId = parseInt(cf.value);
        lista = lista.filter(p => p.id_categoria === catId);
    }
    const sf = document.getElementById('filterStockProducto');
    if (sf && sf.value) {
        if (sf.value === 'bajo') lista = lista.filter(p => p.stock > 0 && p.stock <= 5);
        else if (sf.value === 'agotado') lista = lista.filter(p => p.stock === 0);
        else if (sf.value === 'normal') lista = lista.filter(p => p.stock > 5);
    }
    return lista;
}

async function cargarCategoriasFiltro() {
    try {
        const cats = await apiFetch('/productos/categorias');
        const sel = document.getElementById('filterCategoriaProducto');
        if (sel && Array.isArray(cats)) {
            cats.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c.id_categoria;
                opt.textContent = c.nombre;
                sel.appendChild(opt);
            });
        }
    } catch (e) { /* ignore */ }
}

function renderPaginacionPedidos() {
    const filtrados = filtrarPedidos();
    renderPaginacionCircular('paginacionPedidos', filtrados, pedidosPage, 'irPaginaPedidos', 'pedido', 'pedidos');
}

function renderPaginacionUsuarios() {
    const filtrados = filtrarUsuarios();
    renderPaginacionCircular('paginacionUsuarios', filtrados, usuariosPage, 'irPaginaUsuarios', 'usuario', 'usuarios');
}

function renderPaginacionCategorias() {
    const filtrados = filtrarCategorias();
    renderPaginacionCircular('paginacionCategorias', filtrados, categoriasPage, 'irPaginaCategorias', 'categoría', 'categorías');
}

function renderPaginacionComprobantes() {
    const filtrados = filtrarComprobantes();
    renderPaginacionCircular('paginacionComprobantes', filtrados, comprobantesPage, 'irPaginaComprobantes', 'comprobante', 'comprobantes');
}

function filtrarPedidos() {
    let lista = pedidosData;
    const q = document.getElementById('searchPedidos')?.value;
    if (q) {
        const lq = q.toLowerCase();
        lista = lista.filter(p =>
            `#${p.id_pedido}`.toLowerCase().includes(lq) ||
            `#mg-${p.id_pedido}`.toLowerCase().includes(lq) ||
            (p.cliente_nombre || '').toLowerCase().includes(lq) ||
            (p.detalles || []).some(d => (d.producto_nombre || '').toLowerCase().includes(lq))
        );
    }
    const ef = document.getElementById('filterEstadoPedido');
    if (ef && ef.value) lista = lista.filter(p => p.estado === ef.value);
    const ff = document.getElementById('filterFechaPedido');
    if (ff && ff.value) {
        const now = new Date();
        let since;
        if (ff.value === 'today') { since = new Date(now.getFullYear(), now.getMonth(), now.getDate()); }
        else if (ff.value === 'week') { since = new Date(now); since.setDate(since.getDate() - 7); }
        else if (ff.value === 'month') { since = new Date(now.getFullYear(), now.getMonth(), 1); }
        if (since) {
            lista = lista.filter(p => {
                const f = p.fecha ? new Date(p.fecha) : null;
                return f && f >= since;
            });
        }
    }
    return lista;
}

function filtrarUsuarios() {
    let lista = usuariosData;
    const q = document.getElementById('searchUsuarios')?.value;
    if (q) {
        const lq = q.toLowerCase();
        lista = lista.filter(u =>
            (u.username || '').toLowerCase().includes(lq) ||
            (u.email || '').toLowerCase().includes(lq) ||
            (u.nombres || '').toLowerCase().includes(lq) ||
            (u.apellidos || '').toLowerCase().includes(lq)
        );
    }
    const ef = document.getElementById('filterEstadoUsuario');
    if (ef && ef.value) lista = lista.filter(u => u.estado === ef.value);
    const rf = document.getElementById('filterRolUsuario');
    if (rf && rf.value) lista = lista.filter(u => (u.roles || []).includes(rf.value));
    return lista;
}

function poblarRolesFiltro() {
    const rolesSet = new Set();
    usuariosDataRaw.forEach(u => (u.roles || []).forEach(r => rolesSet.add(r)));
    const sel = document.getElementById('filterRolUsuario');
    if (sel) {
        [...rolesSet].sort().forEach(r => {
            const opt = document.createElement('option');
            opt.value = r;
            opt.textContent = r;
            sel.appendChild(opt);
        });
    }
}

// ===== RENDER CATEGORÍAS (card-style) =====
function renderCategorias() {
    const container = document.getElementById('categoriasList');
    if (!container) return;
    const lista = filtrarCategorias();
    const start = (categoriasPage - 1) * PAGE_SIZE;
    const pageItems = lista.slice(start, start + PAGE_SIZE);

    container.innerHTML = pageItems.length
        ? pageItems.map(c => {
            const cant = (productosData || []).filter(p => p.id_categoria === c.id_categoria).length;
            return `
                <div class="prod-card">
                    <div class="prod-col prod-col--img" style="width:60px;justify-content:center;">
                        <span style="font-weight:700;color:var(--dash-fucsia);font-size:.9rem;">#${c.id_categoria}</span>
                    </div>
                    <div class="prod-col prod-col--nombre" style="flex:1;">
                        <span class="prod-nombre">${c.nombre || '—'}</span>
                    </div>
                    <div class="prod-col prod-col--precio" style="flex:2;color:var(--dash-text-muted);font-size:.78rem;">
                        ${c.descripcion || '—'}
                    </div>
                    <div class="prod-col prod-col--stock" style="width:100px;text-align:center;">
                        <span class="badge-dash badge-entregado">${cant} prod.</span>
                    </div>
                    <div class="prod-col prod-col--accion" style="width:110px;text-align:center;">
                        <button class="btn-action btn-edit" title="Editar" onclick="editarCategoria(${c.id_categoria})">
                            <i class="bi bi-pencil-fill"></i>
                        </button>
                        <button class="btn-action btn-delete" title="Eliminar" onclick="eliminarCategoria(${c.id_categoria})">
                            <i class="bi bi-trash3-fill"></i>
                        </button>
                    </div>
                </div>`;
        }).join('')
        : '<div class="text-center py-5 text-muted"><i class="bi bi-inbox" style="font-size:2rem;display:block;margin-bottom:8px;"></i>No hay categorías</div>';
}

function filtrarCategorias() {
    let lista = categoriasData;
    const q = document.getElementById('searchCategorias')?.value;
    if (q) {
        const lq = q.toLowerCase();
        lista = lista.filter(c =>
            (c.nombre || '').toLowerCase().includes(lq) ||
            (c.descripcion || '').toLowerCase().includes(lq)
        );
    }
    return lista;
}

// ===== MODAL CATEGORÍA =====
function abrirModalCategoria() {
    categoriaEditandoId = null;
    document.getElementById('modalCategoriaTitulo').innerHTML = '<i class="bi bi-plus-circle"></i> Nueva Categoría';
    document.getElementById('inputNombreCategoria').value = '';
    document.getElementById('inputDescripcionCategoria').value = '';
    document.getElementById('modalCategoria').classList.add('show');
}

function cerrarModalCategoria() {
    document.getElementById('modalCategoria').classList.remove('show');
    categoriaEditandoId = null;
}

function editarCategoria(id) {
    const c = categoriasData.find(x => x.id_categoria === id);
    if (!c) return;
    categoriaEditandoId = id;
    document.getElementById('modalCategoriaTitulo').innerHTML = '<i class="bi bi-pencil-fill"></i> Editar Categoría';
    document.getElementById('inputNombreCategoria').value = c.nombre || '';
    document.getElementById('inputDescripcionCategoria').value = c.descripcion || '';
    document.getElementById('modalCategoria').classList.add('show');
}

async function guardarCategoria() {
    const nombre = document.getElementById('inputNombreCategoria').value.trim();
    const descripcion = document.getElementById('inputDescripcionCategoria').value.trim();
    if (!nombre) { alert('El nombre es obligatorio'); return; }
    const payload = { nombre, descripcion: descripcion || null };
    try {
        if (categoriaEditandoId) {
            const res = await apiFetch(`/categorias/${categoriaEditandoId}`, { method: 'PUT', body: JSON.stringify(payload) });
            const idx = categoriasData.findIndex(c => c.id_categoria === categoriaEditandoId);
            if (idx !== -1) categoriasData[idx] = res;
        } else {
            const res = await apiFetch('/categorias/', { method: 'POST', body: JSON.stringify(payload) });
            categoriasData.push(res);
        }
        cerrarModalCategoria();
        renderCategorias();
        renderPaginacionCategorias();
    } catch (e) {
        alert('Error al guardar categoría: ' + e.message);
    }
}

async function eliminarCategoria(id) {
    if (!confirm('¿Eliminar esta categoría?')) return;
    try {
        await apiFetch(`/categorias/${id}`, { method: 'DELETE' });
        categoriasData = categoriasData.filter(c => c.id_categoria !== id);
        renderCategorias();
        renderPaginacionCategorias();
    } catch (e) {
        alert('Error al eliminar: ' + e.message);
    }
}

// ===== RENDER COMPROBANTES (card-style) =====
function renderComprobantes() {
    const container = document.getElementById('comprobantesList');
    if (!container) return;
    const lista = filtrarComprobantes();
    const start = (comprobantesPage - 1) * PAGE_SIZE;
    const pageItems = lista.slice(start, start + PAGE_SIZE);

    container.innerHTML = pageItems.length
        ? pageItems.map(c => {
            const fecha = c.fecha ? String(c.fecha).slice(0, 10) : '—';
            const tipoBadge = c.tipo === 'Factura' ? 'badge-entregado' : 'badge-preparando';
            return `
                <div class="prod-card">
                    <div class="prod-col" style="width:50px;justify-content:center;">
                        <span style="font-weight:700;color:var(--dash-fucsia);font-size:.85rem;">#${c.id_comprobante}</span>
                    </div>
                    <div class="prod-col" style="width:80px;">
                        <span class="badge-dash ${tipoBadge}">${c.tipo || '—'}</span>
                    </div>
                    <div class="prod-col prod-col--nombre" style="width:120px;">
                        <span class="prod-nombre">${c.numero || '—'}</span>
                    </div>
                    <div class="prod-col prod-col--stock" style="flex:1;">
                        <div class="pc-cliente-info">
                            <span class="pc-cliente-nombre">${c.cliente || '—'}</span>
                            ${c.email ? `<span class="pc-cliente-email">${c.email}</span>` : ''}
                        </div>
                    </div>
                    <div class="prod-col" style="width:100px;text-align:right;font-weight:700;color:var(--dash-fucsia);">
                        S/ ${Number(c.monto).toFixed(2)}
                    </div>
                    <div class="prod-col" style="width:110px;font-size:.78rem;color:var(--dash-text-muted);">
                        ${c.metodo_pago || '—'}
                    </div>
                    <div class="prod-col prod-col--id" style="width:80px;text-align:center;">
                        #MG-${c.id_pedido}
                    </div>
                    <div class="prod-col prod-col--fecha" style="width:100px;font-size:.78rem;color:var(--dash-text-muted);">
                        ${fecha}
                    </div>
                    <div class="prod-col prod-col--detalle" style="width:64px;text-align:center;">
                        <button class="btn-eye" title="Ver detalle" onclick="verDetalleComprobante(${c.id_comprobante})">
                            <i class="bi bi-eye"></i>
                        </button>
                    </div>
                </div>`;
        }).join('')
        : '<div class="text-center py-5 text-muted"><i class="bi bi-inbox" style="font-size:2rem;display:block;margin-bottom:8px;"></i>No hay comprobantes</div>';
}

function filtrarComprobantes() {
    let lista = comprobantesData;
    const q = document.getElementById('searchComprobantes')?.value;
    if (q) {
        const lq = q.toLowerCase();
        lista = lista.filter(c =>
            `#${c.id_comprobante}`.includes(lq) ||
            (c.numero || '').toLowerCase().includes(lq) ||
            (c.cliente || '').toLowerCase().includes(lq) ||
            `#mg-${c.id_pedido}`.includes(lq)
        );
    }
    const tf = document.getElementById('filterTipoComprobante');
    if (tf && tf.value) lista = lista.filter(c => c.tipo === tf.value);
    return lista;
}

// ===== DETALLE COMPROBANTE MODAL =====
let comprobanteActual = null;

function verDetalleComprobante(id) {
    const c = comprobantesData.find(x => x.id_comprobante === id);
    if (!c) return;
    comprobanteActual = c;

    document.getElementById('modalComprobanteTitulo').innerHTML = `<i class="bi bi-receipt"></i> Comprobante ${c.tipo || ''} #${c.numero || c.id_comprobante}`;

    const fecha = c.fecha ? String(c.fecha).slice(0, 10) : '—';
    const tipoBadge = c.tipo === 'Factura' ? 'badge-entregado' : 'badge-preparando';

    document.getElementById('modalComprobanteBody').innerHTML = `
        <div class="detalle-pedido-grid">
            <div class="detalle-info-box">
                <h6>Comprobante</h6>
                <div class="detalle-info-row"><span class="label">Tipo</span><span class="value"><span class="badge-dash ${tipoBadge}">${c.tipo || '—'}</span></span></div>
                <div class="detalle-info-row"><span class="label">Número</span><span class="value" style="font-weight:700;">${c.numero || '—'}</span></div>
                <div class="detalle-info-row"><span class="label">Fecha</span><span class="value">${fecha}</span></div>
                <div class="detalle-info-row"><span class="label">Pedido</span><span class="value">#MG-${c.id_pedido}</span></div>
                <div class="detalle-info-row"><span class="label">Monto</span><span class="value" style="color:var(--dash-fucsia);font-weight:700;">S/ ${Number(c.monto).toFixed(2)}</span></div>
            </div>
            <div class="detalle-info-box">
                <h6>Cliente</h6>
                <div class="detalle-info-row"><span class="label">Nombre</span><span class="value">${c.cliente || '—'}</span></div>
                <div class="detalle-info-row"><span class="label">Email</span><span class="value">${c.email || '—'}</span></div>
                <div class="detalle-info-row"><span class="label">Método Pago</span><span class="value">${c.metodo_pago || '—'}</span></div>
                ${c.total_pedido != null ? `<div class="detalle-info-row"><span class="label">Total Pedido</span><span class="value" style="color:var(--dash-fucsia);font-weight:700;">S/ ${Number(c.total_pedido).toFixed(2)}</span></div>` : ''}
            </div>
        </div>
        <div style="margin-top:16px;padding:16px;background:#f9fafb;border-radius:12px;text-align:center;">
            <i class="bi bi-receipt" style="font-size:2rem;color:var(--dash-text-muted);display:block;margin-bottom:8px;"></i>
            <p style="margin:0;font-size:.85rem;color:var(--dash-text-muted);">Haz clic en <strong>"Imprimir / PDF"</strong> para generar una vista imprimible de este comprobante.</p>
        </div>`;

    document.getElementById('modalDetalleComprobante').classList.add('show');
}

function cerrarDetalleComprobante() {
    document.getElementById('modalDetalleComprobante').classList.remove('show');
    comprobanteActual = null;
}

function imprimirComprobante() {
    const c = comprobanteActual;
    if (!c) return;
    const fecha = c.fecha ? String(c.fecha).slice(0, 10) : '—';
    const tipoLabel = c.tipo || 'Comprobante';

    const ventana = window.open('', '_blank');
    ventana.document.write(`
        <html><head><title>Comprobante ${c.numero || ''}</title>
        <style>
            body { font-family: 'Courier New', monospace; padding: 40px; max-width: 400px; margin: auto; }
            h1 { text-align: center; font-size: 1.5rem; margin-bottom: 4px; color:#FF0066; }
            h2 { text-align: center; font-size: 1rem; color: #666; margin-top: 0; font-weight: normal; }
            hr { border: none; border-top: 2px dashed #333; margin: 20px 0; }
            .row { display: flex; justify-content: space-between; padding: 4px 0; font-size: .9rem; }
            .label { color: #666; }
            .total { font-size: 1.2rem; font-weight: bold; border-top: 2px solid #333; padding-top: 8px; margin-top: 8px; }
            .footer { text-align: center; margin-top: 30px; font-size: .8rem; color: #999; }
        </style></head><body>
        <h1>MASSGO</h1>
        <h2>${tipoLabel} Electrónico</h2>
        <hr>
        <div class="row"><span class="label">Cliente</span><span>${c.cliente || '—'}</span></div>
        <div class="row"><span class="label">Email</span><span>${c.email || '—'}</span></div>
        <div class="row"><span class="label">Documento</span><span>${tipoLabel} ${c.numero || '—'}</span></div>
        <div class="row"><span class="label">Fecha</span><span>${fecha}</span></div>
        <div class="row"><span class="label">Pedido</span><span>#MG-${c.id_pedido}</span></div>
        <div class="row"><span class="label">Método Pago</span><span>${c.metodo_pago || '—'}</span></div>
        <hr>
        <div class="row total"><span>Total</span><span>S/ ${Number(c.monto).toFixed(2)}</span></div>
        <div class="footer">Gracias por tu compra &bull; MassGo</div>
        <script>window.print();window.close();</script>
        </body></html>
    `);
    ventana.document.close();
}

function renderPaginacion(containerId, data, currentPage, fnName, labelSingular, labelPlural) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const total = data.length;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const start = total === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
    const end = Math.min(currentPage * PAGE_SIZE, total);

    let html = `<div class="pagination-info">Mostrando ${start} a ${end} de ${total} ${total === 1 ? labelSingular : labelPlural}</div>`;
    html += `<div class="pagination-controls">`;

    html += `<button class="pag-btn" onclick="${fnName}(${currentPage - 1})" ${currentPage <= 1 ? 'disabled' : ''}><i class="bi bi-chevron-left"></i></button>`;

    let pages = [];
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            pages.push(i);
        } else if (pages[pages.length - 1] !== '...') {
            pages.push('...');
        }
    }
    pages.forEach(p => {
        if (p === '...') {
            html += `<span class="pag-dots">...</span>`;
        } else {
            html += `<button class="pag-btn ${p === currentPage ? 'pag-active' : ''}" onclick="${fnName}(${p})">${p}</button>`;
        }
    });

    html += `<button class="pag-btn" onclick="${fnName}(${currentPage + 1})" ${currentPage >= totalPages ? 'disabled' : ''}><i class="bi bi-chevron-right"></i></button>`;
    html += `</div>`;

    container.innerHTML = html;
}

// ===== WHATSAPP LOG =====
let whatsappConversaciones = [];

async function renderWhatsApp() {
    const statusEl = document.getElementById('whatsappStatus');
    const container = document.getElementById('whatsappConversaciones');
    if (!container) return;
    statusEl.innerHTML = '<div class="text-center py-3 text-muted"><div class="spinner-border spinner-border-sm me-2" role="status"></div>Cargando conversaciones...</div>';

    try {
        const res = await fetch('http://localhost:8000/api/whatsapp/conversations');
        if (!res.ok) throw new Error('HTTP ' + res.status);
        whatsappConversaciones = await res.json();
    } catch (e) {
        statusEl.innerHTML = '<div class="alert alert-danger py-2 mb-3">Error al cargar: ' + e.message + '</div>';
        container.innerHTML = '';
        return;
    }

    statusEl.innerHTML = '';
    if (whatsappConversaciones.length === 0) {
        container.innerHTML = '<div class="text-center py-5 text-muted"><i class="bi bi-whatsapp" style="font-size:3rem;display:block;margin-bottom:12px;opacity:.3;"></i>Aún no hay conversaciones desde WhatsApp</div>';
        return;
    }

    let html = '';
    for (const conv of whatsappConversaciones) {
        const num = conv.numero;
        const msgs = conv.mensajes || [];
        html += '<div class="dash-card mb-3">' +
            '<div class="card-header-simple" style="padding:10px 16px;">' +
            '<h6 style="margin:0;font-size:.9rem;"><i class="bi bi-person-circle me-1"></i> +' + num +
            '<span class="badge bg-secondary ms-2" style="font-size:.7rem;">' + msgs.length + ' mensajes</span></h6></div>' +
            '<div style="padding:8px 16px 12px;">';

        for (const m of msgs) {
            const rol = m.role === 'user' ? 'Usuario' : 'Bot';
            const color = m.role === 'user' ? '#e3f2fd' : '#f3e5f5';
            const align = m.role === 'user' ? 'left' : 'right';
            const ts = m.timestamp ? new Date(m.timestamp * 1000).toLocaleTimeString() : '';

            let badge = '';
            if (m.source === 'gemini') {
                badge = '<span class="badge bg-success ms-1" style="font-size:.6rem;">Gemini</span>';
            } else if (m.source === 'fallback') {
                badge = '<span class="badge bg-warning text-dark ms-1" style="font-size:.6rem;">Estatico</span>';
            }

            html += '<div style="display:flex;flex-direction:column;align-items:' + (align === 'right' ? 'flex-end' : 'flex-start') + ';margin:4px 0;">' +
                '<div style="background:' + color + ';border-radius:12px;padding:6px 12px;max-width:85%;font-size:.82rem;line-height:1.4;">' +
                '<strong style="font-size:.7rem;color:#666;">' + rol + '</strong> ' + badge + '<br>' +
                m.content + '</div>' +
                '<small style="font-size:.65rem;color:#999;margin-top:1px;">' + ts + '</small></div>';
        }

        html += '</div></div>';
    }
    container.innerHTML = html;
}

function refreshWhatsApp() {
    renderWhatsApp();
}

// ===== PAGINACIÓN CIRCULAR (pedidos) =====
function renderPaginacionCircular(containerId, data, currentPage, fnName, labelSingular, labelPlural) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const total = data.length;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const start = total === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
    const end = Math.min(currentPage * PAGE_SIZE, total);

    let html = `<div class="pagination-info">Mostrando ${start} a ${end} de ${total} ${total === 1 ? labelSingular : labelPlural}</div>`;
    html += `<div class="pagination-controls">`;

    html += `<button class="pag-btn-circle" onclick="${fnName}(${currentPage - 1})" ${currentPage <= 1 ? 'disabled' : ''}><i class="bi bi-chevron-left"></i></button>`;

    let pages = [];
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            pages.push(i);
        } else if (pages[pages.length - 1] !== '...') {
            pages.push('...');
        }
    }
    pages.forEach(p => {
        if (p === '...') {
            html += `<span class="pag-dots-circle">...</span>`;
        } else {
            html += `<button class="pag-btn-circle ${p === currentPage ? 'pag-active-circle' : ''}" onclick="${fnName}(${p})">${p}</button>`;
        }
    });

    html += `<button class="pag-btn-circle" onclick="${fnName}(${currentPage + 1})" ${currentPage >= totalPages ? 'disabled' : ''}><i class="bi bi-chevron-right"></i></button>`;
    html += `</div>`;

    container.innerHTML = html;
}

// ===== REAL-TIME AUTO-REFRESH =====
function iniciarAutoRefresh() {
    if (autoRefreshInterval) clearInterval(autoRefreshInterval);
    autoRefreshInterval = setInterval(refreshDashboardData, AUTO_REFRESH_MS);
}

async function refreshDashboardData() {
    try {
        const viewActiva = document.querySelector('.dash-view.active')?.id;
        const [nuevosProductos, nuevosPedidos, dashboardData, nuevosDescuentos, nuevosComprobantes] = await Promise.all([
            apiFetch('/productos/?limite=100').catch(() => null),
            apiFetch('/pedidos/?limite=100').catch(() => null),
            apiFetch('/dashboard/data').catch(() => null),
            apiFetch('/descuentos/').catch(() => null),
            apiFetch('/comprobantes/?limite=100').catch(() => null),
        ]);

        if (nuevosProductos) productosData = nuevosProductos;
        if (nuevosDescuentos) descuentosData = nuevosDescuentos;
        if (nuevosComprobantes) comprobantesData = nuevosComprobantes;
        if (nuevosPedidos) {
            const nuevosCount = nuevosPedidos.length;
            if (pedidosCountAnterior > 0 && nuevosCount > pedidosCountAnterior) {
                const diff = nuevosCount - pedidosCountAnterior;
                mostrarNotificacion(`🆕 ${diff} nuevo${diff > 1 ? 's' : ''} pedido${diff > 1 ? 's' : ''} recibido${diff > 1 ? 's' : ''}`);
                try {
                    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                    const osc = audioCtx.createOscillator();
                    const gain = audioCtx.createGain();
                    osc.connect(gain);
                    gain.connect(audioCtx.destination);
                    osc.frequency.value = 800;
                    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
                    osc.start(audioCtx.currentTime);
                    osc.stop(audioCtx.currentTime + 0.3);
                } catch (e) { /* audio no disponible */ }
            }
            pedidosCountAnterior = nuevosCount;
            pedidosData = nuevosPedidos;
        }

        if (viewActiva === 'view-dashboard' && dashboardData) {
            document.getElementById('metrica-pendientes').textContent = String(dashboardData.metricas?.pedidos_pendientes ?? 0);
            document.getElementById('metrica-pedidos').textContent = String(dashboardData.metricas?.total_pedidos ?? 0);
            document.getElementById('metrica-usuarios').textContent = String(dashboardData.metricas?.usuarios_activos ?? 0);

            const recientes = dashboardData.pedidos_recientes || [];
            const tbody = document.getElementById('dashboardPedidosBody');
            if (tbody) {
                tbody.innerHTML = recientes.length
                    ? recientes.map(p => {
                        const estados = { 'Preparando': 'badge-preparando', 'En despacho': 'badge-en-camino', 'Entregado': 'badge-entregado', 'Cancelado': 'badge-cancelado', 'Pendiente': 'badge-preparando' };
                        return `<tr>
                            <td><span class="order-id">#MG-${p.id_pedido}</span></td>
                            <td>${p.cliente || `Usuario #${p.id_usuario || ''}`}</td>
                            <td>S/ ${Number(p.total).toFixed(2)}</td>
                            <td><span class="badge-dash ${estados[p.estado] || 'badge-preparando'}">${p.estado}</span></td>
                        </tr>`;
                    }).join('')
                    : '<tr><td colspan="4" class="text-center py-3 text-muted">No hay pedidos recientes</td></tr>';
            }

            const alertas = dashboardData.alertas_stock || [];
            const container = document.getElementById('dashboardAlertasStock');
            if (container) {
                container.innerHTML = alertas.length
                    ? alertas.map(p => {
                        const isOut = p.stock === 0 || p.estado === 'Agotado';
                        return `<div class="stock-item ${isOut ? 'stock-out' : 'stock-low'}">
                            <div class="stock-img" style="background:${isOut ? '#FFE6EE' : '#FFF0E6'};">
                                <i class="bi ${isOut ? 'bi-bag-x' : 'bi-basket'}" style="color:${isOut ? '#E6005C' : '#FF6B35'};"></i>
                            </div>
                            <div class="stock-info">
                                <span class="stock-name">${p.nombre}</span>
                                <span class="stock-meta">${isOut ? '<strong>Agotado</strong>' : `Quedan <strong>${p.stock}</strong> unidades`}</span>
                            </div>
                            <span class="stock-badge ${isOut ? 'badge-stock-agotado' : 'badge-stock-bajo'}">${isOut ? 'Agotado' : 'Stock Bajo'}</span>
                        </div>`;
                    }).join('')
                    : '<div class="text-center py-3 text-muted">No hay alertas de stock</div>';
            }
        }

        if (viewActiva === 'view-productos') { renderProductos(); renderPaginacionProductos(); }
        if (viewActiva === 'view-pedidos') { renderPedidos(); renderPaginacionPedidos(); }
        if (viewActiva === 'view-comprobantes') { renderComprobantes(); renderPaginacionComprobantes(); }
    } catch (e) {
        // Silenciar errores de auto-refresh para no molestar
    }
}

// ===== NOTIFICACIONES EN TIEMPO REAL =====
function mostrarNotificacion(mensaje) {
    const notifDot = document.querySelector('.notif-dot');
    if (notifDot) {
        notifDot.classList.add('active');
        notifDot.textContent = '!';
    }

    const existing = document.querySelector('.notificacion-flotante');
    if (existing) existing.remove();

    const div = document.createElement('div');
    div.className = 'notificacion-flotante';
    div.innerHTML = mensaje;
    div.style.cssText = `
        position: fixed; bottom: 24px; right: 24px;
        background: linear-gradient(135deg, #FF0066, #ff4d8a);
        color: white; padding: 14px 22px; border-radius: 16px;
        font-weight: 600; font-size: .9rem; z-index: 10000;
        box-shadow: 0 8px 30px rgba(254,12,101,.4);
        animation: slideInUp .4s ease; max-width: 360px;
        display: flex; align-items: center; gap: 10px;
        cursor: pointer;
    `;
    document.body.appendChild(div);
    setTimeout(() => {
        div.style.transition = 'opacity .5s, transform .5s';
        div.style.opacity = '0';
        div.style.transform = 'translateY(20px)';
        setTimeout(() => div.remove(), 500);
    }, 5000);
    div.addEventListener('click', () => {
        div.remove();
        if (notifDot) notifDot.classList.remove('active');
        showView('pedidos');
    });
}

// Insertar estilo de notificación
(function injectNotifStyle() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInUp {
            from { opacity: 0; transform: translateY(40px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .notif-dot {
            display: none !important;
            position: absolute; top: 4px; right: 4px;
            width: 18px; height: 18px; border-radius: 50%;
            background: #FF0066; color: white;
            font-size: .65rem; font-weight: 800;
            align-items: center; justify-content: center;
            animation: pulseNotif 1.5s infinite;
            border: 2px solid white;
            z-index: 2;
        }
        .notif-dot.active { display: flex !important; }
        @keyframes pulseNotif {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.15); }
        }
        .btn-notif { position: relative; }
    `;
    document.head.appendChild(style);
})();

// ===== MODAL CLOSE ON OVERLAY =====
document.addEventListener('click', function (e) {
    const modal = document.getElementById('modalProducto');
    if (modal && modal.classList.contains('show') && e.target === modal) cerrarModalProducto();
    const modal2 = document.getElementById('modalDetallePedido');
    if (modal2 && modal2.classList.contains('show') && e.target === modal2) cerrarDetallePedido();
    const modal3 = document.getElementById('modalCategoria');
    if (modal3 && modal3.classList.contains('show') && e.target === modal3) cerrarModalCategoria();
    const modal4 = document.getElementById('modalDetalleComprobante');
    if (modal4 && modal4.classList.contains('show') && e.target === modal4) cerrarDetalleComprobante();
    const modal5 = document.getElementById('modalDescuento');
    if (modal5 && modal5.classList.contains('show') && e.target === modal5) cerrarModalDescuento();
});

// ===== DESCUENTOS CRUD =====
const DESCUENTOS_PAGE_SIZE = 15;

function renderDescuentos() {
    const q = (document.getElementById('searchDescuentos')?.value || '').toLowerCase();
    let lista = descuentosData;
    if (q) {
        lista = lista.filter(d =>
            String(d.codigo).toLowerCase().includes(q) ||
            String(d.descripcion || '').toLowerCase().includes(q) ||
            String(d.tipo || '').toLowerCase().includes(q)
        );
    }
    const start = (descuentosPage - 1) * DESCUENTOS_PAGE_SIZE;
    const pageItems = lista.slice(start, start + DESCUENTOS_PAGE_SIZE);
    const container = document.getElementById('descuentosList');
    if (!container) return;

    if (pageItems.length === 0) {
        container.innerHTML = '<div class="text-center py-5 text-muted">No hay códigos de descuento</div>';
        return;
    }

    container.innerHTML = pageItems.map(d => {
        const badge = d.activo ? 'success' : 'secondary';
        const valor = d.tipo === 'porcentaje' ? `${d.valor}%` : `S/ ${parseFloat(d.valor).toFixed(2)}`;
        const usos = d.usos || 0;
        const maxUso = d.uso_maximo || '∞';
        const min = parseFloat(d.monto_minimo || 0).toFixed(2);
        const exp = d.fecha_expiracion ? d.fecha_expiracion.slice(0, 10) : '—';
        return `<div class="prod-card">
            <span class="prod-col" style="width:50px;font-weight:600;">${d.id}</span>
            <span class="prod-col prod-col--nombre" style="flex:1;font-weight:700;font-family:monospace;letter-spacing:.5px;">${d.codigo}</span>
            <span class="prod-col" style="width:100px;">${d.tipo === 'porcentaje' ? '%' : 'Fijo'}</span>
            <span class="prod-col" style="width:80px;text-align:center;font-weight:700;">${valor}</span>
            <span class="prod-col" style="width:90px;text-align:center;">${usos}</span>
            <span class="prod-col" style="width:90px;text-align:center;">${maxUso}</span>
            <span class="prod-col" style="width:100px;text-align:center;">S/ ${min}</span>
            <span class="prod-col" style="width:70px;text-align:center;"><span class="badge bg-${badge}" style="font-size:.7rem;">${d.activo ? 'Sí' : 'No'}</span></span>
            <span class="prod-col" style="width:100px;font-size:.75rem;">${exp}</span>
            <span class="prod-col prod-col--accion" style="width:100px;text-align:center;">
                <button class="btn-action btn-edit" onclick="editarDescuento(${d.id})" title="Editar"><i class="bi bi-pencil-fill"></i></button>
                <button class="btn-action btn-delete" onclick="eliminarDescuento(${d.id})" title="Eliminar"><i class="bi bi-trash3-fill"></i></button>
            </span>
        </div>`;
    }).join('');
}

function renderPaginacionDescuentos() {
    const q = (document.getElementById('searchDescuentos')?.value || '').toLowerCase();
    let lista = descuentosData;
    if (q) lista = lista.filter(d => String(d.codigo).toLowerCase().includes(q));
    const totalPages = Math.ceil(lista.length / DESCUENTOS_PAGE_SIZE);
    const container = document.getElementById('paginacionDescuentos');
    if (!container) return;
    let html = `<div class="paginacion">`;
    html += `<button class="pag-btn" onclick="descuentosPage=1;renderDescuentos();renderPaginacionDescuentos();" ${descuentosPage <= 1 ? 'disabled' : ''}><i class="bi bi-chevron-left"></i><i class="bi bi-chevron-left"></i></button>`;
    html += `<button class="pag-btn" onclick="descuentosPage--;renderDescuentos();renderPaginacionDescuentos();" ${descuentosPage <= 1 ? 'disabled' : ''}><i class="bi bi-chevron-left"></i></button>`;
    html += `<span class="pag-info">Pág. ${descuentosPage} de ${totalPages || 1}</span>`;
    html += `<button class="pag-btn" onclick="descuentosPage++;renderDescuentos();renderPaginacionDescuentos();" ${descuentosPage >= totalPages ? 'disabled' : ''}><i class="bi bi-chevron-right"></i></button>`;
    html += `<button class="pag-btn" onclick="descuentosPage=${totalPages || 1};renderDescuentos();renderPaginacionDescuentos();" ${descuentosPage >= totalPages ? 'disabled' : ''}><i class="bi bi-chevron-right"></i><i class="bi bi-chevron-right"></i></button>`;
    html += `</div>`;
    container.innerHTML = html;
}

let editingDescuentoId = null;

function abrirModalDescuento(data) {
    editingDescuentoId = data?.id || null;
    document.getElementById('modalDescuentoTitulo').textContent = editingDescuentoId ? 'Editar Código de Descuento' : 'Nuevo Código de Descuento';
    document.getElementById('inputCodigoDescuento').value = data?.codigo || '';
    document.getElementById('inputTipoDescuento').value = data?.tipo || 'porcentaje';
    document.getElementById('inputValorDescuento').value = data?.valor || '';
    document.getElementById('inputMinimoDescuento').value = data?.monto_minimo || 0;
    document.getElementById('inputUsoMaximoDescuento').value = data?.uso_maximo || '';
    document.getElementById('inputExpiracionDescuento').value = data?.fecha_expiracion ? data.fecha_expiracion.slice(0, 10) : '';
    document.getElementById('inputActivoDescuento').value = data?.activo !== false ? 'true' : 'false';
    document.getElementById('inputDescripcionDescuento').value = data?.descripcion || '';
    document.getElementById('modalDescuento').classList.add('show');
}

function editarDescuento(id) {
    const d = descuentosData.find(x => x.id === id);
    if (d) abrirModalDescuento(d);
}

function cerrarModalDescuento() {
    document.getElementById('modalDescuento').classList.remove('show');
    editingDescuentoId = null;
}

async function guardarDescuento() {
    const codigo = document.getElementById('inputCodigoDescuento').value.trim().toUpperCase();
    if (!codigo) { alert('Ingresa un código'); return; }
    const payload = {
        codigo,
        tipo_descuento: document.getElementById('inputTipoDescuento').value,
        valor: parseFloat(document.getElementById('inputValorDescuento').value) || 0,
        monto_minimo: parseFloat(document.getElementById('inputMinimoDescuento').value) || 0,
        uso_maximo: parseInt(document.getElementById('inputUsoMaximoDescuento').value) || null,
        fecha_expiracion: document.getElementById('inputExpiracionDescuento').value || null,
        activo: document.getElementById('inputActivoDescuento').value === 'true',
        descripcion: document.getElementById('inputDescripcionDescuento').value.trim(),
    };
    try {
        if (editingDescuentoId) {
            await apiFetch(`/descuentos/${editingDescuentoId}`, { method: 'PUT', body: JSON.stringify(payload) });
            const idx = descuentosData.findIndex(d => d.id === editingDescuentoId);
            if (idx >= 0) descuentosData[idx] = { ...descuentosData[idx], ...payload };
        } else {
            const nuevo = await apiFetch('/descuentos/', { method: 'POST', body: JSON.stringify(payload) });
            descuentosData.push(nuevo);
        }
        cerrarModalDescuento();
        renderDescuentos();
        renderPaginacionDescuentos();
    } catch (e) {
        alert('Error: ' + e.message);
    }
}

async function eliminarDescuento(id) {
    if (!confirm('¿Eliminar este código de descuento?')) return;
    try {
        await apiFetch(`/descuentos/${id}`, { method: 'DELETE' });
        descuentosData = descuentosData.filter(d => d.id !== id);
        renderDescuentos();
        renderPaginacionDescuentos();
    } catch (e) {
        alert('Error: ' + e.message);
    }
}

// ── LOGIN / LOGOUT ──
function cerrarSesion() {
    document.getElementById('modalLogout').classList.add('show');
}

function confirmarCerrarSesion() {
    document.getElementById('modalLogout').classList.remove('show');
    sessionStorage.removeItem('massgo_admin');
    location.reload();
}

function iniciarSesion() {
    const user = document.getElementById('loginUser').value.trim();
    const pass = document.getElementById('loginPass').value.trim();
    const error = document.getElementById('loginError');
    if (user === 'massgo' && pass === 'grupo2') {
        sessionStorage.setItem('massgo_admin', 'true');
        document.getElementById('loginOverlay').style.display = 'none';
        refreshDashboardData();
    } else {
        error.textContent = 'Credenciales incorrectas';
        error.classList.add('show');
        document.getElementById('loginPass').value = '';
        document.getElementById('loginPass').focus();
    }
}
document.addEventListener('DOMContentLoaded', function () {
    const passField = document.getElementById('loginPass');
    if (passField) {
        passField.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') iniciarSesion();
        });
    }
    const userField = document.getElementById('loginUser');
    if (userField) {
        userField.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') document.getElementById('loginPass').focus();
        });
    }
});
