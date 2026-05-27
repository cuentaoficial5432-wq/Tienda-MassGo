from fastapi import APIRouter, HTTPException, Query
from models import Pedido, PedidoCreate, PedidoUpdate, DetallePedido, Envio, Pago
from database import db
from typing import List, Optional

router = APIRouter(prefix="/api/pedidos", tags=["Pedidos"])

ESTADOS_VALIDOS = {"Preparando", "En despacho", "Entregado", "Cancelado"}
ESTADOS_BLOQUEADOS = {"En despacho", "Entregado"}


def _formatear_pedido(p: dict) -> dict:
    usuario = p.get("usuario") or {}
    cliente = (
        usuario.get("username") or
        usuario.get("email") or
        f"Usuario #{p['id_usuario']}"
    )
    return {
        "id_pedido": p["id_pedido"],
        "id_usuario": p["id_usuario"],
        "fecha": str(p.get("fecha")) if p.get("fecha") else None,
        "estado": p.get("estado", "Pendiente"),
        "total": float(p["total"]),
        "cliente_nombre": cliente,
        "detalles": [],
        "envio": None,
        "pagos": [],
    }


@router.get("/", response_model=List[Pedido])
async def listar_pedidos(
    limite: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    estado: Optional[str] = Query(None),
):
    res = db.get_pedidos(limite, offset)
    pedidos = res.data if res.data else []

    if estado:
        if estado not in ESTADOS_VALIDOS:
            raise HTTPException(400, f"Estado inválido. Válidos: {', '.join(sorted(ESTADOS_VALIDOS))}")
        pedidos = [p for p in pedidos if p.get("estado") == estado]

    resultado = []
    for p in pedidos:
        fp = _formatear_pedido(p)
        # Cargar detalles
        det_res = db.get_detalle_pedido(p["id_pedido"])
        if det_res.data:
            fp["detalles"] = [
                {
                    "id_detalle": d["id_detalle"],
                    "id_pedido": d["id_pedido"],
                    "id_producto": d["id_producto"],
                    "cantidad": d["cantidad"],
                    "precio_unitario": float(d["precio_unitario"]),
                    "producto_nombre": (d.get("producto") or {}).get("nombre"),
                    "producto_imagen": (d.get("producto") or {}).get("imagen_url"),
                }
                for d in det_res.data
            ]
        # Cargar envío
        env_res = db.get_envio_por_pedido(p["id_pedido"])
        if env_res.data:
            fp["envio"] = {
                "id_envio": env_res.data["id_envio"],
                "id_pedido": env_res.data["id_pedido"],
                "direccion_entrega": env_res.data["direccion_entrega"],
                "estado": env_res.data.get("estado", "Pendiente"),
                "fecha_envio": str(env_res.data.get("fecha_envio")) if env_res.data.get("fecha_envio") else None,
                "fecha_entrega": str(env_res.data.get("fecha_entrega")) if env_res.data.get("fecha_entrega") else None,
            }
        # Cargar pagos
        pag_res = db.get_pagos_por_pedido(p["id_pedido"])
        if pag_res.data:
            fp["pagos"] = [
                {
                    "id_pago": pg["id_pago"],
                    "id_pedido": pg["id_pedido"],
                    "monto": float(pg["monto"]),
                    "fecha": str(pg.get("fecha")) if pg.get("fecha") else None,
                    "metodo_pago": (pg.get("metodopago") or {}).get("nombre"),
                }
                for pg in pag_res.data
            ]
        resultado.append(fp)

    return resultado


@router.get("/{pedido_id}", response_model=Pedido)
async def obtener_pedido(pedido_id: int):
    res = db.get_pedido(pedido_id)
    if not res.data:
        raise HTTPException(404, "Pedido no encontrado")
    return _formatear_pedido(res.data)


@router.post("/", response_model=Pedido, status_code=201)
async def crear_pedido(data: PedidoCreate):
    payload = data.model_dump()
    payload.setdefault("estado", "Preparando")
    res = db.crear_pedido(payload)
    if not res.data:
        raise HTTPException(500, "Error al crear pedido")
    return _formatear_pedido(res.data[0])


@router.patch("/{pedido_id}/estado")
async def actualizar_estado(pedido_id: int, data: PedidoUpdate):
    if data.estado and data.estado not in ESTADOS_VALIDOS:
        raise HTTPException(400, f"Estado inválido. Válidos: {', '.join(sorted(ESTADOS_VALIDOS))}")
    limpio = data.model_dump(exclude_none=True)
    if not limpio:
        raise HTTPException(400, "No hay campos para actualizar")

    res_actual = db.get_pedido(pedido_id)
    if res_actual.data:
        estado_actual = res_actual.data.get("estado")
        if estado_actual in ESTADOS_BLOQUEADOS:
            raise HTTPException(403, f"No se puede modificar un pedido en estado '{estado_actual}'. Está bloqueado.")

    res = db.actualizar_estado_pedido(pedido_id, data.estado)
    if not res.data:
        raise HTTPException(404, "Pedido no encontrado")
    return _formatear_pedido(res.data[0])


@router.get("/exportar/csv")
async def exportar_pedidos_csv(estado: Optional[str] = Query(None)):
    import io
    import csv
    from datetime import datetime
    res = db.get_pedidos(500, 0)
    pedidos = res.data if res.data else []
    if estado:
        pedidos = [p for p in pedidos if p.get("estado") == estado]

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID Pedido", "Cliente", "Total", "Fecha", "Estado"])
    for p in pedidos:
        fecha = str(p.get("fecha", ""))[:10] if p.get("fecha") else ""
        usuario = p.get("usuario") or {}
        cliente = usuario.get("username", f"Usuario #{p['id_usuario']}")
        writer.writerow([
            f"#{p['id_pedido']}",
            cliente,
            float(p["total"]),
            fecha,
            p.get("estado", ""),
        ])
    return output.getvalue()
