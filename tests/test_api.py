"""Pruebas de integración para API REST con mocking de base de datos."""

import pytest
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from unittest.mock import MagicMock, AsyncMock, patch
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


class MockResponse:
    """Simula la respuesta de Supabase: { data: [...] }"""
    def __init__(self, data):
        self.data = data


# ─── Helpers ──────────────────────────────────────────────────────────────────

# Los routers importan `db` a nivel de módulo (from database import db),
# por lo que hay que parchear cada referencia de módulo individualmente.
MODULOS_DB = [
    "database.db",      # Afecta imports lazy dentro de funciones (ej: ai/routes.py)
    "api.products.db",
    "api.orders.db",
    "api.users.db",
    "api.dashboard.db",
    "api.comprobantes.db",
    "api.categorias.db",
]


def _mock_chain(valor_final):
    """Crea un mock encadenado estilo db.table().select().eq().single().execute()"""
    m = MagicMock()
    m.execute.return_value = MockResponse(valor_final)
    m.single.return_value = m
    m.eq.return_value = m
    m.select.return_value = m
    m.order.return_value = m
    m.range.return_value = m
    return m


def mock_todos_db(configurar=None):
    """Parchea db en todos los módulos y opcionalmente aplica configuraciones."""
    patches = [patch(mod) for mod in MODULOS_DB]
    for p in patches:
        p.start()
    for mod_name in MODULOS_DB:
        parts = mod_name.split(".")
        m = __import__(parts[0])
        for part in parts[1:]:
            m = getattr(m, part)
        m.get_categorias.return_value = MockResponse([
            {"id_categoria": 1, "nombre": "Abarrotes", "descripcion": "Abarrotes"},
            {"id_categoria": 2, "nombre": "Lácteos", "descripcion": "Lácteos"},
        ])
        m.get_productos.return_value = MockResponse([
            {"id_producto": 1, "nombre": "Arroz Extra", "descripcion": "Arroz extra",
             "precio": 4.50, "stock": 100, "estado": "Disponible", "id_categoria": 1,
             "es_oferta_flash": False, "imagen_url": None,
             "categoria": {"id_categoria": 1, "nombre": "Abarrotes", "descripcion": None}},
        ])
        m.get_producto.return_value = MockResponse({
            "id_producto": 1, "nombre": "Arroz Extra", "descripcion": "Arroz extra",
            "precio": 4.50, "stock": 100, "estado": "Disponible", "id_categoria": 1,
            "es_oferta_flash": False, "imagen_url": None,
            "categoria": {"id_categoria": 1, "nombre": "Abarrotes", "descripcion": None},
        })
        m.get_usuarios.return_value = MockResponse([
            {"id_usuario": 1, "username": "jperez", "email": "jperez@email.com",
             "estado": "Activo", "fecha_registro": "2026-01-15",
             "personausuario": [{"persona": {"nombres": "Juan", "apellidos": "Perez"}}],
             "usuariorol": [{"rol": {"nombre": "Cliente"}}]},
        ])
        m.get_usuario.return_value = MockResponse({
            "id_usuario": 1, "username": "jperez", "email": "jperez@email.com",
            "estado": "Activo", "fecha_registro": "2026-01-15",
            "personausuario": [{"persona": {"nombres": "Juan", "apellidos": "Perez"}}],
            "usuariorol": [{"rol": {"nombre": "Cliente"}}],
        })
        m.get_pedidos.return_value = MockResponse([
            {"id_pedido": 1, "id_usuario": 1, "fecha": "2026-06-28", "estado": "Preparando",
             "total": 25.50, "usuario": {"username": "jperez"}},
        ])
        m.get_pedido.return_value = MockResponse({
            "id_pedido": 1, "id_usuario": 1, "fecha": "2026-06-28", "estado": "Preparando",
            "total": 25.50, "usuario": {"username": "jperez"},
        })
        m.get_detalle_pedido.return_value = MockResponse([
            {"id_detalle": 1, "id_pedido": 1, "id_producto": 1, "cantidad": 2,
             "precio_unitario": 4.50, "producto": {"nombre": "Arroz", "imagen_url": None}},
        ])
        m.get_envio_por_pedido.return_value = MockResponse(None)
        m.get_pagos_por_pedido.return_value = MockResponse([])
        m.get_pedidos_pendientes.return_value = 5
        m.get_total_pedidos.return_value = 120
        m.get_usuarios_activos.return_value = 45
        m.get_pedidos_recientes.return_value = MockResponse([
            {"id_pedido": 1, "id_usuario": 1, "total": 25.50, "fecha": "2026-06-28T10:30:00",
             "estado": "Preparando", "usuario": {"username": "jperez"}},
        ])
        m.get_productos_stock_bajo.return_value = MockResponse([
            {"id_producto": 3, "nombre": "Aceite", "precio": 8.90, "stock": 2,
             "estado": "Disponible", "categoria": {"nombre": "Abarrotes"}},
        ])
        m.get_comprobantes.return_value = MockResponse([
            {"id_comprobante": 1, "tipo": "Boleta", "numero": "B001-00000001",
             "fecha": "2026-06-28", "pago": {"monto": 25.50, "id_pedido": 1,
             "metodopago": {"nombre": "Yape"}, "pedido": {"id_pedido": 1, "total": 25.50,
             "usuario": {"username": "jperez", "email": "jperez@email.com"}}}},
        ])
        m.actualizar_estado_pedido.return_value = MockResponse([{
            "id_pedido": 1, "id_usuario": 1, "estado": "En despacho",
        }])
        m.crear_categoria.return_value = MockResponse([{
            "id_categoria": 10, "nombre": "Nueva Cat", "descripcion": "Test",
        }])
        m.crear_producto.return_value = MockResponse([{
            "id_producto": 10, "nombre": "Nuevo", "descripcion": "Test",
            "precio": 15.0, "stock": 50, "estado": "Disponible",
            "id_categoria": 1, "es_oferta_flash": False, "imagen_url": None,
            "categoria": None,
        }])
        m.get_productos_stock_multi.return_value = MockResponse([
            {"id_producto": 1, "stock": 100},
        ])
        # Mock para llamadas encadenadas: db.table().select().eq().single().execute()
        m.table.return_value = _mock_chain(None)
    if configurar:
        configurar(m)
    return patches


