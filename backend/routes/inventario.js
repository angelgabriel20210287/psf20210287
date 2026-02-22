const express = require("express");
const router = express.Router();
const pool = require("../db");

// 🔹 Registrar movimiento
router.post("/", async (req, res) => {
  const { tipo, cantidad, motivo, idproducto } = req.body;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Verificar stock actual
    const productoRes = await client.query(
      "SELECT stock FROM productos WHERE idproducto = $1",
      [idproducto]
    );

    if (productoRes.rows.length === 0) {
      throw new Error("Producto no existe");
    }

    const stockActual = productoRes.rows[0].stock;

    if (tipo === "SALIDA" && stockActual < cantidad) {
      throw new Error("Stock insuficiente");
    }

    // Insertar movimiento
    await client.query(
      `INSERT INTO inventario_movimiento
       (tipo, cantidad, motivo, idproducto)
       VALUES ($1, $2, $3, $4)`,
      [tipo, cantidad, motivo, idproducto]
    );

    // Actualizar stock
    if (tipo === "ENTRADA") {
      await client.query(
        "UPDATE productos SET stock = stock + $1 WHERE idproducto = $2",
        [cantidad, idproducto]
      );
    } else {
      await client.query(
        "UPDATE productos SET stock = stock - $1 WHERE idproducto = $2",
        [cantidad, idproducto]
      );
    }

    await client.query("COMMIT");
    res.json({ message: "Movimiento registrado correctamente" });

  } catch (error) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// 🔹 Obtener movimientos
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT m.*, p.nombre AS producto
      FROM inventario_movimiento m
      JOIN productos p ON m.idproducto = p.idproducto
      ORDER BY m.fecha DESC
    `);

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;