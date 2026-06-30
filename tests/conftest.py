import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

import pytest


@pytest.fixture
def sample_productos():
    return [
        {"id_producto": 1, "nombre": "Arroz", "descripcion": "Arroz extra superior", "precio": 4.50, "stock": 100, "id_categoria": 1, "categoria": {"nombre": "Abarrotes"}},
        {"id_producto": 2, "nombre": "Fideos", "descripcion": "Fideos tallarín", "precio": 3.20, "stock": 80, "id_categoria": 1, "categoria": {"nombre": "Abarrotes"}},
        {"id_producto": 3, "nombre": "Aceite", "descripcion": "Aceite vegetal", "precio": 8.90, "stock": 2, "id_categoria": 1, "categoria": {"nombre": "Abarrotes"}},
        {"id_producto": 4, "nombre": "Leche", "descripcion": "Leche evaporada", "precio": 3.80, "stock": 0, "id_categoria": 2, "categoria": {"nombre": "Lácteos"}},
        {"id_producto": 5, "nombre": "Pan", "descripcion": "Pan de molde", "precio": 2.50, "stock": 50, "id_categoria": 2, "categoria": {"nombre": "Panadería"}},
    ]


@pytest.fixture
def sample_pedidos():
    return [
        {"id_pedido": 1, "fecha": "2026-06-20", "total": 15.50, "estado": "Entregado", "id_usuario": 1},
        {"id_pedido": 2, "fecha": "2026-06-21", "total": 22.30, "estado": "Entregado", "id_usuario": 1},
        {"id_pedido": 3, "fecha": "2026-06-22", "total": 8.90, "estado": "Preparando", "id_usuario": 1},
        {"id_pedido": 4, "fecha": "2026-06-23", "total": 45.00, "estado": "Entregado", "id_usuario": 2},
        {"id_pedido": 5, "fecha": "2026-06-24", "total": 12.00, "estado": "Entregado", "id_usuario": 1},
        {"id_pedido": 6, "fecha": "2026-06-25", "total": 33.50, "estado": "Entregado", "id_usuario": 1},
        {"id_pedido": 7, "fecha": "2026-06-26", "total": 27.80, "estado": "Entregado", "id_usuario": 2},
        {"id_pedido": 8, "fecha": "2026-06-27", "total": 19.90, "estado": "En despacho", "id_usuario": 1},
    ]
