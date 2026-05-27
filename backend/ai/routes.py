from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from .recommendations import recomendador
from .predictions import predictor, PredecirVentasRequest
from .chatbot import chatbot
from .nlp_utils import analizar_sentimiento, extraer_palabras_clave

router = APIRouter(prefix="/api/ai", tags=["IA / Machine Learning"])


class RecomendacionRequest(BaseModel):
    producto_id: int
    top_n: int = 5


class RecomendacionUsuarioRequest(BaseModel):
    historial_ids: List[int]
    top_n: int = 5


class ChatRequest(BaseModel):
    mensaje: str
    usuario_id: Optional[int] = None


class SentimientoRequest(BaseModel):
    texto: str


@router.post("/recomendar/producto")
async def recomendar_producto(data: RecomendacionRequest):
    if not recomendador.entrenado:
        raise HTTPException(400, "Modelo de recomendaciones no entrenado. POST /api/ai/entrenar/recomendaciones primero.")
    return recomendador.recomendar(data.producto_id, data.top_n)


@router.post("/recomendar/usuario")
async def recomendar_para_usuario(data: RecomendacionUsuarioRequest):
    return recomendador.recomendar_para_usuario(data.historial_ids, data.top_n)


@router.post("/predecir/ventas")
async def predecir_ventas(data: PredecirVentasRequest = PredecirVentasRequest()):
    if not predictor.entrenado_ventas:
        raise HTTPException(400, "Modelo de ventas no entrenado. POST /api/ai/entrenar/predicciones primero.")
    return {"predicciones": predictor.predecir_ventas(data.dias)}


@router.post("/predecir/stock-critico")
async def predecir_stock_critico():
    from database import db
    res = db.get_productos(200)
    productos = res.data if res.data else []
    if not productos:
        return {"en_riesgo": []}
    return {"en_riesgo": predictor.predecir_stock_critico(productos)}


@router.post("/chat")
async def chat(data: ChatRequest):
    respuesta = await chatbot.responder(data.mensaje, data.usuario_id)
    return {"respuesta": respuesta, "intencion": chatbot.detectar_intencion(data.mensaje)}


@router.post("/sentimiento")
async def sentimiento(data: SentimientoRequest):
    return analizar_sentimiento(data.texto)


@router.post("/palabras-clave")
async def palabras_clave(data: SentimientoRequest):
    return {"palabras_clave": extraer_palabras_clave(data.texto)}


@router.post("/entrenar/recomendaciones")
async def entrenar_recomendaciones():
    from database import db
    res = db.get_productos(500)
    productos = res.data if res.data else []
    if not productos:
        raise HTTPException(400, "No hay productos en la base de datos")
    recomendador.entrenar(productos)
    return {"mensaje": f"Modelo entrenado con {len(productos)} productos"}


@router.post("/entrenar/predicciones")
async def entrenar_predicciones():
    from database import db
    res = db.get_pedidos(500)
    pedidos = res.data if res.data else []
    if pedidos:
        predictor.entrenar_ventas(pedidos)
    res_prod = db.get_productos(200)
    productos = res_prod.data if res_prod.data else []
    if productos:
        predictor.entrenar_stock(productos)
    return {"mensaje": f"Modelos entrenados: {len(pedidos)} pedidos, {len(productos)} productos"}