def desmock_todos_db(patches):
    for p in patches:
        p.stop()


@pytest.fixture
def dbm():
    """Fixture que mockea db en todos los módulos y limpia al final."""
    patches = mock_todos_db()
    yield patches[0].target  # reference any
    desmock_todos_db(patches)


# ===== Health check =====
class TestAPI_Health:
    def test_health(self):
        r = client.get("/health")
        assert r.status_code == 200


# ===== RF-01: Usuarios =====
class TestRF01_Usuarios:
    def test_listar_usuarios(self, dbm):
        r = client.get("/api/usuarios/")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        assert data[0]["username"] == "jperez"

    def test_obtener_usuario(self, dbm):
        r = client.get("/api/usuarios/1")
        assert r.status_code == 200
        assert r.json()["id_usuario"] == 1

    def test_usuario_no_encontrado(self, dbm):
        # Configurar mock para que get_usuario devuelva None
        for mod_name in MODULOS_DB:
            parts = mod_name.split(".")
            m = __import__(parts[0])
            for part in parts[1:]:
                m = getattr(m, part)
            m.get_usuario.return_value = MockResponse(None)
        r = client.get("/api/usuarios/999")
        assert r.status_code == 404


# ===== RF-02: Catálogo de productos =====
class TestRF02_Catalogo:
    def test_listar_productos(self, dbm):
        r = client.get("/api/productos/")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert data[0]["nombre"] == "Arroz Extra"

    def test_listar_categorias(self, dbm):
        r = client.get("/api/productos/categorias")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) >= 1

    def test_obtener_producto_individual(self, dbm):
        r = client.get("/api/productos/1")
        assert r.status_code == 200
        data = r.json()
        assert data["nombre"] == "Arroz Extra"
        assert data["precio"] == 4.50

    def test_producto_no_encontrado(self, dbm):
        for mod_name in MODULOS_DB:
            parts = mod_name.split(".")
            m = __import__(parts[0])
            for part in parts[1:]:
                m = getattr(m, part)
            m.get_producto.return_value = MockResponse(None)
        r = client.get("/api/productos/999")
        assert r.status_code == 404

    def test_buscar_productos(self, dbm):
        r = client.get("/api/productos/", params={"busqueda": "Arroz"})
        assert r.status_code == 200
        data = r.json()
        assert len(data) >= 1

    def test_filtrar_por_categoria(self, dbm):
        r = client.get("/api/productos/", params={"categoria_id": 1})
        assert r.status_code == 200

    def test_paginacion_productos(self, dbm):
        for mod_name in MODULOS_DB:
            parts = mod_name.split(".")
            m = __import__(parts[0])
            for part in parts[1:]:
                m = getattr(m, part)
            m.get_productos.return_value = MockResponse([
                {"id_producto": i, "nombre": f"P{i}", "precio": float(i),
                 "stock": 10, "categoria": None}
                for i in range(1, 4)
            ])
        r = client.get("/api/productos/", params={"limite": 3, "offset": 0})
        assert r.status_code == 200
        assert len(r.json()) <= 3

    def test_crear_producto(self, dbm):
        r = client.post("/api/productos/", json={
            "nombre": "Nuevo Producto", "precio": 15.00, "stock": 50,
        })
        assert r.status_code == 201
        assert r.json()["id_producto"] == 10


