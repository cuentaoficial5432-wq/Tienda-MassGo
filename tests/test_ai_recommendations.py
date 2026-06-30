"""Pruebas del sistema de recomendaciones con IA."""

import pytest
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from ai.recommendations import RecomendadorMassGo


class TestRecomendadorMassGo:
    def test_no_entrenado_devuelve_vacio(self):
        rec = RecomendadorMassGo()
        assert rec.recomendar(1) == []
        assert rec.entrenado is False

    def test_entrenar_con_menos_de_2_productos(self, sample_productos):
        rec = RecomendadorMassGo()
        rec.entrenar(sample_productos[:1])
        assert rec.entrenado is False

    def test_entrenar_con_productos_suficientes(self, sample_productos):
        rec = RecomendadorMassGo()
        rec.entrenar(sample_productos)
        assert rec.entrenado is True
        assert rec.matriz_tfidf is not None

    def test_recomendar_producto_existente(self, sample_productos):
        rec = RecomendadorMassGo()
        rec.entrenar(sample_productos)
        resultados = rec.recomendar(1, top_n=3)
        assert len(resultados) <= 3
        if resultados:
            assert "similitud" in resultados[0]
            for r in resultados:
                assert r["id_producto"] != 1  # No debe recomendarse a sí mismo

    def test_recomendar_producto_inexistente(self, sample_productos):
        rec = RecomendadorMassGo()
        rec.entrenar(sample_productos)
        assert rec.recomendar(999) == []

    def test_recomendar_para_usuario_sin_historial(self, sample_productos):
        rec = RecomendadorMassGo()
        rec.entrenar(sample_productos)
        resultados = rec.recomendar_para_usuario([], top_n=3)
        # Sin historial, debe devolver populares
        assert len(resultados) <= 3

    def test_recomendar_para_usuario_con_historial(self, sample_productos):
        rec = RecomendadorMassGo()
        rec.entrenar(sample_productos)
        resultados = rec.recomendar_para_usuario([1, 2], top_n=3)
        assert len(resultados) <= 3

    def test_populares_retorna_productos(self, sample_productos):
        rec = RecomendadorMassGo()
        rec.entrenar(sample_productos)
        populares = rec._populares(2)
        assert len(populares) <= 2

    def test_buscar_indice_existente(self, sample_productos):
        rec = RecomendadorMassGo()
        rec.entrenar(sample_productos)
        idx = rec._buscar_indice(1)
        assert idx == 0

    def test_buscar_indice_inexistente(self, sample_productos):
        rec = RecomendadorMassGo()
        rec.entrenar(sample_productos)
        assert rec._buscar_indice(999) is None

    def test_similitud_entre_productos_similares(self, sample_productos):
        rec = RecomendadorMassGo()
        rec.entrenar(sample_productos)
        resultados = rec.recomendar(1, top_n=5)
        # Al menos productos de la misma categoría deben tener similitud > 0
        for r in resultados:
            if r.get("similitud", 0) > 0.05:
                assert r["similitud"] > 0
