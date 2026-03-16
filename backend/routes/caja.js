const express = require("express");
const router = express.Router();
const pool = require("../db");

// 🔹 Obtener caja abierta
router.get("/actual", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM caja WHERE estado='abierta' LIMIT 1"
    );

    if (result.rows.length === 0) {
      return res.json(null);
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error obteniendo caja" });
  }
});


// 🔹 Abrir caja
router.post("/abrir", async (req, res) => {
  const { usuario, monto_inicial } = req.body;

  try {
    const existe = await pool.query(
      "SELECT * FROM caja WHERE estado='abierta'"
    );

    if (existe.rows.length > 0) {
      return res.status(400).json({
        message: "Ya existe una caja abierta"
      });
    }

    const result = await pool.query(
      `INSERT INTO caja (usuario, monto_inicial, estado)
       VALUES ($1,$2,'abierta')
       RETURNING *`,
      [usuario, monto_inicial]
    );

    res.json(result.rows[0]);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al abrir caja"
    });
  }
});


// 🔹 Cerrar caja
router.post("/cerrar", async (req, res) => {
  const { idcaja, monto_final, usuario_cierre } = req.body; // 🔥 Agregamos usuario_cierre

  try {
    // 1️⃣ Calcular total de ventas reales vinculadas a esta caja
    const ventas = await pool.query(
      `SELECT COALESCE(SUM(total),0) AS total
       FROM facturas
       WHERE idcaja=$1`,
      [idcaja]
    );

    const totalventas = ventas.rows[0].total;

    // 2️⃣ Actualizar la caja con fecha, monto final y el usuario que cierra
    await pool.query(
      `UPDATE caja
       SET fecha_cierre = NOW(),
       monto_final = $1,
       estado='cerrada',
       usuario = $2
       WHERE idcaja=$3`,
      [monto_final, usuario_cierre, idcaja]
    );

    res.json({
      totalventas,
      message: "Caja cerrada correctamente"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error cerrando caja"
    });
  }
});

// 🔹 Obtener historial de cajas cerradas
router.get("/historial", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM caja WHERE estado='cerrada' ORDER BY fecha_apertura DESC LIMIT 50"
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error obteniendo historial de caja" });
  }
});

module.exports = router;