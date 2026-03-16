const express = require("express");
const router = express.Router();
const pool = require("../db");

// 🔹 Obtener datos
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM empresa LIMIT 1");
    res.json(result.rows[0] || null);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🔹 Crear o actualizar
router.put("/", async (req, res) => {
  const { nombre, logo, telefono, correo, propietario } = req.body;

  try {
    const existe = await pool.query("SELECT * FROM empresa LIMIT 1");

    if (existe.rows.length === 0) {
      // 🔥 Si no existe, INSERTAR
      await pool.query(
        `INSERT INTO empresa 
        (nombre, logo, telefono, correo, propietario)
        VALUES ($1,$2,$3,$4,$5)`,
        [nombre, logo, telefono, correo, propietario]
      );
    } else {
      // 🔥 Si existe, ACTUALIZAR
      await pool.query(
        `UPDATE empresa SET
          nombre=$1,
          logo=$2,
          telefono=$3,
          correo=$4,
          propietario=$5
         WHERE idempresa=$6`,
        [
          nombre,
          logo,
          telefono,
          correo,
          propietario,
          existe.rows[0].idempresa
        ]
      );
    }

    res.json({ success: true });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;