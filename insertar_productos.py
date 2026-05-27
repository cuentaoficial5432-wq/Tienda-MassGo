"""
Insertar productos del catálogo estático a Supabase vía API.
Ejecutar con el backend corriendo.
"""
import httpx

# Mapeo de nombre categoria -> id_categoria
CAT_MAP = {
    "Bebidas": 1,
    "Snacks": 2,
    "Lacteos": 3,
    "Limpieza": 4,
    "Abarrotes": 5,
}

PRODUCTOS = [
    # ---- LACTEOS ----
    {
        "nombre": "Leche Gloria Entera 1L",
        "descripcion": "Leche entera pasteurizada de alta calidad Gloria, en presentacion de 1 litro. Rica en calcio y vitaminas esenciales A, D y B12. Ideal para el desayuno diario de toda la familia, perfecta para acompanar cereales, cafe o sola. Proviene de vacas criadas en los valles del Peru, garantizando frescura y sabor natural.",
        "precio": 5.90,
        "stock": 30,
        "estado": "Disponible",
        "id_categoria": CAT_MAP["Lacteos"],
        "es_oferta_flash": False,
        "imagen_url": "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=400&fit=crop",
    },
    {
        "nombre": "Yogurt Laive Fresa 1kg",
        "descripcion": "Yogurt cremoso sabor fresa Laive, elaborado con leche fresca pasteurizada y cultivos lacticos activos. Presentacion de 1 kilogramo, ideal para toda la familia. Contiene probioticos naturales que favorecen la digestion y fortalecen el sistema inmunologico. Sin colorantes artificiales ni conservantes. Perfecto para el desayuno, como snack saludable o para preparar batidos y postres.",
        "precio": 7.50,
        "stock": 20,
        "estado": "Disponible",
        "id_categoria": CAT_MAP["Lacteos"],
        "es_oferta_flash": False,
        "imagen_url": "https://images.unsplash.com/photo-1571212515416-fef01fc43637?w=400&h=400&fit=crop",
    },
    {
        "nombre": "Queso Fresco Laive 500g",
        "descripcion": "Queso fresco suave y cremoso Laive, elaborado artesanalmente con leche fresca pasteurizada seleccionada. Textura firme pero tierna, sabor lacteo suave y ligeramente salado. Presentacion de 500 gramos, perfecto para ensaladas, sandwiches, causitas, y platos tipicos peruanos como la ocopa o el solterito. Sin conservantes, fuente de calcio y proteinas.",
        "precio": 12.90,
        "stock": 15,
        "estado": "Disponible",
        "id_categoria": CAT_MAP["Lacteos"],
        "es_oferta_flash": False,
        "imagen_url": "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&h=400&fit=crop",
    },
    {
        "nombre": "Mantequilla Gloria 200g",
        "descripcion": "Mantequilla Gloria con sabor suave y textura cremosa, elaborada con leche fresca seleccionada de los mejores valles del Peru. Presentacion de 200 gramos, ideal para untar en pan tostado, preparar masas, galletas, salsas y hornear. Rica en vitaminas A, D y E. Sin grasas vegetales ni conservantes, 100% lactea natural.",
        "precio": 8.50,
        "stock": 25,
        "estado": "Disponible",
        "id_categoria": CAT_MAP["Lacteos"],
        "es_oferta_flash": False,
        "imagen_url": "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&h=400&fit=crop",
    },
    # ---- BEBIDAS ----
    {
        "nombre": "Inca Kola 2.5L",
        "descripcion": "La bebida de sabor nacional en presentacion familiar de 2.5 litros. Inca Kola, con su inconfundible color amarillo y sabor dulce unico, es la gaseosa preferida de los peruanos desde 1935. Elaborada con ingredientes naturales y extracto de hierba luisa. Perfecta para acompanar comidas, celebraciones y reuniones familiares. Ideal para compartir.",
        "precio": 8.50,
        "stock": 40,
        "estado": "Disponible",
        "id_categoria": CAT_MAP["Bebidas"],
        "es_oferta_flash": True,
        "imagen_url": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&h=400&fit=crop",
    },
    {
        "nombre": "Coca-Cola 3L",
        "descripcion": "La clasica Coca-Cola en su presentacion mas grande de 3 litros, ideal para reuniones y celebraciones familiares. Su sabor inconfundible y refrescante la convierte en la bebida favorita en todo el mundo. Perfectamente fria, es el complemento ideal para pizzas, hamburguesas, parrilladas y cualquier comida compartida. Botella plastica con tapa reutilizable.",
        "precio": 9.90,
        "stock": 35,
        "estado": "Disponible",
        "id_categoria": CAT_MAP["Bebidas"],
        "es_oferta_flash": True,
        "imagen_url": "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&h=400&fit=crop",
    },
    {
        "nombre": "Agua San Luis 2.5L",
        "descripcion": "Agua mineral natural San Luis sin gas, en presentacion de 2.5 litros. Pureza garantizada desde los parajes naturales del Peru. Sin azucar, sin calorias, ideal para hidratarte durante todo el dia. Perfecta para la oficina, el hogar o llevar al gym. Botella ergonomica facil de sostener. La opcion mas saludable para toda la familia.",
        "precio": 3.50,
        "stock": 60,
        "estado": "Disponible",
        "id_categoria": CAT_MAP["Bebidas"],
        "es_oferta_flash": False,
        "imagen_url": "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&h=400&fit=crop",
    },
    {
        "nombre": "Jugo Pulp Naranja 1L",
        "descripcion": "Jugo de naranja Pulp con trozos de fruta real, en presentacion de 1 litro. Rico en vitamina C natural, sin conservantes artificiales ni colorantes. Elaborado con naranjas frescas seleccionadas, cada sorbo tiene pulpa natural que lo hace único. Perfecto para el desayuno o la merienda de los ninos. Refrigerar despues de abrir y consumir en 3 dias.",
        "precio": 5.20,
        "stock": 22,
        "estado": "Disponible",
        "id_categoria": CAT_MAP["Bebidas"],
        "es_oferta_flash": False,
        "imagen_url": "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&h=400&fit=crop",
    },
    {
        "nombre": "Cafe Nescafe Clasico 200g",
        "descripcion": "Cafe soluble Nescafe Clasico con aroma intenso y sabor equilibrado, en presentacion de 200 gramos. Listo en segundos, solo anade agua caliente. Elaborado con granos de cafe seleccionados y tostados cuidadosamente para ofrecer una taza perfecta cada vez. Ideal para empezar el dia con energia, en la oficina o para disfrutar en casa. Rinde aproximadamente 100 tazas.",
        "precio": 18.90,
        "stock": 18,
        "estado": "Disponible",
        "id_categoria": CAT_MAP["Bebidas"],
        "es_oferta_flash": False,
        "imagen_url": "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=400&fit=crop",
    },
    # ---- ABARROTES ----
    {
        "nombre": "Arroz Costeno Extra 5kg",
        "descripcion": "Arroz Costeno Extra de grano largo, seleccionado y procesado con los mas altos estandares de calidad del Peru. Coccion perfecta, granos sueltos y sabor suave en cada plato. Bolsa de 5 kilogramos, ideal para familias numerosas. Perfecto para preparar arroz blanco, arroz con pollo, chaufa, paella y todos los clasicos de la cocina peruana.",
        "precio": 18.90,
        "stock": 12,
        "estado": "Disponible",
        "id_categoria": CAT_MAP["Abarrotes"],
        "es_oferta_flash": True,
        "imagen_url": "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop",
    },
    {
        "nombre": "Aceite Primor 1L",
        "descripcion": "Aceite vegetal Primor refinado de alta calidad, ideal para frituras, salteados y aderezos. Botella de 1 litro. Sin colesterol, rico en vitamina E. Su punto de humeo alto permite cocinar a temperaturas elevadas sin descomponerse, manteniendo el sabor original de los alimentos. La eleccion de las familias peruanas para la cocina diaria.",
        "precio": 9.90,
        "stock": 28,
        "estado": "Disponible",
        "id_categoria": CAT_MAP["Abarrotes"],
        "es_oferta_flash": False,
        "imagen_url": "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=400&fit=crop",
    },
    {
        "nombre": "Fideos Don Vittorio Spaghetti 500g",
        "descripcion": "Fideos spaghetti Don Vittorio elaborados con semola de trigo duro de la mejor calidad. Textura firme al dente que mantiene su consistencia incluso en coccion prolongada. Presentacion de 500 gramos. Perfectos para tallarines rojos, verdes, con salsa bolognesa, al pesto o cualquier preparacion italiana. La pasta favorita de los hogares peruanos.",
        "precio": 3.50,
        "stock": 45,
        "estado": "Disponible",
        "id_categoria": CAT_MAP["Abarrotes"],
        "es_oferta_flash": False,
        "imagen_url": "https://images.unsplash.com/photo-1551462147-ff29053bfc14?w=400&h=400&fit=crop",
    },
    {
        "nombre": "Azucar Rubia Cartavio 1kg",
        "descripcion": "Azucar rubia Cartavio elaborada a partir de cana de azucar peruana, con sabor natural y aroma caracteristico. Presentacion de 1 kilogramo. Ideal para endulzar bebidas calientes como cafe, te o chocolate, asi como para preparar postres, mermeladas, conservas y reposteria en general. Textura fina que se disuelve facilmente. Producto 100% peruano.",
        "precio": 4.90,
        "stock": 50,
        "estado": "Disponible",
        "id_categoria": CAT_MAP["Abarrotes"],
        "es_oferta_flash": False,
        "imagen_url": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop",
    },
    {
        "nombre": "Atun Florida en Agua 170g",
        "descripcion": "Atun Florida en agua, elaborado con lomos de atun fresco seleccionados. Rico en proteinas y acidos grasos Omega-3 esenciales para la salud cardiovascular. Lata de 170 gramos, sin conservantes artificiales ni colorantes. Ideal para ensaladas, sandwiches, tortillas, empanadas y preparaciones rapidas y nutritivas. Bajo en grasas, alto en proteinas.",
        "precio": 5.90,
        "stock": 33,
        "estado": "Disponible",
        "id_categoria": CAT_MAP["Abarrotes"],
        "es_oferta_flash": True,
        "imagen_url": "https://images.unsplash.com/photo-1534482421-64566f976cfa?w=400&h=400&fit=crop",
    },
    {
        "nombre": "Sal Marina Emsal 1kg",
        "descripcion": "Sal marina Emsal yodada de grano fino, obtenida de las marinas peruanas mediante evaporacion natural. Pureza garantizada, enriquecida con yodo para prevenir deficiencias nutricionales. Bolsa de 1 kilogramo. Esencial en toda cocina peruana para realzar el sabor de tus preparaciones diarias: ceviches, guisos, sopas, ensaladas y mas.",
        "precio": 1.80,
        "stock": 70,
        "estado": "Disponible",
        "id_categoria": CAT_MAP["Abarrotes"],
        "es_oferta_flash": False,
        "imagen_url": "https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?w=400&h=400&fit=crop",
    },
    {
        "nombre": "Mermelada Fanny Fresa 500g",
        "descripcion": "Mermelada Fanny de fresa con trozos de fruta real, elaborada con fresas frescas seleccionadas y azucar natural. Presentacion de 500 gramos. Sin colorantes artificiales ni conservantes. Perfecta para el desayuno con pan tostado, queques, pancakes, o como relleno de postres y tortas. Sabor casero con la calidad de siempre.",
        "precio": 6.90,
        "stock": 24,
        "estado": "Disponible",
        "id_categoria": CAT_MAP["Abarrotes"],
        "es_oferta_flash": False,
        "imagen_url": "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=400&fit=crop",
    },
    # ---- FRUTAS Y VERDURAS ----
    {
        "nombre": "Platano Cavendish Premium 1kg",
        "descripcion": "Platanos Cavendish frescos y maduros, seleccionados en su punto optimo de maduracion. Ricos en potasio, fibra dietetica y energia natural. Ideal para el desayuno, como snack saludable, en licuados, postres o para preparar clasicos peruanos como el chapo o la mazamorra. Cada kilo contiene aproximadamente 5 a 6 unidades de tamano mediano.",
        "precio": 1.99,
        "stock": 15,
        "estado": "Disponible",
        "id_categoria": None,
        "es_oferta_flash": True,
        "imagen_url": "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=400&fit=crop",
    },
    {
        "nombre": "Manzana Delicia 1kg",
        "descripcion": "Manzanas Delicia frescas y crujientes, de pulpa dulce y jugosa con un ligero toque acido. Ricas en fibra, antioxidantes y vitamina C. Seleccionadas a mano en su punto exacto de madurez. Ideales para comer solas como snack saludable, en ensaladas de frutas, jugos naturales, compotas o postres horneados. Aproximadamente 5 unidades por kilo.",
        "precio": 4.50,
        "stock": 20,
        "estado": "Disponible",
        "id_categoria": None,
        "es_oferta_flash": False,
        "imagen_url": "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&h=400&fit=crop",
    },
    {
        "nombre": "Tomate Redondo 1kg",
        "descripcion": "Tomates redondos frescos, maduros y jugosos, cosechados en su punto optimo de maduracion. Ricos en licopeno, un potente antioxidante natural, y vitaminas A y C. Esenciales en la cocina peruana para salsas, ensaladas, guisos, saltados y el imprescindible jugo de tomate. Seleccionados diariamente para garantizar frescura y sabor inigualable.",
        "precio": 2.90,
        "stock": 18,
        "estado": "Disponible",
        "id_categoria": None,
        "es_oferta_flash": False,
        "imagen_url": "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400&h=400&fit=crop",
    },
    {
        "nombre": "Cebolla Roja 1kg",
        "descripcion": "Cebolla roja fresca de sabor intenso y aroma caracteristico, cultivada en los valles de la costa peruana. Rica en antioxidantes y compuestos sulfuricos beneficiosos para la salud. Ingrediente fundamental en la cocina peruana: indispensable para ceviche, lomo saltado, ensaladas, salsas criollas, aderezos y guisos. Seleccionadas por su tamano y firmeza.",
        "precio": 2.20,
        "stock": 22,
        "estado": "Disponible",
        "id_categoria": None,
        "es_oferta_flash": False,
        "imagen_url": "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&h=400&fit=crop",
    },
    # ---- SNACKS ----
    {
        "nombre": "Papas Fritas Lay's Clasicas 150g",
        "descripcion": "Las clasicas papas fritas Lay's en presentacion de 150 gramos. Crujientes, doradas y con el sabor original que todos aman. Elaboradas con papas frescas seleccionadas, cortadas en laminas finas y cocidas en aceite vegetal hasta alcanzar la perfeccion. Ligeramente saladas, son el snack ideal para compartir en casa, en la oficina o en fiestas.",
        "precio": 4.50,
        "stock": 40,
        "estado": "Disponible",
        "id_categoria": CAT_MAP["Snacks"],
        "es_oferta_flash": False,
        "imagen_url": "https://images.unsplash.com/photo-1621447504864-d8686e12698c?w=400&h=400&fit=crop",
    },
    {
        "nombre": "Galletas Oreo 432g",
        "descripcion": "Galletas Oreo en presentacion familiar de 432 gramos. El clasico sandwich de galleta de chocolate crujiente con un delicioso relleno de crema sabor vainilla. Perfectas para mojar en leche, desmenuzar sobre helados, triturar para base de postres o simplemente disfrutar solas. Vienen en empaque resellable para mantener su frescura. Aproximadamente 36 galletas.",
        "precio": 9.90,
        "stock": 30,
        "estado": "Disponible",
        "id_categoria": CAT_MAP["Snacks"],
        "es_oferta_flash": True,
        "imagen_url": "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=400&fit=crop",
    },
    {
        "nombre": "Chifles Inka Chips 100g",
        "descripcion": "Chifles de platano verde Inka Chips, crujientes y con sabor natural. Snack peruano tradicional elaborado con platanos verdes frescos, cortados en laminas finas y fritos hasta obtener una textura crujiente. Sin gluten, sin colorantes artificiales. Bolsa de 100 gramos. Perfectos para acompanar ceviche, como picante o simplemente como snack saludable.",
        "precio": 3.20,
        "stock": 35,
        "estado": "Disponible",
        "id_categoria": CAT_MAP["Snacks"],
        "es_oferta_flash": False,
        "imagen_url": "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400&h=400&fit=crop",
    },
    {
        "nombre": "Chocolate Sublime 32g",
        "descripcion": "El clasico chocolate Sublime peruano con mani crocante y cobertura de chocolate con leche. Sabor inconfundible que acompaña a los peruanos desde 1952. Presentacion de 32 gramos, ideal para disfrutar como antojo personal o para compartir. Elaborado con ingredientes seleccionados, sin conservantes. El chocolate mas querido del Peru.",
        "precio": 1.50,
        "stock": 60,
        "estado": "Disponible",
        "id_categoria": CAT_MAP["Snacks"],
        "es_oferta_flash": False,
        "imagen_url": "https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=400&h=400&fit=crop",
    },
    # ---- LIMPIEZA ----
    {
        "nombre": "Detergente Ariel 2kg",
        "descripcion": "Detergente en polvo Ariel con formula activa que elimina las manchas mas dificiles desde el primer lavado. Presentacion de 2 kilogramos, suficiente para aproximadamente 40 lavados. Su tecnologia de limpieza profunda penetra las fibras de la ropa eliminando manchas de grasa, barro, pasto y comida. Deja la ropa con aroma fresco y colores brillantes.",
        "precio": 22.90,
        "stock": 16,
        "estado": "Disponible",
        "id_categoria": CAT_MAP["Limpieza"],
        "es_oferta_flash": False,
        "imagen_url": "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400&h=400&fit=crop",
    },
    {
        "nombre": "Lejia Clorox 1L",
        "descripcion": "Lejia Clorox desinfectante con formula concentrada de hipoclorito de sodio al 5.25%. Elimina el 99.9% de germenes, bacterias y virus de superficies del hogar. Botella de 1 litro. Ideal para desinfectar superficies de cocina y bano, blanquear ropa blanca, desinfectar frutas y verduras (diluido) y limpiar pisos. Uso domestico e industrial ligero.",
        "precio": 5.50,
        "stock": 28,
        "estado": "Disponible",
        "id_categoria": CAT_MAP["Limpieza"],
        "es_oferta_flash": False,
        "imagen_url": "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400&h=400&fit=crop",
    },
    {
        "nombre": "Jabon Bolivar 360g x3",
        "descripcion": "Pack de 3 jabones Bolivar de 360 gramos cada uno, el jabon de lavar mas confiable del Peru desde 1879. Formula activa con componentes naturales que eliminan manchas dificiles en ropa de color y blanca. Espuma abundante incluso en aguas duras. Ideal para lavado a mano de prendas delicadas, uniformes y ropa de trabajo. Economico y rendidor.",
        "precio": 7.90,
        "stock": 22,
        "estado": "Disponible",
        "id_categoria": CAT_MAP["Limpieza"],
        "es_oferta_flash": False,
        "imagen_url": "https://images.unsplash.com/photo-1584305574647-0cc949a2bb9f?w=400&h=400&fit=crop",
    },
    {
        "nombre": "Papel Higienico Elite 4 rollos",
        "descripcion": "Papel higienico Elite suave y resistente, de doble hoja con 20 metros cada rollo. Pack de 4 rollos con mayor rendimiento y duracion. Su textura suave brinda cuidado e higiene para toda la familia. Hipoalergenico, libre de perfumes y colorantes. Certificado de calidad que garantiza su suavidad y resistencia en cada uso.",
        "precio": 6.90,
        "stock": 45,
        "estado": "Disponible",
        "id_categoria": CAT_MAP["Limpieza"],
        "es_oferta_flash": False,
        "imagen_url": "https://www.elite.com.pe/assets/uploads/images/25eca-d099c-elite-suave-y-resistente-dh-20m-x4-min.png",
    },
]


