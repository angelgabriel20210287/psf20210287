const express = require("express");
const router = express.Router();
const pool = require("../db");

// 🔹 REGISTRAR VENTA
router.post("/", async (req, res) => {
  const { idcliente, total, pago, cambio, detalles } = req.body;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1️⃣ Insertar factura
    const facturaRes = await client.query(
      `INSERT INTO facturas (idcliente, total, pago, cambio)
       VALUES ($1, $2, $3, $4)
       RETURNING idfactura`,
      [idcliente, total, pago, cambio]
    );

    const idfactura = facturaRes.rows[0].idfactura;

    // 2️⃣ Insertar detalles y descontar stock
    for (const item of detalles) {
      const subtotal = item.cantidad * item.precio;

      await client.query(
        `INSERT INTO detalle_facturas
         (idfactura, idproducto, cantidad, precio, subtotal)
         VALUES ($1, $2, $3, $4, $5)`,
        [idfactura, item.idproducto, item.cantidad, item.precio, subtotal]
      );

      await client.query(
        `UPDATE productos
         SET stock = stock - $1
         WHERE idproducto = $2`,
        [item.cantidad, item.idproducto]
      );
    }

    await client.query("COMMIT");
    res.json({ message: "Factura registrada correctamente" });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    res.status(500).json({ error: "Error al registrar factura" });
  } finally {
    client.release();
  }
});

// 🔹 ELIMINAR FACTURA
router.delete("/:idfactura", async (req, res) => {
  const { idfactura } = req.params;

  try {
    await pool.query(
      "DELETE FROM detalle_facturas WHERE idfactura = $1",
      [idfactura]
    );

    await pool.query(
      "DELETE FROM facturas WHERE idfactura = $1",
      [idfactura]
    );

    res.json({ message: "Factura eliminada correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar factura" });
  }
});

module.exports = router;
