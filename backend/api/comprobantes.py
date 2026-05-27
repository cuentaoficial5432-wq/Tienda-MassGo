from fastapi import APIRouter
from models import ComprobanteResumen
from database import db
from typing import List

router = APIRouter(prefix="/api/comprobantes", tags=["Comprobantes"])


def _extraer_pago(pago: dict) -> dict:
    """Pago puede ser un dict o None"""
    if not pago:
        return {}
    metodopago = pago.get("metodopago") or {}
    pedido = pago.get("pedido") or {}
    usuario = pedido.get("usuario") or {}
    return {
        "monto": float(pago.get("monto", 0)),
        "metodo_pago": metodopago.get("nombre") if isinstance(metodopago, dict) else None,
        "id_pedido": pedido.get("id_pedido") or pago.get("id_pedido"),
        "cliente": usuario.get("username") if isinstance(usuario, dict) else None,
        "email": usuario.get("email") if isinstance(usuario, dict) else None,
        "total_pedido": float(pedido["total"]) if pedido.get("total") else None,
    }


def _formatear(c: dict) -> ComprobanteResumen:
    pago_data = _extraer_pago(c.get("pago"))
    return ComprobanteResumen(
        id_comprobante=c["id_comprobante"],
        tipo=c.get("tipo", ""),
        numero=c.get("numero", ""),
        fecha=c.get("fecha"),
        monto=pago_data.get("monto", 0),
        metodo_pago=pago_data.get("metodo_pago"),
        id_pedido=pago_data.get("id_pedido", 0),
        cliente=pago_data.get("cliente"),
        email=pago_data.get("email"),
        total_pedido=pago_data.get("total_pedido"),
    )


@router.get("/", response_model=List[ComprobanteResumen])
async def listar_comprobantes(limite: int = 50, offset: int = 0):
    res = db.get_comprobantes(limite=limite, offset=offset)
    return [_formatear(c) for c in res.data] if res.data else []
