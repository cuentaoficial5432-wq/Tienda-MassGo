"""Pruebas unitarias de los modelos Pydantic."""

import pytest
from backend.models import (
    ProductoBase, ProductoCreate, ProductoUpdate, Producto,
    Categoria, PedidoCreate, PedidoUpdate,
    DetallePedido, Envio,
)


class TestProductoBase:
    def test_producto_valido(self):
        p = ProductoBase(nombre="Arroz", precio=4.50, stock=100)
        assert p.nombre == "Arroz"
        assert p.precio == 4.50
        assert p.stock == 100
        assert p.estado == "Disponible"
        assert p.es_oferta_flash is False

    def test_precio_debe_ser_positivo(self):
        with pytest.raises(ValueError):
            ProductoBase(nombre="Arroz", precio=0, stock=10)

    def test_stock_no_negativo(self):
        with pytest.raises(ValueError):
            ProductoBase(nombre="Arroz", precio=5, stock=-1)

    def test_producto_sin_descripcion(self):
        p = ProductoBase(nombre="Leche", precio=3.80, stock=50)
        assert p.descripcion is None


class TestProductoCreate:
    def test_create_hereda_base(self):
        p = ProductoCreate(nombre="Fideos", precio=3.20, stock=80)
        assert isinstance(p, ProductoBase)


class TestProductoUpdate:
    def test_update_parcial(self):
        u = ProductoUpdate(precio=5.00)
        assert u.precio == 5.00
        assert u.nombre is None

    def test_update_vacio(self):
        u = ProductoUpdate()
        assert u.nombre is None
        assert u.precio is None
        assert u.stock is None


class TestProducto:
    def test_producto_con_categoria(self):
        cat = Categoria(id_categoria=1, nombre="Abarrotes")
        p = Producto(id_producto=1, nombre="Arroz", precio=4.50, stock=100, categoria=cat)
        assert p.id_producto == 1
        assert p.categoria.nombre == "Abarrotes"

    def test_producto_sin_categoria(self):
        p = Producto(id_producto=2, nombre="Leche", precio=3.80, stock=50)
        assert p.categoria is None


class TestPedido:
    def test_pedido_create_valido(self):
        pedido = PedidoCreate(
            id_usuario=1,
            total=25.00,
        )
        assert pedido.id_usuario == 1
        assert pedido.total == 25.00
        assert pedido.estado == "Preparando"

    def test_pedido_update_estado(self):
        u = PedidoUpdate(estado="En despacho")
        assert u.estado == "En despacho"


class TestDetallePedido:
    def test_detalle_valido(self):
        d = DetallePedido(id_detalle=1, id_pedido=1, id_producto=1, cantidad=2, precio_unitario=4.50)
        assert d.cantidad == 2
        assert d.precio_unitario == 4.50


class TestEnvio:
    def test_envio_valido(self):
        e = Envio(id_envio=1, id_pedido=1, direccion_entrega="Av. Larco 456")
        assert e.estado == "Pendiente"

    def test_envio_con_fechas(self):
        from datetime import datetime
        e = Envio(
            id_envio=1, id_pedido=1,
            direccion_entrega="Av. Larco 456",
            estado="Entregado",
            fecha_envio=datetime(2026, 6, 28, 10, 0),
            fecha_entrega=datetime(2026, 6, 28, 10, 30),
        )
        assert e.estado == "Entregado"
        assert e.fecha_envio is not None


class TestCategoria:
    def test_categoria_con_descripcion(self):
        c = Categoria(id_categoria=1, nombre="Lácteos", descripcion="Productos lácteos")
        assert c.descripcion == "Productos lácteos"

    def test_categoria_sin_descripcion(self):
        c = Categoria(id_categoria=2, nombre="Abarrotes")
        assert c.descripcion is None