# ===== RF-03: Gestión del carrito de compras =====
class TestRF03_Carrito:
    def test_verificar_stock(self, dbm):
        r = client.get("/api/productos/stock/check",
                       params={"ids": "1", "cantidades": "2"})
        assert r.status_code == 200


# ===== RF-04: Procesamiento de pagos =====
class TestRF04_Pagos:
    def test_listar_comprobantes(self, dbm):
        r = client.get("/api/comprobantes/")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert data[0]["tipo"] == "Boleta"


# ===== RF-05: Confirmación de pedido =====
class TestRF05_Pedidos:
    def test_listar_pedidos(self, dbm):
        r = client.get("/api/pedidos/")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) >= 1

    def test_obtener_pedido_individual(self, dbm):
        r = client.get("/api/pedidos/1")
        assert r.status_code == 200
        data = r.json()
        assert data["estado"] == "Preparando"

    def test_pedido_no_encontrado(self, dbm):
        for mod_name in MODULOS_DB:
            parts = mod_name.split(".")
            m = __import__(parts[0])
            for part in parts[1:]:
                m = getattr(m, part)
            m.get_pedido.return_value = MockResponse(None)
        r = client.get("/api/pedidos/999")
        assert r.status_code == 404

    def test_filtrar_pedidos_por_estado(self, dbm):
        for estado in ["Preparando", "En despacho", "Entregado", "Cancelado"]:
            r = client.get("/api/pedidos/", params={"estado": estado})
            assert r.status_code == 200

    def test_filtro_estado_invalido(self, dbm):
        r = client.get("/api/pedidos/", params={"estado": "INEXISTENTE"})
        assert r.status_code == 400

    def test_exportar_pedidos_csv(self, dbm):
        for mod_name in MODULOS_DB:
            parts = mod_name.split(".")
            m = __import__(parts[0])
            for part in parts[1:]:
                m = getattr(m, part)
            m.get_pedidos.return_value = MockResponse([
                {"id_pedido": 1, "id_usuario": 1, "fecha": "2026-06-28",
                 "estado": "Preparando", "total": 25.50,
                 "usuario": {"username": "jperez"}},
            ])
        r = client.get("/api/pedidos/exportar/csv")
        assert r.status_code == 200
        contenido = r.text
        assert "ID Pedido" in contenido
        assert "#1" in contenido

    def test_despachar_pedido(self, dbm):
        r = client.post("/api/pedidos/1/despachar")
        assert r.status_code == 200
        assert "eta" in r.json()

    def test_actualizar_estado_pedido(self, dbm):
        for mod_name in MODULOS_DB:
            parts = mod_name.split(".")
            m = __import__(parts[0])
            for part in parts[1:]:
                m = getattr(m, part)
            m.get_pedido.return_value = MockResponse({
                "id_pedido": 1, "id_usuario": 1, "fecha": "2026-06-28",
                "estado": "Preparando", "total": 25.50,
                "usuario": {"username": "jperez"},
            })
            m.actualizar_estado_pedido.return_value = MockResponse([{
                "id_pedido": 1, "id_usuario": 1, "fecha": "2026-06-28",
                "estado": "En despacho", "total": 25.50,
                "usuario": {"username": "jperez"},
            }])
        r = client.patch("/api/pedidos/1/estado", json={"estado": "En despacho"})
        assert r.status_code == 200

    def test_actualizar_estado_bloqueado(self, dbm):
        # Si el estado actual es "En despacho" o "Entregado", debe bloquear
        for mod_name in MODULOS_DB:
            parts = mod_name.split(".")
            m = __import__(parts[0])
            for part in parts[1:]:
                m = getattr(m, part)
            m.get_pedido.return_value = MockResponse({
                "id_pedido": 1, "id_usuario": 1, "estado": "En despacho",
                "total": 25.50, "usuario": {"username": "jperez"},
            })
        r = client.patch("/api/pedidos/1/estado", json={"estado": "Cancelado"})
        assert r.status_code == 403


# ===== RF-06: Seguimiento de pedidos =====
class TestRF06_Seguimiento:
    def test_seguimiento_pedido_con_envio(self, dbm):
        r = client.get("/api/pedidos/1")
        assert r.status_code == 200
        data = r.json()
        assert "detalles" in data
        assert "envio" in data


