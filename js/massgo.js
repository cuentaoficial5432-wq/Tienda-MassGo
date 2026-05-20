/* ============================================
   MASSGO - Lógica Compartida del Carrito
   Mass Trujillo Team
   ============================================ */

// ---- BASE DE DATOS DE PRODUCTOS ----
const PRODUCTOS = [
    {
        id: 1,
        nombre: "Plátano Cavendish Premium",
        descripcion: "Plátanos frescos y dulces, seleccionados cuidadosamente para ti. Perfectos para el desayuno, licuados o como snack saludable durante el día. Ricos en potasio y energía.",
        precio: 1.99,
        precioAntiguo: 2.50,
        descuento: 20,
        imagen: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=400&fit=crop",
        categoria: "Frutas y Verduras",
        stock: 15,
        rating: 4.9,
        reseñas: 128,
        badge: "MÁS VENDIDO",
        complementos: [2, 9, 10, 11]
    },
    {
        id: 2,
        nombre: "Leche Gloria Entera 1L",
        descripcion: "Leche entera pasteurizada de alta calidad. Ideal para toda la familia, rica en calcio y vitaminas esenciales.",
        precio: 5.90,
        precioAntiguo: null,
        descuento: 0,
        imagen: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=400&fit=crop",
        categoria: "Lácteos",
        stock: 30,
        rating: 5.0,
        reseñas: 245,
        badge: null,
        complementos: [1, 3, 9, 12]
    },
    {
        id: 3,
        nombre: "Pan de Molde Blanco",
        descripcion: "Pan de molde suave y esponjoso, perfecto para sándwiches y tostadas. Sin conservantes artificiales.",
        precio: 3.20,
        precioAntiguo: 3.80,
        descuento: 15,
        imagen: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=400&fit=crop",
        categoria: "Abarrotes",
        stock: 0,
        rating: 4.0,
        reseñas: 89,
        badge: null,
        complementos: [2, 9, 12, 13]
    },
    {
        id: 4,
        nombre: "Coca Cola 2.5L",
        descripcion: "La clásica Coca-Cola en presentación familiar de 2.5 litros. Perfecta para compartir en casa.",
        precio: 8.50,
        precioAntiguo: null,
        descuento: 0,
        imagen: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&h=400&fit=crop",
        categoria: "Bebidas",
        stock: 20,
        rating: 5.0,
        reseñas: 312,
        badge: null,
        complementos: [8, 5, 6, 7]
    },
    {
        id: 5,
        nombre: "Arroz Costeño 5kg",
        descripcion: "Arroz de grano largo, seleccionado y procesado para garantizar la mejor calidad en cada plato.",
        precio: 18.90,
        precioAntiguo: 26.90,
        descuento: 30,
        imagen: "https://images.unsplash.com/photo-1584473457406-6240486418e9?w=400&h=400&fit=crop",
        categoria: "Abarrotes",
        stock: 12,
        rating: 4.5,
        reseñas: 178,
        badge: "OFERTA",
        complementos: [7, 6, 14, 15]
    },
    {
        id: 6,
        nombre: "Detergente Líquido 1L",
        descripcion: "Detergente líquido concentrado con fórmula activa que elimina manchas difíciles en el primer lavado.",
        precio: 12.50,
        precioAntiguo: null,
        descuento: 0,
        imagen: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400&h=400&fit=crop",
        categoria: "Limpieza",
        stock: 8,
        rating: 4.0,
        reseñas: 67,
        badge: null,
        complementos: []
    },
    {
        id: 7,
        nombre: "Aceite Vegetal 1L",
        descripcion: "Aceite vegetal refinado, ideal para frituras y preparaciones culinarias. Sin colesterol.",
        precio: 9.90,
        precioAntiguo: 11.00,
        descuento: 10,
        imagen: "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=400&h=400&fit=crop",
        categoria: "Abarrotes",
        stock: 25,
        rating: 5.0,
        reseñas: 203,
        badge: null,
        complementos: [5, 14, 15, 16]
    },
    {
        id: 8,
        nombre: "Papas Fritas Lay's 150g",
        descripcion: "Las clásicas papas fritas Lay's en su presentación familiar. Crujientes y deliciosas.",
        precio: 4.50,
        precioAntiguo: null,
        descuento: 0,
        imagen: "https://images.unsplash.com/photo-1621447504864-d8686e12698c?w=400&h=400&fit=crop",
        categoria: "Snacks",
        stock: 40,
        rating: 3.5,
        reseñas: 156,
        badge: null,
        complementos: [4, 17, 18, 19]
    },
    {
        id: 9,
        nombre: "Avena en Hojuelas 500g",
        descripcion: "Avena en hojuelas de alta fibra, ideal para un desayuno nutritivo y energizante.",
        precio: 1.80,
        precioAntiguo: null,
        descuento: 0,
        imagen: "https://images.unsplash.com/photo-1584473457406-6240486418e9?w=400&h=400&fit=crop",
        categoria: "Abarrotes",
        stock: 20,
        rating: 4.5,
        reseñas: 95,
        badge: null,
        complementos: [1, 2, 10, 11]
    },
    {
        id: 10,
        nombre: "Yogurt Natural 1L",
        descripcion: "Yogurt natural sin azúcar añadida, rico en probióticos para una digestión saludable.",
        precio: 3.10,
        precioAntiguo: null,
        descuento: 0,
        imagen: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&h=400&fit=crop",
        categoria: "Lácteos",
        stock: 18,
        rating: 4.8,
        reseñas: 112,
        badge: null,
        complementos: [1, 9, 11, 2]
    },
    {
        id: 11,
        nombre: "Miel de Abeja 250g",
        descripcion: "Miel pura de abeja, cosechada artesanalmente. Endulzante natural con propiedades antioxidantes.",
        precio: 4.50,
        precioAntiguo: null,
        descuento: 0,
        imagen: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&h=400&fit=crop",
        categoria: "Abarrotes",
        stock: 10,
        rating: 4.7,
        reseñas: 78,
        badge: null,
        complementos: [1, 9, 10, 2]
    }
];