def main():
    with httpx.Client(timeout=10) as client:
        # Averiguar id_categoria de "Frutas y Verduras" o crearla
        r_cats = client.get("http://localhost:8000/api/categorias/")
        cats = r_cats.json()
        cat_fv_id = None
        for c in cats:
            if c["nombre"] == "Frutas y Verduras":
                cat_fv_id = c["id_categoria"]
                break
        if cat_fv_id is None:
            r_new = client.post("http://localhost:8000/api/categorias/",
                json={"nombre": "Frutas y Verduras", "descripcion": "Frutas frescas, verduras y hortalizas seleccionadas"})
            if r_new.status_code == 201:
                cat_fv_id = r_new.json()["id_categoria"]
                print(f"Categoria Frutas y Verduras creada (id={cat_fv_id})")
            else:
                print(f"Error creando categoria: {r_new.status_code} {r_new.text[:100]}")
                cat_fv_id = None

        # Asignar id_categoria a productos Frutas y Verduras
        for p in PRODUCTOS:
            if p["id_categoria"] is None and cat_fv_id:
                p["id_categoria"] = cat_fv_id

        # Insertar productos
        exitos = 0
        errores = 0
        for p in PRODUCTOS:
            r = client.post("http://localhost:8000/api/productos/", json=p)
            if r.status_code in (200, 201):
                exitos += 1
                print(f"  OK  {p['nombre']}")
            else:
                errores += 1
                print(f"  ERR {p['nombre']}: {r.status_code} - {r.text[:100]}")

        print(f"\nInsertados: {exitos}  |  Errores: {errores}")


if __name__ == "__main__":
    main()
