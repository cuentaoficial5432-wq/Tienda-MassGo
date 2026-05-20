/* ─────────────────────────────────────────
   CATÁLOGO EXTENDIDO — Productos peruanos
   IDs desde 100 para no colisionar con PRODUCTOS (massgo.js)
───────────────────────────────────────── */
const CATALOGO_EXTENDIDO = [

    // ── LÁCTEOS ──────────────────────────────────────────────────
    {
        id: 100,
        nombre: 'Leche Gloria Entera 1L',
        descripcion: 'Leche entera pasteurizada de alta calidad Gloria. Rica en calcio y vitaminas esenciales para toda la familia. Presentación de 1 litro, ideal para el desayuno diario.',
        marca: 'Gloria',
        precio: 5.90, ant: null, descuento: 0,
        img: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=400&fit=crop',
        cat: 'Lácteos', stock: 30, rating: 5.0, resenas: 245
    },
    {
        id: 101,
        nombre: 'Yogurt Laive Fresa 1kg',
        descripcion: 'Yogurt cremoso sabor fresa Laive, con cultivos activos y probióticos. Sin colorantes artificiales. Perfecto para el desayuno o como snack saludable.',
        marca: 'Laive',
        precio: 7.50, ant: 8.90, descuento: 16,
        img: 'https://images.unsplash.com/photo-1571212515416-fef01fc43637?w=400&h=400&fit=crop',
        cat: 'Lácteos', stock: 20, rating: 4.7, resenas: 132
    },
    {
        id: 102,
        nombre: 'Queso Fresco Laive 500g',
        descripcion: 'Queso fresco suave y cremoso Laive, elaborado con leche fresca pasteurizada. Ideal para ensaladas, sándwiches y platos típicos peruanos.',
        marca: 'Laive',
        precio: 12.90, ant: null, descuento: 0,
        img: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&h=400&fit=crop',
        cat: 'Lácteos', stock: 15, rating: 4.5, resenas: 88
    },
    {
        id: 103,
        nombre: 'Mantequilla Gloria 200g',
        descripcion: 'Mantequilla Gloria con sabor suave y textura cremosa. Elaborada con leche fresca seleccionada. Perfecta para untar, cocinar y hornear.',
        marca: 'Gloria',
        precio: 8.50, ant: 9.90, descuento: 14,
        img: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&h=400&fit=crop',
        cat: 'Lácteos', stock: 25, rating: 4.6, resenas: 97
    },

    // ── BEBIDAS ───────────────────────────────────────────────────
    {
        id: 104,
        nombre: 'Inca Kola 2.5L',
        descripcion: 'La bebida de sabor nacional en presentación familiar de 2.5 litros. Refrescante y con el inconfundible sabor dulce que todos conocen. Perfecta para compartir.',
        marca: 'Inca Kola',
        precio: 8.50, ant: null, descuento: 0,
        img: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&h=400&fit=crop',
        cat: 'Bebidas', stock: 40, rating: 5.0, resenas: 310
    },
    {
        id: 105,
        nombre: 'Coca-Cola 3L',
        descripcion: 'La clásica Coca-Cola en su presentación más grande de 3 litros. Ideal para reuniones y celebraciones familiares. Sabor inconfundible y refrescante.',
        marca: 'Coca-Cola',
        precio: 9.90, ant: 11.50, descuento: 14,
        img: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&h=400&fit=crop',
        cat: 'Bebidas', stock: 35, rating: 4.9, resenas: 278
    },
    {
        id: 106,
        nombre: 'Agua San Luis 2.5L',
        descripcion: 'Agua mineral natural San Luis, sin gas, en presentación de 2.5 litros. Pureza garantizada, ideal para hidratarte durante todo el día.',
        marca: 'San Luis',
        precio: 3.50, ant: null, descuento: 0,
        img: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&h=400&fit=crop',
        cat: 'Bebidas', stock: 60, rating: 4.8, resenas: 195
    },
    {
        id: 107,
        nombre: 'Jugo Pulp Naranja 1L',
        descripcion: 'Jugo de naranja Pulp con trozos de fruta real. Sin conservantes artificiales, rico en vitamina C. La mejor opción para un desayuno nutritivo.',
        marca: 'Pulp',
        precio: 5.20, ant: 6.50, descuento: 20,
        img: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&h=400&fit=crop',
        cat: 'Bebidas', stock: 22, rating: 4.6, resenas: 143
    },
    {
        id: 108,
        nombre: 'Café Nescafé Clásico 200g',
        descripcion: 'Café soluble Nescafé Clásico con aroma intenso y sabor equilibrado. Listo en segundos, perfecto para empezar el día con energía. Presentación de 200g.',
        marca: 'Nescafé',
        precio: 18.90, ant: 22.00, descuento: 14,
        img: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=400&fit=crop',
        cat: 'Bebidas', stock: 18, rating: 4.8, resenas: 221
    },

    // ── ABARROTES ─────────────────────────────────────────────────
    {
        id: 109,
        nombre: 'Arroz Costeño Extra 5kg',
        descripcion: 'Arroz Costeño Extra de grano largo, seleccionado y procesado para garantizar la mejor calidad. Cocción perfecta, granos sueltos y sabor suave en cada plato.',
        marca: 'Costeño',
        precio: 18.90, ant: 26.90, descuento: 30,
        img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop',
        cat: 'Abarrotes', stock: 12, rating: 4.7, resenas: 189
    },
    {
        id: 110,
        nombre: 'Aceite Primor 1L',
        descripcion: 'Aceite vegetal Primor refinado, ideal para frituras, salteados y aderezos. Sin colesterol, con vitamina E. La elección de las familias peruanas.',
        marca: 'Primor',
        precio: 9.90, ant: 11.00, descuento: 10,
        img: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=400&fit=crop',
        cat: 'Abarrotes', stock: 28, rating: 4.5, resenas: 167
    },
    {
        id: 111,
        nombre: 'Fideos Don Vittorio Spaghetti 500g',
        descripcion: 'Fideos spaghetti Don Vittorio elaborados con sémola de trigo duro. Textura firme al dente, perfectos para todo tipo de salsas y preparaciones italianas.',
        marca: 'Don Vittorio',
        precio: 3.50, ant: 4.70, descuento: 26,
        img: 'https://images.unsplash.com/photo-1551462147-ff29053bfc14?w=400&h=400&fit=crop',
        cat: 'Abarrotes', stock: 45, rating: 4.4, resenas: 134
    },
    {
        id: 112,
        nombre: 'Azúcar Rubia Cartavio 1kg',
        descripcion: 'Azúcar rubia Cartavio de caña peruana, con sabor natural y aroma característico. Ideal para endulzar bebidas, postres y preparaciones de repostería.',
        marca: 'Cartavio',
        precio: 4.90, ant: null, descuento: 0,
        img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
        cat: 'Abarrotes', stock: 50, rating: 4.3, resenas: 98
    },
    {
        id: 113,
        nombre: 'Atún Florida en Agua 170g',
        descripcion: 'Atún Florida en agua, rico en proteínas y omega-3. Sin conservantes artificiales. Ideal para ensaladas, sándwiches y preparaciones rápidas y nutritivas.',
        marca: 'Florida',
        precio: 5.90, ant: 9.90, descuento: 40,
        img: 'https://images.unsplash.com/photo-1534482421-64566f976cfa?w=400&h=400&fit=crop',
        cat: 'Abarrotes', stock: 33, rating: 4.6, resenas: 211
    },
    {
        id: 114,
        nombre: 'Sal Marina Emsal 1kg',
        descripcion: 'Sal marina Emsal yodada, de grano fino y pureza garantizada. Esencial en toda cocina peruana para realzar el sabor de tus preparaciones diarias.',
        marca: 'Emsal',
        precio: 1.80, ant: null, descuento: 0,
        img: 'https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?w=400&h=400&fit=crop',
        cat: 'Abarrotes', stock: 70, rating: 4.2, resenas: 76
    },
    {
        id: 115,
        nombre: 'Mermelada Fanny Fresa 500g',
        descripcion: 'Mermelada Fanny de fresa con trozos de fruta real. Elaborada con fresas seleccionadas y azúcar natural. Perfecta para el desayuno con pan tostado.',
        marca: 'Fanny',
        precio: 6.90, ant: 8.50, descuento: 19,
        img: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=400&fit=crop',
        cat: 'Abarrotes', stock: 24, rating: 4.5, resenas: 112
    },

    // ── FRUTAS Y VERDURAS ─────────────────────────────────────────
    {
        id: 116,
        nombre: 'Plátano Cavendish Premium 1kg',
        descripcion: 'Plátanos Cavendish frescos y maduros, seleccionados en su punto óptimo. Ricos en potasio, fibra y energía natural. Perfectos para el desayuno o como snack.',
        marca: 'Fresco',
        precio: 1.99, ant: 2.50, descuento: 20,
        img: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=400&fit=crop',
        cat: 'Frutas y Verduras', stock: 15, rating: 4.9, resenas: 128
    },
    {
        id: 117,
        nombre: 'Manzana Delicia 1kg',
        descripcion: 'Manzanas Delicia frescas y crujientes, de pulpa dulce y jugosa. Ricas en fibra y antioxidantes. Ideales para comer solas, en ensaladas o jugos naturales.',
        marca: 'Fresco',
        precio: 4.50, ant: null, descuento: 0,
        img: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&h=400&fit=crop',
        cat: 'Frutas y Verduras', stock: 20, rating: 4.6, resenas: 95
    },
    {
        id: 118,
        nombre: 'Tomate Redondo 1kg',
        descripcion: 'Tomates redondos frescos, maduros y jugosos. Esenciales en la cocina peruana para salsas, ensaladas y guisos. Seleccionados diariamente para garantizar frescura.',
        marca: 'Fresco',
        precio: 2.90, ant: 3.50, descuento: 17,
        img: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400&h=400&fit=crop',
        cat: 'Frutas y Verduras', stock: 18, rating: 4.4, resenas: 83
    },
    {
        id: 119,
        nombre: 'Cebolla Roja 1kg',
        descripcion: 'Cebolla roja fresca de sabor intenso y aroma característico. Ingrediente fundamental en la cocina peruana: ceviche, lomo saltado, ensaladas y más.',
        marca: 'Fresco',
        precio: 2.20, ant: null, descuento: 0,
        img: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&h=400&fit=crop',
        cat: 'Frutas y Verduras', stock: 22, rating: 4.3, resenas: 71
    },

    // ── SNACKS ────────────────────────────────────────────────────
    {
        id: 120,
        nombre: "Papas Fritas Lay's 150g",
        descripcion: "Las clásicas papas fritas Lay's en presentación de 150g. Crujientes, sabrosas y con el sabor original que todos adoran. Perfectas para compartir en cualquier momento.",
        marca: "Lay's",
        precio: 4.50, ant: null, descuento: 0,
        img: 'https://images.unsplash.com/photo-1621447504864-d8686e12698c?w=400&h=400&fit=crop',
        cat: 'Snacks', stock: 40, rating: 4.3, resenas: 156
    },
    {
        id: 121,
        nombre: 'Galletas Oreo 432g',
        descripcion: 'Galletas Oreo en presentación familiar de 432g. El clásico sándwich de galleta de chocolate con relleno de crema. Perfectas para mojar en leche o disfrutar solas.',
        marca: 'Oreo',
        precio: 9.90, ant: 12.00, descuento: 18,
        img: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=400&fit=crop',
        cat: 'Snacks', stock: 30, rating: 4.8, resenas: 203
    },
    {
        id: 122,
        nombre: 'Chifles Inka Chips 100g',
        descripcion: 'Chifles de plátano verde Inka Chips, crujientes y con sabor natural. Snack peruano tradicional, sin gluten y elaborado con ingredientes naturales seleccionados.',
        marca: 'Inka Chips',
        precio: 3.20, ant: null, descuento: 0,
        img: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400&h=400&fit=crop',
        cat: 'Snacks', stock: 35, rating: 4.5, resenas: 118
    },
    {
        id: 123,
        nombre: 'Chocolate Sublime 32g',
        descripcion: 'El clásico chocolate Sublime peruano con maní y cobertura de chocolate con leche. Sabor inconfundible que acompaña a los peruanos desde siempre. Presentación de 32g.',
        marca: 'Sublime',
        precio: 1.50, ant: null, descuento: 0,
        img: 'https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=400&h=400&fit=crop',
        cat: 'Snacks', stock: 60, rating: 4.9, resenas: 287
    },

    // ── LIMPIEZA ──────────────────────────────────────────────────
    {
        id: 124,
        nombre: 'Detergente Ariel 2kg',
        descripcion: 'Detergente en polvo Ariel con fórmula activa que elimina manchas difíciles desde el primer lavado. Deja la ropa con aroma fresco y colores brillantes. Presentación 2kg.',
        marca: 'Ariel',
        precio: 22.90, ant: 28.00, descuento: 18,
        img: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400&h=400&fit=crop',
        cat: 'Limpieza', stock: 16, rating: 4.7, resenas: 174
    },
    {
        id: 125,
        nombre: 'Lejía Clorox 1L',
        descripcion: 'Lejía Clorox desinfectante con fórmula concentrada. Elimina el 99.9% de gérmenes y bacterias. Ideal para desinfectar superficies, ropa blanca y baños del hogar.',
        marca: 'Clorox',
        precio: 5.50, ant: null, descuento: 0,
        img: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400&h=400&fit=crop',
        cat: 'Limpieza', stock: 28, rating: 4.6, resenas: 142
    },
    {
        id: 126,
        nombre: 'Jabón Bolívar 360g x3',
        descripcion: 'Pack de 3 jabones Bolívar de 360g cada uno. Fórmula activa que elimina manchas difíciles en ropa de color y blanca. El jabón de lavado más confiable del Perú.',
        marca: 'Bolívar',
        precio: 7.90, ant: 9.50, descuento: 17,
        img: 'https://images.unsplash.com/photo-1584305574647-0cc949a2bb9f?w=400&h=400&fit=crop',
        cat: 'Limpieza', stock: 22, rating: 4.5, resenas: 109
    },
    {
        id: 127,
        nombre: 'Papel Higiénico Elite 4 rollos',
        descripcion: 'Papel higiénico Elite suave y resistente, doble hoja. Pack de 4 rollos con mayor rendimiento. Suavidad premium para el cuidado e higiene de toda la familia.',
        marca: 'Elite',
        precio: 6.90, ant: null, descuento: 0,
        img: 'https://www.elite.com.pe/assets/uploads/images/25eca-d099c-elite-suave-y-resistente-dh-20m-x4-min.png',
        cat: 'Limpieza', stock: 45, rating: 4.4, resenas: 131
    }
];

