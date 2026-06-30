"""Pruebas del sistema de predicciones con ML."""

import pytest
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from ai.predictions import PredictorMassGo


class TestPredictorMassGo:
    def test_no_entrenado_devuelve_vacio(self):
        pred = PredictorMassGo()
        assert pred.predecir_ventas() == []
        assert pred.entrenado_ventas is False

    def test_entrenar_ventas_insuficientes(self, sample_pedidos):
        pred = PredictorMassGo()
        pred.entrenar_ventas(sample_pedidos[:3])
        assert pred.entrenado_ventas is False  # menos de 7 pedidos

    def test_entrenar_ventas_suficientes(self, sample_pedidos):
        pred = PredictorMassGo()
        pred.entrenar_ventas(sample_pedidos)
        assert pred.entrenado_ventas is True

    def test_predecir_ventas_con_modelo(self, sample_pedidos):
        pred = PredictorMassGo()
        pred.entrenar_ventas(sample_pedidos)
        predicciones = pred.predecir_ventas(dias_futuros=3)
        assert len(predicciones) == 3
        for v in predicciones:
            assert v >= 0
            assert isinstance(v, float)

    def test_stock_no_entrenado_fallback(self, sample_productos):
        pred = PredictorMassGo()
        criticos = pred.predecir_stock_critico(sample_productos)
        assert len(criticos) == 2  # productos con stock <= 5

    def test_entrenar_stock_insuficiente(self, sample_productos):
        pred = PredictorMassGo()
        pred.entrenar_stock(sample_productos[:3])
        assert pred.entrenado_stock is False

    def test_entrenar_stock_suficiente(self, sample_productos):
        pred = PredictorMassGo()
        pred.entrenar_stock(sample_productos)
        assert pred.entrenado_stock is True

    def test_predecir_stock_critico_entrenado(self, sample_productos):
        pred = PredictorMassGo()
        pred.entrenar_stock(sample_productos)
        criticos = pred.predecir_stock_critico(sample_productos)
        assert len(criticos) >= 1

    def test_detectar_tendencias(self, sample_pedidos):
        pred = PredictorMassGo()
        tendencias = pred.detectar_tendencias(sample_pedidos)
        assert isinstance(tendencias, list)
        # Cada resultado debe tener fecha y tendencia
        if tendencias:
            assert "fecha" in tendencias[0] or "tendencia" in tendencias[0]
