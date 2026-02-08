const express = require("express");
const router = express.Router();
const pool = require("../db");

// 🔹 LISTAR
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM cliente ORDER BY idcliente"
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🔹 CREAR
router.post("/", async (req, res) => {
  const { nombre, telefono, direccion } = req.body;
  try {
    await pool.query(
      "INSERT INTO cliente (nombre, telefono, direccion) VALUES ($1, $2, $3)",
      [nombre, telefono, direccion]
    );
    res.json({ message: "Cliente registrado" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🔹 EDITAR
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { nombre, telefono, direccion } = req.body;

  try {
    await pool.query(
      "UPDATE cliente SET nombre=$1, telefono=$2, direccion=$3 WHERE idcliente=$4",
      [nombre, telefono, direccion, id]
    );
    res.json({ message: "Cliente actualizado" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🔹 ELIMINAR
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query(
      "DELETE FROM cliente WHERE idcliente=$1",
      [id]
    );
    res.json({ message: "Cliente eliminado" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