# ===== RF-07: Panel administrativo =====
class TestRF07_Administracion:
    def test_metricas_dashboard(self, dbm):
        r = client.get("/api/dashboard/metricas")
        assert r.status_code == 200
        data = r.json()
        assert "pedidos_pendientes" in data
        assert data["pedidos_pendientes"] == 5

    def test_dashboard_data_completo(self, dbm):
        r = client.get("/api/dashboard/data")
        assert r.status_code == 200
        data = r.json()
        assert "metricas" in data
        assert "pedidos_recientes" in data
        assert "alertas_stock" in data

    def test_listar_categorias_crud(self, dbm):
        r = client.get("/api/categorias/")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) >= 1

    def test_obtener_categoria_individual(self, dbm):
        # Configurar mock para llamada encadenada db.table().select().eq().single().execute()
        import api.categorias
        api.categorias.db.table.return_value = _mock_chain({
            "id_categoria": 1, "nombre": "Abarrotes", "descripcion": "Abarrotes",
        })
        r = client.get("/api/categorias/1")
        assert r.status_code == 200
        assert r.json()["nombre"] == "Abarrotes"

    def test_crear_categoria(self, dbm):
        r = client.post("/api/categorias/", json={
            "nombre": "Nueva Cat", "descripcion": "Test",
        })
        assert r.status_code == 201


# ===== RF-08: IA - Recomendaciones personalizadas =====
class TestRF08_IA_Recomendaciones:
    @patch("ai.routes.recomendador")
    def test_recomendar_por_producto(self, mock_rec, dbm):
        mock_rec.entrenado = True
        mock_rec.recomendar.return_value = [
            {"id_producto": 2, "nombre": "Fideos", "similitud": 0.45},
        ]
        r = client.post("/api/ai/recomendar/producto",
                        json={"producto_id": 1, "top_n": 5})
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    @patch("ai.routes.recomendador")
    def test_recomendar_sin_entrenar(self, mock_rec, dbm):
        mock_rec.entrenado = False
        r = client.post("/api/ai/recomendar/producto",
                        json={"producto_id": 1})
        assert r.status_code == 400

    @patch("ai.routes.recomendador")
    def test_recomendar_por_usuario(self, mock_rec, dbm):
        mock_rec.entrenado = True
        mock_rec.recomendar_para_usuario.return_value = [
            {"id_producto": 2, "nombre": "Fideos"},
        ]
        r = client.post("/api/ai/recomendar/usuario",
                        json={"historial_ids": [1], "top_n": 5})
        assert r.status_code == 200
        assert isinstance(r.json(), list)


# ===== RF-09: IA - Predicciones =====
class TestRF09_IA_Predicciones:
    @patch("ai.routes.predictor")
    def test_predecir_ventas(self, mock_pred, dbm):
        mock_pred.entrenado_ventas = True
        mock_pred.predecir_ventas.return_value = [150.0, 162.5, 171.0]
        r = client.post("/api/ai/predecir/ventas", json={"dias": 3})
        assert r.status_code == 200
        data = r.json()
        assert "predicciones" in data
        assert len(data["predicciones"]) == 3

    @patch("ai.routes.predictor")
    def test_predecir_ventas_sin_entrenar(self, mock_pred, dbm):
        mock_pred.entrenado_ventas = False
        r = client.post("/api/ai/predecir/ventas", json={"dias": 7})
        assert r.status_code == 400

    def test_predecir_stock_critico(self, dbm):
        r = client.post("/api/ai/predecir/stock-critico")
        assert r.status_code == 200
        data = r.json()
        assert "en_riesgo" in data

    def test_entrenar_predicciones(self, dbm):
        r = client.post("/api/ai/entrenar/predicciones")
        assert r.status_code == 200
        assert "mensaje" in r.json()


# ===== RF-10: IA - Chatbot asistido =====
class TestRF10_IA_Chatbot:
    @patch("ai.routes.chatbot")
    def test_chatbot_endpoint(self, mock_chat, dbm):
        mock_chat.responder = AsyncMock(return_value="¡Hola! Soy el asistente virtual de MASSGO.")
        mock_chat.detectar_intencion.return_value = "saludo"
        r = client.post("/api/ai/chat", json={"mensaje": "hola"})
        assert r.status_code == 200
        data = r.json()
        assert "respuesta" in data
        assert data["intencion"] == "saludo"

    def test_sentimiento(self, dbm):
        r = client.post("/api/ai/sentimiento", json={"texto": "Excelente servicio"})
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, dict)

    def test_palabras_clave(self, dbm):
        r = client.post("/api/ai/palabras-clave",
                        json={"texto": "Compré arroz y leche en MassGo"})
        assert r.status_code == 200
        data = r.json()
        assert "palabras_clave" in data
        assert isinstance(data["palabras_clave"], list)
