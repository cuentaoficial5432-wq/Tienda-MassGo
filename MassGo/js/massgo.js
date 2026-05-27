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
