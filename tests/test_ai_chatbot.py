"""Pruebas del chatbot con IA."""

import pytest
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from ai.chatbot import ChatbotMassGo, INTENCIONES


class TestChatbotMassGo:
    @pytest.fixture
    def chatbot(self):
        return ChatbotMassGo()

    def test_detectar_intencion_seguimiento(self, chatbot):
        mensajes = ["dónde está mi pedido", "seguimiento", "estado del pedido"]
        for msg in mensajes:
            assert chatbot.detectar_intencion(msg) == "seguimiento_pedido"

    def test_detectar_intencion_cancelar(self, chatbot):
        mensajes = ["cancelar pedido", "quiero cancelar", "cancelación"]
        for msg in mensajes:
            assert chatbot.detectar_intencion(msg) == "cancelar_pedido"

    def test_detectar_intencion_horario(self, chatbot):
        mensajes = ["horario", "qué horas atienden", "abren"]
        for msg in mensajes:
            assert chatbot.detectar_intencion(msg) == "horario"

    def test_detectar_intencion_producto(self, chatbot):
        mensajes = ["precio", "cuánto cuesta", "tienes arroz", "stock"]
        for msg in mensajes:
            assert chatbot.detectar_intencion(msg) == "producto"

    def test_detectar_intencion_saludo(self, chatbot):
        assert chatbot.detectar_intencion("hola") == "saludo"
        assert chatbot.detectar_intencion("buenos días") == "saludo"

    def test_detectar_intencion_despedida(self, chatbot):
        assert chatbot.detectar_intencion("gracias") == "despedida"
        assert chatbot.detectar_intencion("adiós") == "despedida"

    def test_detectar_intencion_general(self, chatbot):
        assert chatbot.detectar_intencion("qué clima hace hoy") == "general"

    def test_responder_sin_openai_horario(self, chatbot):
        respuesta = chatbot.responder_sin_openai("¿cuál es su horario?")
        assert "7:00" in respuesta or "10:00" in respuesta

    def test_responder_sin_openai_contacto(self, chatbot):
        respuesta = chatbot.responder_sin_openai("teléfono de contacto")
        assert "044" in respuesta or "whatsapp" in respuesta

    def test_responder_sin_openai_devolucion(self, chatbot):
        respuesta = chatbot.responder_sin_openai("devolución")
        assert "devolucion" in respuesta.lower() or "devolver" in respuesta.lower()

    def test_responder_sin_openai_saludo(self, chatbot):
        respuesta = chatbot.responder_sin_openai("hola")
        assert "hola" in respuesta.lower() or "MASSGO" in respuesta

    def test_responder_sin_openai_gracias(self, chatbot):
        respuesta = chatbot.responder_sin_openai("gracias")
        assert "gracias" in respuesta.lower() or "excelente" in respuesta.lower()

    def test_responder_sin_openai_general(self, chatbot):
        respuesta = chatbot.responder_sin_openai("qué es MassGo")
        assert len(respuesta) > 0

    def test_intenciones_definidas(self):
        assert len(INTENCIONES) >= 8
        for intencion, patrones in INTENCIONES.items():
            assert len(patrones) >= 2, f"Intención '{intencion}' debe tener al menos 2 patrones"
