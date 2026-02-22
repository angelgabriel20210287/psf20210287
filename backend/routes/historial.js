const express = require("express");
const router = express.Router();
const pool = require("../db");

// 🔹 LISTAR FACTURAS
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        f.idfactura,
        f.numerofactura,
        f.fecha,
        f.total,
        COALESCE(c.nombre, 'Consumidor Final') AS cliente
      FROM facturas f
      LEFT JOIN cliente c ON f.idcliente = c.idcliente
      ORDER BY f.fecha DESC
    `);

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🔹 FACTURA COMPLETA (PARA REIMPRESIÓN)
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // 🧾 Cabecera
    const facturaRes = await pool.query(`
      SELECT 
        f.idfactura,
        f.fecha,
        f.total,
        f.pago,
        f.cambio,
        COALESCE(c.nombre, 'Consumidor Final') AS nombre,
        c.telefono,
        c.direccion
      FROM facturas f
      LEFT JOIN cliente c ON f.idcliente = c.idcliente
      WHERE f.idfactura = $1
    `, [id]);

    // 📦 Detalles
    const detallesRes = await pool.query(`
      SELECT 
        p.nombre,
        d.cantidad,
        d.precio,
        d.subtotal
      FROM detalle_facturas d
      JOIN productos p ON p.idproducto = d.idproducto
      WHERE d.idfactura = $1
    `, [id]);

    const factura = facturaRes.rows[0];

    res.json({
      fecha: factura.fecha,
      total: factura.total,
      pago: factura.pago,
      cambio: factura.cambio,
      cliente: {
        nombre: factura.nombre,
        telefono: factura.telefono,
        direccion: factura.direccion
      },
      detalles: detallesRes.rows
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// 🔹 ELIMINAR FACTURA
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // eliminar detalles primero
    await client.query(
      "DELETE FROM detalle_facturas WHERE idfactura = $1",
      [id]
    );

    // eliminar factura
    await client.query(
      "DELETE FROM facturas WHERE idfactura = $1",
      [id]
    );

    await client.query("COMMIT");
    res.json({ message: "Factura eliminada correctamente" });

  } catch (error) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});


module.exports = router;
