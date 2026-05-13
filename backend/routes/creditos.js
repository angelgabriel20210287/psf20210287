const express = require("express");
const router = express.Router();
const pool = require("../db");

// 🔹 OBTENER TODOS LOS CRÉDITOS
router.get("/", async (req, res) => {
  const { estado } = req.query;
  try {
    const result = await pool.query(`
      SELECT 
        cr.idcredito,
        cr.idfactura,
        cr.total_deuda,
        cr.total_pagado,
        cr.saldo,
        cr.estado,
        cr.fecha_creacion,
        f.numerofactura,
        COALESCE(c.nombre, 'Consumidor Final') AS cliente,
        c.telefono
      FROM creditos cr
      JOIN facturas f ON cr.idfactura = f.idfactura
      LEFT JOIN cliente c ON cr.idcliente = c.idcliente
      ${estado && estado !== "todos" ? "WHERE cr.estado = $1" : ""}
      ORDER BY cr.fecha_creacion DESC
    `, estado && estado !== "todos" ? [estado] : []);

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🔹 OBTENER ABONOS DE UN CRÉDITO
router.get("/:id/abonos", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`
      SELECT * FROM abonos
      WHERE idcredito = $1
      ORDER BY fecha ASC
    `, [id]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🔹 OBTENER COMPROBANTE DE CUENTA SALDADA
router.get("/:id/comprobante", async (req, res) => {
  const { id } = req.params;
  try {
    // Datos del crédito
    const creditoRes = await pool.query(`
      SELECT 
        cr.*,
        f.numerofactura,
        f.fecha AS fecha_venta,
        COALESCE(c.nombre, 'Consumidor Final') AS cliente,
        c.telefono
      FROM creditos cr
      JOIN facturas f ON cr.idfactura = f.idfactura
      LEFT JOIN cliente c ON cr.idcliente = c.idcliente
      WHERE cr.idcredito = $1
    `, [id]);

    if (creditoRes.rows.length === 0) {
      return res.status(404).json({ error: "Crédito no encontrado" });
    }

    // Abonos realizados
    const abonosRes = await pool.query(`
      SELECT * FROM abonos WHERE idcredito = $1 ORDER BY fecha ASC
    `, [id]);

    // Productos de la factura original
    const detallesRes = await pool.query(`
      SELECT p.nombre, d.cantidad, d.precio, d.subtotal
      FROM detalle_facturas d
      JOIN productos p ON p.idproducto = d.idproducto
      WHERE d.idfactura = $1
    `, [creditoRes.rows[0].idfactura]);

    const credito = creditoRes.rows[0];

    res.json({
      tipo: "comprobante_saldado",
      numerofactura: credito.numerofactura,
      cliente: {
        nombre: credito.cliente,
        telefono: credito.telefono,
      },
      total_deuda: credito.total_deuda,
      total_pagado: credito.total_pagado,
      saldo: credito.saldo,
      fecha_venta: credito.fecha_venta,
      fecha_saldado: abonosRes.rows[abonosRes.rows.length - 1]?.fecha || new Date(),
      abonos: abonosRes.rows,
      detalles: detallesRes.rows,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🔹 REGISTRAR ABONO
router.post("/:id/abonos", async (req, res) => {
  const { id } = req.params;
  const { monto, nota } = req.body;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const creditoRes = await client.query(
      "SELECT * FROM creditos WHERE idcredito = $1",
      [id]
    );

    if (creditoRes.rows.length === 0) throw new Error("Crédito no encontrado");

    const credito = creditoRes.rows[0];

    if (credito.estado === "pagado") throw new Error("Este crédito ya está pagado");

    const montoNum = Number(monto);

    if (montoNum <= 0) throw new Error("El monto del abono debe ser mayor a 0");
    if (montoNum > Number(credito.saldo)) throw new Error("El abono supera el saldo pendiente");

    // Insertar abono
    await client.query(
      `INSERT INTO abonos (idcredito, monto, nota) VALUES ($1, $2, $3)`,
      [id, montoNum, nota || null]
    );

    // Actualizar crédito
    const nuevoTotalPagado = Number(credito.total_pagado) + montoNum;
    const nuevoSaldo = Number(credito.total_deuda) - nuevoTotalPagado;
    const nuevoEstado = nuevoSaldo <= 0 ? "pagado" : "pendiente";

    await client.query(
      `UPDATE creditos SET total_pagado = $1, saldo = $2, estado = $3 WHERE idcredito = $4`,
      [nuevoTotalPagado, nuevoSaldo <= 0 ? 0 : nuevoSaldo, nuevoEstado, id]
    );

    await client.query("COMMIT");

    res.json({
      message: nuevoEstado === "pagado"
        ? "✅ Crédito pagado completamente"
        : "✅ Abono registrado correctamente",
      estado: nuevoEstado,
      saldo: nuevoSaldo <= 0 ? 0 : nuevoSaldo,
      idcredito: id, // ← para que el frontend pueda pedir el comprobante
    });

  } catch (error) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

module.exports = router;