/* ─────────────────────────────────────────
   ESTADO DE PAGINACIÓN
───────────────────────────────────────── */
const CATALOGO_ESTADO = {
    pagina: 0,
    porPagina: 8,
    get inicio() { return this.pagina * this.porPagina; },
    get fin()    { return this.inicio + this.porPagina; },
    get hayMas() { return this.fin < CATALOGO_EXTENDIDO.length; }
};

/* ─────────────────────────────────────────
   HELPERS
───────────────────────────────────────── */

function _renderEstrellasAPI(rating) {
    let html = '';
    for (let i = 1; i <= 5; i++) {
        if (rating >= i)
            html += '<i class="bi bi-star-fill" style="color:var(--amarillo-fuerte);font-size:.72rem;"></i>';
        else if (rating >= i - 0.5)
            html += '<i class="bi bi-star-half" style="color:var(--amarillo-fuerte);font-size:.72rem;"></i>';
        else
            html += '<i class="bi bi-star" style="color:#ddd;font-size:.72rem;"></i>';
    }
    return html;
}

/* ─────────────────────────────────────────
   RENDER DE CARDS — con navegación al detalle
───────────────────────────────────────── */

function renderCardCatalogo(p) {
    const descPct = p.descuento > 0
        ? `<span class="badge-oferta">-${p.descuento}%</span>`
        : '';
    return `
        <div class="col-6 col-md-3 fade-in-up">
            <div class="card-producto position-relative"
                 onclick="window.location.href='producto.html?id=${p.id}'">
                ${descPct}
                <div class="img-container">
                    <img src="${p.img}" alt="${p.nombre}" loading="lazy"
                         onerror="this.src='https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&h=300&fit=crop'">
                </div>
                <div class="card-body">
                    <div class="estrellas">${_renderEstrellasAPI(p.rating)}</div>
                    <div class="nombre-producto">${p.nombre}</div>
                    <div style="font-size:.72rem;color:#888;margin-bottom:4px;">${p.marca} · ${p.cat}</div>
                    <div class="precio-producto">
                        S/ ${p.precio.toFixed(2)}
                        ${p.ant ? `<span class="precio-antiguo">S/ ${p.ant.toFixed(2)}</span>` : ''}
                    </div>
                    ${p.stock === 0
                        ? `<button class="btn-agregar" disabled style="background:#ccc;cursor:not-allowed;">Sin stock</button>`
                        : `<button class="btn-agregar"
                               onclick="event.stopPropagation(); agregarAlCarritoAPI(${p.id})">
                               <i class="bi bi-plus-lg me-1"></i> Agregar
                           </button>`
                    }
                </div>
            </div>
        </div>`;
}

