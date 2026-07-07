# 🛒 MassGo — Supermercado de Barrio en tu Bolsillo

MassGo es una plataforma de **quick commerce hiperlocal** desarrollada para la transformación digital de Tiendas Mass. El proyecto busca combinar la experiencia del supermercado de barrio con la velocidad y comodidad del comercio electrónico moderno.

Los usuarios pueden realizar compras desde la web y recibir sus productos en menos de 30 minutos, manteniendo los mismos precios de tienda física y ofreciendo una experiencia personalizada mediante **Inteligencia Artificial**.

<!-- Si quieres colocar un banner: ![MassGo Banner](ruta/a/tu/imagen.png) -->

---

## 📋 Tabla de Contenidos

- [Características](#-características-principales)
- [Stack Tecnológico](#-stack-tecnológico)
- [Arquitectura](#-arquitectura)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Instalación y Ejecución Local](#-instalación-y-ejecución-local)
- [Endpoints de la API](#-endpoints-de-la-api)
- [Funcionalidades de IA](#-funcionalidades-de-ia)
- [Testing](#-testing)
- [Despliegue](#-despliegue)
- [Equipo](#-equipo-de-desarrollo)
- [Licencia](#-licencia)

---

## 🚀 Características Principales

| Funcionalidad | Descripción |
|---|---|
| 🛍️ **Catálogo digital** | Productos con fotos, precios, descripción y stock en tiempo real |
| ⚡ **Delivery rápido** | Recepción de productos en menos de 30 minutos |
| 🤖 **Recomendaciones IA** | Sugerencias personalizadas basadas en TF-IDF y similitud coseno |
| 📦 **Inventario en tiempo real** | Sincronización con Supabase, evita sobreventa |
| 💳 **Pago multicanal** | Yape, Plin, tarjetas y pago contra entrega |
| 🎯 **Puntos y ofertas** | Programa de fidelización con canje de puntos |
| 📊 **Dashboard admin** | Métricas, gráficos, CRUD de productos y pedidos |
| 💬 **Chatbot IA** | Asistente virtual con detección de 9 intenciones + Gemini |
| 👁️ **Escaneo por imagen** | Identifica productos con Gemini Vision API |
| 📱 **Responsive** | Experiencia óptima en móviles, tablets y escritorio |

---

## 🧠 Stack Tecnológico

### Frontend
| Tecnología | Uso |
|---|---|
| **HTML5** | Estructura semántica de las vistas |
| **CSS3** | Estilos, animaciones y diseño responsive |
| **JavaScript** | Lógica de negocio del lado del cliente |
| **Bootstrap 5** | Framework de componentes UI |
| **LocalStorage** | Persistencia del carrito y sesión |

### Backend
| Tecnología | Uso |
|---|---|
| **Python 3.12** | Lenguaje principal del backend |
| **FastAPI** | Framework REST rápido con tipado |
| **Uvicorn** | Servidor ASGI para producción |
| **httpx** | Cliente HTTP async para Gemini API |

### Base de Datos
| Tecnología | Uso |
|---|---|
| **Supabase (PostgreSQL)** | BD relacional en la nube |
| **Supabase Auth** | Autenticación de usuarios |
| **Supabase Storage** | Almacenamiento de imágenes |

### Inteligencia Artificial
| Librería | Modelo / Técnica | Propósito |
|---|---|---|
| **scikit-learn** | `TfidfVectorizer` + `cosine_similarity` | Recomendaciones de productos |
| **scikit-learn** | `LinearRegression` | Predicción de ventas |
| **scikit-learn** | `LogisticRegression` | Clasificación de stock crítico |
| **NLTK** | `VADER` (Valence Aware Dictionary) | Análisis de sentimiento |
| **Google Gemini API** | `gemini-3.1-flash-lite` | Chatbot inteligente y escaneo de productos |

### Infraestructura
| Servicio | Uso |
|---|---|
| **Cloudflare Pages** | Hosting del frontend estático |
| **Railway** | Hosting del backend Python/FastAPI |

---

## 🏗️ Arquitectura

```

┌─────────────────────┐      ┌──────────────────────┐
│                     │      │                      │
│  cloudflare Pages   │      │     Railway          │
│  (Frontend HTML/JS) │─────▶│  (Backend FastAPI)   │
│                     │      │                      │
│  massgo.pages.dev   │      │  massgo-api.railway  │
└─────────────────────┘      └──────────┬───────────┘
                                        │
                                        ▼
                               ┌──────────────────┐
                               │                  │
                               │    Supabase       │
                               │  (PostgreSQL)     │
                               │                  │
                               └──────────────────┘
                                        │
                               ┌────────┴────────┐
                               ▼                 ▼
                        ┌────────────┐  ┌──────────────┐
                        │ Google     │  │   NLTK       │
                        │ Gemini API │  │   VADER      │
                        └────────────┘  └──────────────┘
```

---

## 📁 Estructura del Proyecto

```
MassGoV2/
├── MassGo/                    # Frontend (Cloudflare Pages)
│   ├── index.html             # Catálogo principal
│   ├── login.html             # Inicio de sesión
│   ├── registro.html          # Registro de usuario
│   ├── carrito.html           # Carrito de compras
│   ├── checkout.html          # Pasarela de pago
│   ├── pedidos.html           # Historial de pedidos
│   ├── seguimiento.html       # Seguimiento con mapa
│   ├── chatbot.html           # Chatbot IA
│   ├── lista-inteligente.html # Lista de compras IA
│   ├── escaneo.html           # Escaneo por imagen
│   ├── admin/                 # Panel administrativo
│   │   ├── dashboard.html
│   │   ├── pedidos.html
│   │   └── productos.html
│   ├── css/                   # Estilos
│   │   └── style.css
│   ├── js/                    # JavaScript
│   │   ├── config.js          # Configuración de API
│   │   ├── api.js             # Cliente HTTP
│   │   ├── auth.js            # Autenticación
│   │   └── ...
│   └── _redirects             # Proxy API → Railway
├── backend/                   # Backend (Railway)
│   ├── main.py                # Punto de entrada FastAPI
│   ├── config.py              # Configuración y variables de entorno
│   ├── database.py            # Conexión a Supabase
│   ├── ai/                    # Módulo de Inteligencia Artificial
│   │   ├── recommendations.py # TF-IDF + similitud coseno
│   │   ├── predictions.py     # Regresión lineal y logística
│   │   ├── chatbot.py         # Chatbot con 9 intenciones
│   │   ├── nlp_utils.py       # VADER sentimiento + keywords
│   │   └── routes.py          # Endpoints IA
│   ├── models/                # Schemas Pydantic
│   └── requirements.txt       # Dependencias
├── tests/                     # Pruebas automatizadas
│   ├── test_api.py            # 39 tests de integración
│   ├── test_ai_recommendations.py  # 11 tests
│   ├── test_ai_chatbot.py     # 14 tests
│   └── test_ai_predictions.py # 9 tests
├── README.md
└── A8_EVIDENCIAS_PRODUCTO_FINAL.md
```

---

## 🔧 Instalación y Ejecución Local

### Requisitos

- Python 3.12+
- Node.js (opcional, solo para desarrollo frontend)

### Backend

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/massgo.git
cd massgo

# 2. Crear entorno virtual
python -m venv venv
.\venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac

# 3. Instalar dependencias
pip install -r backend/requirements.txt

# 4. Configurar variables de entorno
# Crear backend/.env con:
#   SUPABASE_URL=...
#   SUPABASE_KEY=...
#   GEMINI_API_KEY=...

# 5. Ejecutar servidor
cd backend
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
# Abrir MassGo/index.html en el navegador
# O servir con un servidor estático:
npx serve MassGo/
```

El frontend cargará `js/config.js` que detecta automáticamente si estás en local y redirige las peticiones API al `localhost:8000`.

---

## 📡 Endpoints de la API

### Salud y Estado
| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/health` | Health check del servidor |

### Usuarios (RF01)
| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/usuarios` | Listar todos los usuarios |
| `GET` | `/api/usuarios/{id}` | Obtener usuario por ID |

### Catálogo (RF02)
| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/productos` | Listar productos (paginado) |
| `GET` | `/api/productos/{id}` | Detalle de producto |
| `POST` | `/api/productos` | Crear producto (admin) |
| `GET` | `/api/categorias` | Listar categorías |

### Carrito (RF03)
| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/api/carrito/verificar` | Verificar stock antes de comprar |

### Pagos (RF04)
| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/comprobantes` | Listar comprobantes de pago |

### Pedidos (RF05)
| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/pedidos` | Listar pedidos (con filtros) |
| `GET` | `/api/pedidos/{id}` | Detalle de pedido |
| `PUT` | `/api/pedidos/{id}/estado` | Actualizar estado |
| `POST` | `/api/pedidos/{id}/despachar` | Despachar pedido |
| `GET` | `/api/pedidos/exportar/csv` | Exportar pedidos a CSV |

### Seguimiento (RF06)
| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/seguimiento/{pedido_id}` | Estado y ubicación del pedido |

### Administración (RF07)
| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/admin/dashboard` | Métricas del dashboard |
| `GET` | `/api/categorias/{id}` | Detalle de categoría |
| `POST` | `/api/categorias` | Crear categoría |

### Inteligencia Artificial (RF08-RF10)
| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/api/ai/recomendar/producto` | Recomendar por producto |
| `POST` | `/api/ai/recomendar/usuario` | Recomendar por historial |
| `POST` | `/api/ai/predecir/ventas` | Predecir ventas futuras |
| `POST` | `/api/ai/predecir/stock-critico` | Detectar stock en riesgo |
| `POST` | `/api/ai/chat` | Chatbot conversacional |
| `POST` | `/api/ai/sentimiento` | Análisis de sentimiento |
| `POST` | `/api/ai/palabras-clave` | Extraer palabras clave |
| `POST` | `/api/ai/entrenar/recomendaciones` | Entrenar modelo TF-IDF |
| `POST` | `/api/ai/entrenar/predicciones` | Entrenar modelos ML |
| `POST` | `/api/ai/gemini-proxy` | Proxy seguro a Gemini API |
| `POST` | `/api/ai/escanear-producto` | Escaneo de imagen con Gemini |

---

## 🤖 Funcionalidades de IA

### Recomendaciones (TF-IDF + Similitud Coseno)
```python
# backend/ai/recommendations.py
vectorizer = TfidfVectorizer(max_features=200, stop_words=None, max_df=0.85, min_df=1)
matriz_tfidf = vectorizer.fit_transform(docs)
similitud = cosine_similarity(matriz_tfidf[idx], matriz_tfidf)
```

### Predicción de Ventas (Regresión Lineal)
```python
# backend/ai/predictions.py
modelo_ventas = LinearRegression()
modelo_ventas.fit(dias, ventas)
```

### Clasificación de Stock Crítico (Regresión Logística)
```python
# backend/ai/predictions.py
modelo_stock = LogisticRegression(max_iter=500)
modelo_stock.fit(X_scaled, y)
```

### Chatbot (Reglas + Gemini)
```python
# backend/ai/chatbot.py
INTENCIONES = {
    "seguimiento_pedido": ["dónde está mi pedido", "seguimiento", ...],
    "cancelar_pedido": ["cancelar", "cancelación", ...],
    "horario": ["horario", "abren", "cierran", ...],
    # ... 9 intenciones en total
}
```

### Escaneo de Productos (Gemini Vision)
```python
# backend/ai/routes.py
url = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent"
payload = {"contents": [{"parts": [{"text": prompt}, {"inline_data": {"mime_type": mime, "data": b64}}]}]}
res = await client.post(url, params={"key": GEMINI_API_KEY}, json=payload)
```

### Análisis de Sentimiento (VADER)
```python
# backend/ai/nlp_utils.py
from nltk.sentiment import SentimentIntensityAnalyzer
sia = SentimentIntensityAnalyzer()
sia.polarity_scores(texto)
```

---

## 🧪 Testing

```bash
# Acceder a la carpeta de pruebas
cd tests

# Ejecutar todas las pruebas (73 tests)
python -m pytest -v

# Ejecutar suites individuales
python -m pytest test_api.py -v               # 39 tests de API
python -m pytest test_ai_recommendations.py -v # 11 tests de recomendaciones
python -m pytest test_ai_chatbot.py -v         # 14 tests de chatbot
python -m pytest test_ai_predictions.py -v     # 9 tests de predicciones
```

**Resultado: 73 passed, 0 failed**

---

## 🌐 Despliegue

### Frontend → Cloudflare Pages
1. Conectar repositorio a Cloudflare Pages
2. Carpeta de publicación: `MassGo`
3. El archivo `_redirects` maneja el proxy `/api/*` → Railway

### Backend → Railway
1. Conectar repositorio a Railway
2. `Start Command`: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`
3. Configurar variables de entorno en Railway Dashboard

---

## 👥 Equipo de Desarrollo

### Grupo 02 — Mass Trujillo Team

| Rol | Integrante |
|---|---|
| **Director del Proyecto** | Wilmer Antonio Mendo Anhuamán |
| **Responsable de Calidad** | Cristhian Eduardo Atalay Benites |
| **Programador - Tester** | Jerson Dominguez Terrones |
| **Analista - Diseñador** | Jose Estibb Anhuaman Delgado |
| **Responsable de Datos de la IA** | Jeans Fabricio Rondo Nuñez Del Arco |
| **Marketing y Comunicaciones** | Maricielo Yamile Abanto Nuñez |
| **Cliente** | Kevin Moreno Bobadilla |

Proyecto orientado al sector:
**Retail de Proximidad · Grocery Tech · Comercio Electrónico Hiperlocal · Quick Commerce**

---

## 📍 Ubicación Piloto

**Tiendas Mass** — San Isidro, Trujillo, Perú

---

## 📌 Estado del Proyecto

✅ **Concluido** — Todas las funcionalidades implementadas y probadas.

---

## 📄 Licencia

Proyecto académico y de investigación. Universidad César Vallejo.

---

<p align="center">
  <strong>MassGo</strong> — Tu tienda Mass, siempre contigo. 🛒⚡
</p>
