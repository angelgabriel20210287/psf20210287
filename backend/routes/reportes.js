const express = require("express");
const router = express.Router();
const pool = require("../db");

/* ─────────────────────────────────────────
   1. RESUMEN GENERAL
───────────────────────────────────────── */
router.get("/resumen", async (req, res) => {
  const { desde, hasta } = req.query;
  try {
    const [ventas, ganancia, creditos, stockBajo] = await Promise.all([
      pool.query(
        `SELECT COUNT(*) AS facturas,
                COALESCE(SUM(total), 0) AS total_vendido,
                COALESCE(SUM(CASE WHEN tipo_pago = 'contado' THEN total ELSE 0 END), 0) AS contado,
                COALESCE(SUM(CASE WHEN tipo_pago = 'credito' THEN total ELSE 0 END), 0) AS credito
         FROM facturas
         WHERE fecha >= $1::date AND fecha < ($2::date + interval '1 day')`,
        [desde, hasta]
      ),
      pool.query(
        `SELECT COALESCE(SUM((d.precio - p.costo) * d.cantidad), 0) AS ganancia,
                COALESCE(SUM(d.precio * d.cantidad), 0) AS ingresos,
                COALESCE(SUM(p.costo * d.cantidad), 0) AS costos
         FROM detalle_facturas d
         JOIN facturas f ON d.idfactura = f.idfactura
         JOIN productos p ON d.idproducto = p.idproducto
         WHERE f.fecha >= $1::date AND f.fecha < ($2::date + interval '1 day')`,
        [desde, hasta]
      ),
      pool.query(
        `SELECT COUNT(*) AS total_creditos,
                COALESCE(SUM(saldo), 0) AS pendiente_cobro
         FROM creditos
         WHERE estado = 'pendiente'`
      ),
      pool.query(
        `SELECT COUNT(*) AS productos_bajo_stock
         FROM productos
         WHERE stock <= 5`
      ),
    ]);

    res.json({
      ventas: ventas.rows[0],
      ganancia: ganancia.rows[0],
      creditos: creditos.rows[0],
      stockBajo: stockBajo.rows[0],
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ─────────────────────────────────────────
   2. VENTAS POR RANGO
───────────────────────────────────────── */
router.get("/ventas-rango", async (req, res) => {
  const { desde, hasta } = req.query;
  try {
    const result = await pool.query(
      `SELECT COUNT(*) AS cantidad_facturas,
              COALESCE(SUM(total), 0) AS total_vendido,
              COALESCE(SUM(CASE WHEN tipo_pago = 'contado' THEN total ELSE 0 END), 0) AS total_contado,
              COALESCE(SUM(CASE WHEN tipo_pago = 'credito' THEN total ELSE 0 END), 0) AS total_credito
       FROM facturas
       WHERE fecha >= $1::date AND fecha < ($2::date + interval '1 day')`,
      [desde, hasta]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ─────────────────────────────────────────
   3. VENTAS DIARIAS
───────────────────────────────────────── */
router.get("/ventas-diarias", async (req, res) => {
  const { desde, hasta } = req.query;
  try {
    const result = await pool.query(
      `SELECT DATE(fecha) AS dia,
              COUNT(*) AS facturas,
              COALESCE(SUM(total), 0) AS total
       FROM facturas
       WHERE fecha >= $1::date AND fecha < ($2::date + interval '1 day')
       GROUP BY DATE(fecha)
       ORDER BY dia ASC`,
      [desde, hasta]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ─────────────────────────────────────────
   4. GANANCIA REAL
───────────────────────────────────────── */
router.get("/ganancia-rango", async (req, res) => {
  const { desde, hasta } = req.query;
  try {
    const result = await pool.query(
      `SELECT COALESCE(SUM((d.precio - p.costo) * d.cantidad), 0) AS ganancia,
              COALESCE(SUM(d.precio * d.cantidad), 0) AS ingresos,
              COALESCE(SUM(p.costo * d.cantidad), 0) AS costos
       FROM detalle_facturas d
       JOIN facturas f ON d.idfactura = f.idfactura
       JOIN productos p ON d.idproducto = p.idproducto
       WHERE f.fecha >= $1::date AND f.fecha < ($2::date + interval '1 day')`,
      [desde, hasta]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ─────────────────────────────────────────
   5. TOP PRODUCTOS por inventario
───────────────────────────────────────── */
router.get("/top-productos-rango", async (req, res) => {
  const { desde, hasta, tipo_inventario } = req.query;
  try {
    let query;
    let params;

    if (tipo_inventario) {
      query = `
        SELECT p.nombre,
               p.tipo_inventario,
               SUM(d.cantidad) AS total_vendido,
               COALESCE(SUM(d.subtotal), 0) AS total_generado,
               COALESCE(SUM((d.precio - p.costo) * d.cantidad), 0) AS ganancia
        FROM detalle_facturas d
        JOIN facturas f ON d.idfactura = f.idfactura
        JOIN productos p ON d.idproducto = p.idproducto
        WHERE f.fecha >= $1::date AND f.fecha < ($2::date + interval '1 day')
        AND p.tipo_inventario = $3
        GROUP BY p.nombre, p.tipo_inventario
        ORDER BY total_vendido DESC
        LIMIT 10`;
      params = [desde, hasta, tipo_inventario];
    } else {
      query = `
        SELECT p.nombre,
               p.tipo_inventario,
               SUM(d.cantidad) AS total_vendido,
               COALESCE(SUM(d.subtotal), 0) AS total_generado,
               COALESCE(SUM((d.precio - p.costo) * d.cantidad), 0) AS ganancia
        FROM detalle_facturas d
        JOIN facturas f ON d.idfactura = f.idfactura
        JOIN productos p ON d.idproducto = p.idproducto
        WHERE f.fecha >= $1::date AND f.fecha < ($2::date + interval '1 day')
        GROUP BY p.nombre, p.tipo_inventario
        ORDER BY total_vendido DESC
        LIMIT 10`;
      params = [desde, hasta];
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ─────────────────────────────────────────
   6. TOP CLIENTES
───────────────────────────────────────── */
router.get("/top-clientes", async (req, res) => {
  const { desde, hasta } = req.query;
  try {
    const result = await pool.query(
      `SELECT c.nombre,
              c.telefono,
              COUNT(f.idfactura) AS total_compras,
              COALESCE(SUM(f.total), 0) AS total_gastado,
              COUNT(CASE WHEN f.tipo_pago = 'credito' THEN 1 END) AS compras_credito
       FROM facturas f
       JOIN cliente c ON f.idcliente = c.idcliente
       WHERE f.fecha >= $1::date AND f.fecha < ($2::date + interval '1 day')
       GROUP BY c.nombre, c.telefono
       ORDER BY total_gastado DESC
       LIMIT 5`,
      [desde, hasta]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ─────────────────────────────────────────
   7. REPORTE DE CRÉDITOS
───────────────────────────────────────── */
router.get("/creditos", async (req, res) => {
  const { desde, hasta } = req.query;
  try {
    const result = await pool.query(
      `SELECT cr.estado,
              COUNT(*) AS cantidad,
              COALESCE(SUM(cr.total_deuda), 0) AS total_deuda,
              COALESCE(SUM(cr.total_pagado), 0) AS total_pagado,
              COALESCE(SUM(cr.saldo), 0) AS saldo_pendiente
       FROM creditos cr
       WHERE cr.fecha_creacion >= $1::date
         AND cr.fecha_creacion < ($2::date + interval '1 day')
       GROUP BY cr.estado`,
      [desde, hasta]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ─────────────────────────────────────────
   8. VENTAS POR PRODUCTO INDIVIDUAL
───────────────────────────────────────── */
router.get("/ventas-producto", async (req, res) => {
  const { idproducto, desde, hasta } = req.query;
  try {
    const result = await pool.query(
      `SELECT p.nombre,
              p.tipo_inventario,
              COALESCE(SUM(d.cantidad), 0) AS cantidad_vendida,
              COALESCE(SUM(d.subtotal), 0) AS total_generado,
              COALESCE(SUM((d.precio - p.costo) * d.cantidad), 0) AS ganancia
       FROM detalle_facturas d
       JOIN facturas f ON d.idfactura = f.idfactura
       JOIN productos p ON d.idproducto = p.idproducto
       WHERE d.idproducto = $1
         AND f.fecha >= $2::date
         AND f.fecha < ($3::date + interval '1 day')
       GROUP BY p.nombre, p.tipo_inventario`,
      [idproducto, desde, hasta]
    );
    res.json(result.rows[0] || null);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ─────────────────────────────────────────
   9. MOVIMIENTOS DE INVENTARIO
───────────────────────────────────────── */
router.get("/movimientos-detalle", async (req, res) => {
  const { desde, hasta } = req.query;
  try {
    const result = await pool.query(
      `SELECT p.nombre,
              p.tipo_inventario,
              m.tipo,
              SUM(m.cantidad) AS total
       FROM inventario_movimiento m
       JOIN productos p ON m.idproducto = p.idproducto
       WHERE m.fecha >= $1::date
         AND m.fecha < ($2::date + interval '1 day')
       GROUP BY p.nombre, p.tipo_inventario, m.tipo
       ORDER BY p.nombre`,
      [desde, hasta]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ─────────────────────────────────────────
   10. 🚨 STOCK BAJO (≤ 5 unidades)
───────────────────────────────────────── */
router.get("/stock-bajo", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.idproducto,
              p.codigo,
              p.nombre,
              p.stock,
              p.tipo_inventario,
              pr.nombre AS proveedor
       FROM productos p
       LEFT JOIN proveedores pr ON p.idproveedor = pr.idproveedor
       WHERE p.stock <= 5
       ORDER BY p.stock ASC, p.tipo_inventario ASC`
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ─────────────────────────────────────────
   11. STOCK ACTUAL
───────────────────────────────────────── */
router.get("/stock-actual", async (req, res) => {
  const { tipo_inventario } = req.query;
  try {
    let query;
    let params;

    if (tipo_inventario) {
      query = `
        SELECT p.codigo,
               p.nombre,
               p.stock,
               p.precio,
               p.costo,
               p.tipo_inventario,
               pr.nombre AS proveedor,
               (p.precio * p.stock) AS valor_inventario
        FROM productos p
        LEFT JOIN proveedores pr ON p.idproveedor = pr.idproveedor
        WHERE p.tipo_inventario = $1
        ORDER BY p.tipo_inventario, p.nombre`;
      params = [tipo_inventario];
    } else {
      query = `
        SELECT p.codigo,
               p.nombre,
               p.stock,
               p.precio,
               p.costo,
               p.tipo_inventario,
               pr.nombre AS proveedor,
               (p.precio * p.stock) AS valor_inventario
        FROM productos p
        LEFT JOIN proveedores pr ON p.idproveedor = pr.idproveedor
        ORDER BY p.tipo_inventario, p.nombre`;
      params = [];
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;