/* ─────────────────────────────────────────
   AGREGAR AL CARRITO DESDE CATÁLOGO API
───────────────────────────────────────── */

function agregarAlCarritoAPI(id) {
    const p = CATALOGO_EXTENDIDO.find(x => x.id === id);
    if (!p) return;

    let carrito = JSON.parse(localStorage.getItem('massgo_carrito') || '[]');
    const idx = carrito.findIndex(i => i.id === id);
    if (idx >= 0) {
        carrito[idx].cantidad += 1;
    } else {
        carrito.push({
            id: p.id,
            nombre: p.nombre,
            precio: p.precio,
            imagen: p.img,
            cantidad: 1,
            stock: p.stock
        });
    }
    localStorage.setItem('massgo_carrito', JSON.stringify(carrito));

    if (typeof actualizarContadorCarrito === 'function') actualizarContadorCarrito();

    if (typeof mostrarToast === 'function') {
        mostrarToast(`"${p.nombre}" agregado al carrito`);
    } else {
        const el = document.getElementById('alertaCarrito');
        if (el) {
            el.innerHTML = `<i class="bi bi-check-circle me-2"></i>"${p.nombre}" agregado al carrito`;
            el.style.display = 'block';
            setTimeout(() => { el.style.display = 'none'; }, 2500);
        }
    }
}

/* ─────────────────────────────────────────
   CARGA PRINCIPAL
───────────────────────────────────────── */

function cargarProductosAPI(pagina) {
    const grid    = document.getElementById('gridAPI');
    const estado  = document.getElementById('apiEstado');
    const btnWrap = document.getElementById('wrapBtnMas');
    if (!grid) return;

    CATALOGO_ESTADO.pagina = pagina - 1;

    if (pagina === 1) {
        if (estado) estado.style.display = 'none';
        grid.innerHTML = '';
    }

    const lote = CATALOGO_EXTENDIDO.slice(CATALOGO_ESTADO.inicio, CATALOGO_ESTADO.fin);
    grid.insertAdjacentHTML('beforeend', lote.map(renderCardCatalogo).join(''));

    if (btnWrap) {
        btnWrap.style.cssText = CATALOGO_ESTADO.hayMas
            ? 'display:block!important;'
            : 'display:none!important;';
    }
}

function cargarMasAPI() {
    cargarProductosAPI(CATALOGO_ESTADO.pagina + 2);
}

function mostrarProductosFallback() {
    cargarProductosAPI(1);
}