// ---- GESTIÓN DEL CARRITO ----
function getCarrito() {
    const data = localStorage.getItem('massgo_carrito');
    return data ? JSON.parse(data) : [];
}

function setCarrito(carrito) {
    localStorage.setItem('massgo_carrito', JSON.stringify(carrito));
}

function agregarAlCarrito(productoId, cantidad = 1) {
    // Busca en PRODUCTOS locales primero; si no, en CATALOGO_EXTENDIDO (api.js)
    let producto = PRODUCTOS.find(p => p.id === productoId);
    if (!producto && typeof CATALOGO_EXTENDIDO !== 'undefined') {
        const ext = CATALOGO_EXTENDIDO.find(p => p.id === productoId);
        if (ext) {
            producto = {
                id: ext.id, nombre: ext.nombre, precio: ext.precio,
                imagen: ext.img, stock: ext.stock
            };
        }
    }
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
            stock: producto.stock
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
    if (carrito[idx].cantidad <= 0) {
        carrito.splice(idx, 1);
    }
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

// ---- TOAST NOTIFICATION ----
function mostrarToast(mensaje, tipo = 'success') {
    let alerta = document.getElementById('alertaCarrito');
    if (!alerta) return;
    const iconos = { success: 'fa-check-circle', warning: 'fa-exclamation-triangle', error: 'fa-times-circle' };
    const colores = { success: 'linear-gradient(135deg, #fe0c65, #ff4d8a)', warning: 'linear-gradient(135deg, #f1b81b, #ff9500)', error: 'linear-gradient(135deg, #e53935, #ef5350)' };
    alerta.innerHTML = `<i class="fas ${iconos[tipo] || iconos.success} me-2"></i> ${mensaje}`;
    alerta.style.background = colores[tipo] || colores.success;
    alerta.style.display = 'block';
    setTimeout(() => { alerta.style.display = 'none'; }, 2800);
}

// ---- GENERAR NÚMERO DE PEDIDO ----
function generarNumeroPedido() {
    return '#MG-' + Math.floor(1000000 + Math.random() * 9000000);
}

// ---- INIT ----
document.addEventListener('DOMContentLoaded', () => {
    actualizarContadorCarrito();
});
