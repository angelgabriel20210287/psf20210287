const express = require("express");
const router = express.Router();
const pool = require("../db");

// 🔹 REGISTRAR VENTA
router.post("/", async (req, res) => {
  const { idcliente, total, pago, cambio, detalles, idcaja, tipo_pago } = req.body;

  console.log("🔥 INSERTANDO FACTURA...");

  if (!detalles || !detalles.length) {
    return res.status(400).json({ error: "No hay productos en la venta" });
  }

  if (!idcaja) {
    return res.status(400).json({ error: "No se puede registrar una venta sin una caja abierta." });
  }

  // Validar que si es crédito tenga cliente
  if (tipo_pago === "credito" && !idcliente) {
    return res.status(400).json({ error: "Las ventas a crédito requieren un cliente registrado." });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Insertar factura con tipo_pago
    const facturaRes = await client.query(
      `INSERT INTO facturas (idcliente, total, pago, cambio, idcaja, tipo_pago)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING idfactura`,
      [
        idcliente || null,
        total,
        tipo_pago === "credito" ? 0 : pago,
        tipo_pago === "credito" ? 0 : cambio,
        idcaja,
        tipo_pago || "contado",
      ]
    );

    const idfactura = facturaRes.rows[0].idfactura;

    // Generar número de factura
    const numeroFactura = `F-${String(idfactura).padStart(6, "0")}`;

    await client.query(
      `UPDATE facturas SET numerofactura = $1 WHERE idfactura = $2`,
      [numeroFactura, idfactura]
    );

    // Insertar detalles y descontar stock
    for (const item of detalles) {
      const subtotal = item.cantidad * item.precio;

      await client.query(
        `INSERT INTO detalle_facturas (idfactura, idproducto, cantidad, precio, subtotal)
         VALUES ($1, $2, $3, $4, $5)`,
        [idfactura, item.idproducto, item.cantidad, item.precio, subtotal]
      );

      await client.query(
        `UPDATE productos SET stock = stock - $1 WHERE idproducto = $2`,
        [item.cantidad, item.idproducto]
      );
    }

    // Si es crédito, crear registro en tabla creditos
    if (tipo_pago === "credito") {
      await client.query(
        `INSERT INTO creditos (idfactura, idcliente, total_deuda, total_pagado, saldo, estado)
         VALUES ($1, $2, $3, 0, $3, 'pendiente')`,
        [idfactura, idcliente, total]
      );
    }

    await client.query("COMMIT");

    console.log(`✅ Factura ${numeroFactura} registrada como ${tipo_pago || "contado"}`);

    res.json({
      message: "Factura registrada correctamente",
      idfactura,
      numerofactura: numeroFactura,
      tipo_pago: tipo_pago || "contado",
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Error en venta:", error);
    res.status(500).json({ error: error.message || "Error al registrar factura" });
  } finally {
    client.release();
  }
});

// 🔹 ELIMINAR FACTURA
router.delete("/:idfactura", async (req, res) => {
  const { idfactura } = req.params;

  try {
    await pool.query("DELETE FROM detalle_facturas WHERE idfactura = $1", [idfactura]);
    await pool.query("DELETE FROM facturas WHERE idfactura = $1", [idfactura]);
    res.json({ message: "Factura eliminada correctamente" });
  } catch (error) {
    console.error("❌ Error al eliminar factura:", error);
    res.status(500).json({ error: "Error al eliminar factura" });
  }
});

module.exports = router;