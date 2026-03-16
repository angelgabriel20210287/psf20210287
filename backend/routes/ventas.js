const express = require("express");
const router = express.Router();
const pool = require("../db");

// 🔹 REGISTRAR VENTA
router.post("/", async (req, res) => {
  // 1️⃣ Agregamos idcaja a los datos recibidos
  const { idcliente, total, pago, cambio, detalles, idcaja } = req.body;

  console.log("🔥 INSERTANDO FACTURA...");

  // Validación básica
  if (!detalles || !detalles.length) {
    return res.status(400).json({ error: "No hay productos en la venta" });
  }

  // Validación de caja
  if (!idcaja) {
    return res.status(400).json({ error: "No se puede registrar una venta sin una caja abierta." });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 2️⃣ Insertar factura incluyendo el idcaja
    const facturaRes = await client.query(
      `INSERT INTO facturas (idcliente, total, pago, cambio, idcaja)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING idfactura`,
      [idcliente || null, total, pago, cambio, idcaja]
    );

    const idfactura = facturaRes.rows[0].idfactura;

    // 3️⃣ Generar número de factura basado en el idfactura
    const numeroFactura = `F-${String(idfactura).padStart(6, "0")}`;

    await client.query(
      `UPDATE facturas
       SET numerofactura = $1
       WHERE idfactura = $2`,
      [numeroFactura, idfactura]
    );

    // 4️⃣ Insertar detalles y descontar stock
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

    console.log(`✅ Factura ${numeroFactura} registrada correctamente`);

    res.json({
      message: "Factura registrada correctamente",
      idfactura,
      numerofactura: numeroFactura,
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Error en venta:", error);
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
    console.error("❌ Error al eliminar factura:", error);
    res.status(500).json({ error: "Error al eliminar factura" });
  }
});

module.exports = router;