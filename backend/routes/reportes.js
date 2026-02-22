const express = require("express");
const router = express.Router();
const pool = require("../db");

/* ===============================
   UTILIDAD PARA FECHAS CORRECTAS
=================================*/

const rangoFechas = `
  fecha >= $1::date
  AND fecha < ($2::date + interval '1 day')
`;

/* ===============================
   VENTAS POR RANGO
=================================*/

router.get("/ventas-rango", async (req, res) => {
  const { desde, hasta } = req.query;

  try {
    const result = await pool.query(
      `
      SELECT COUNT(*) AS cantidad_facturas,
             COALESCE(SUM(total),0) AS total_vendido
      FROM facturas
      WHERE ${rangoFechas}
      `,
      [desde, hasta]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ===============================
   VENTAS POR PRODUCTO
=================================*/

router.get("/ventas-producto", async (req, res) => {
  const { idproducto, desde, hasta } = req.query;

  try {
    const result = await pool.query(
      `
      SELECT p.nombre,
             COALESCE(SUM(d.cantidad),0) AS cantidad_vendida,
             COALESCE(SUM(d.subtotal),0) AS total_generado
      FROM detalle_facturas d
      JOIN facturas f ON d.idfactura = f.idfactura
      JOIN productos p ON d.idproducto = p.idproducto
      WHERE d.idproducto = $1
      AND f.fecha >= $2::date
      AND f.fecha < ($3::date + interval '1 day')
      GROUP BY p.nombre
      `,
      [idproducto, desde, hasta]
    );

    res.json(result.rows[0] || null);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ===============================
   GANANCIA
=================================*/

router.get("/ganancia-rango", async (req, res) => {
  const { desde, hasta } = req.query;

  try {
    const result = await pool.query(
      `
      SELECT COALESCE(SUM((d.precio - p.costo) * d.cantidad),0) AS ganancia
      FROM detalle_facturas d
      JOIN facturas f ON d.idfactura = f.idfactura
      JOIN productos p ON d.idproducto = p.idproducto
      WHERE f.fecha >= $1::date
      AND f.fecha < ($2::date + interval '1 day')
      `,
      [desde, hasta]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ===============================
   MOVIMIENTOS DETALLADOS
=================================*/

router.get("/movimientos-detalle", async (req, res) => {
  const { desde, hasta } = req.query;

  try {
    const result = await pool.query(
      `
      SELECT p.nombre,
             m.tipo,
             SUM(m.cantidad) AS total
      FROM inventario_movimiento m
      JOIN productos p ON m.idproducto = p.idproducto
      WHERE m.fecha >= $1::date
      AND m.fecha < ($2::date + interval '1 day')
      GROUP BY p.nombre, m.tipo
      ORDER BY p.nombre
      `,
      [desde, hasta]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ===============================
   TOP PRODUCTOS
=================================*/

router.get("/top-productos-rango", async (req, res) => {
  const { desde, hasta } = req.query;

  try {
    const result = await pool.query(
      `
      SELECT p.nombre,
             SUM(d.cantidad) AS total_vendido
      FROM detalle_facturas d
      JOIN facturas f ON d.idfactura = f.idfactura
      JOIN productos p ON d.idproducto = p.idproducto
      WHERE f.fecha >= $1::date
      AND f.fecha < ($2::date + interval '1 day')
      GROUP BY p.nombre
      ORDER BY total_vendido DESC
      LIMIT 5
      `,
      [desde, hasta]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ===============================
   TOP 3 CLIENTES
=================================*/

router.get("/top-clientes", async (req, res) => {
  const { desde, hasta } = req.query;

  try {
    const result = await pool.query(
      `
      SELECT c.nombre,
             COUNT(f.idfactura) AS total_compras,
             SUM(f.total) AS total_gastado
      FROM facturas f
      JOIN cliente c ON f.idcliente = c.idcliente
      WHERE f.fecha >= $1::date
      AND f.fecha < ($2::date + interval '1 day')
      GROUP BY c.nombre
      ORDER BY total_compras DESC
      LIMIT 3
      `,
      [desde, hasta]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;