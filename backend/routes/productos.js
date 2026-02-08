const express = require('express');
const router = express.Router();
const pool = require('../db');

// Obtener todos los productos
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM productos ORDER BY idproducto'
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear producto
router.post('/', async (req, res) => {
  const { codigo, nombre, stock, precio, costo } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO productos (codigo, nombre, stock, precio, costo)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [codigo, nombre, stock, precio, costo]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Editar producto
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { codigo, nombre, stock, precio, costo } = req.body;

  try {
    await pool.query(
      `UPDATE productos
       SET codigo=$1, nombre=$2, stock=$3, precio=$4, costo=$5
       WHERE idproducto=$6`,
      [codigo, nombre, stock, precio, costo, id]
    );
    res.json({ message: 'Producto actualizado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Eliminar producto
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query(
      'DELETE FROM productos WHERE idproducto=$1',
      [id]
    );
    res.json({ message: 'Producto eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
