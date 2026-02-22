const express = require('express');
const router = express.Router();
const pool = require('../db');

// Obtener proveedores
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM proveedores ORDER BY idproveedor'
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear proveedor
router.post('/', async (req, res) => {
  const { nombre, telefono, email, direccion } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO proveedores (nombre, telefono, email, direccion)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [nombre, telefono, email, direccion]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Eliminar proveedor
router.delete('/:id', async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM proveedores WHERE idproveedor=$1',
      [req.params.id]
    );
    res.json({ message: 'Proveedor eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
 
// Editar proveedor
router.put('/:id', async (req, res) => {
  const { nombre, telefono, email, direccion } = req.body;

  await pool.query(
    `UPDATE proveedores
     SET nombre=$1, telefono=$2, email=$3, direccion=$4
     WHERE idproveedor=$5`,
    [nombre, telefono, email, direccion, req.params.id]
  );

  res.json({ message: "Proveedor actualizado" });
});

module.exports = router;
