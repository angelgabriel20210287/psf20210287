const express = require('express');
const router = express.Router();
const pool = require('../db');

// 🔹 Obtener todos los productos con nombre del proveedor (con filtro opcional por tipo)
router.get('/', async (req, res) => {
  const { tipo } = req.query; // ?tipo=nuevo o ?tipo=usado
  try {
    const result = await pool.query(`
      SELECT p.*, pr.nombre AS proveedor
      FROM productos p
      LEFT JOIN proveedores pr ON p.idproveedor = pr.idproveedor
      ${tipo ? "WHERE p.tipo_inventario = $1" : ""}
      ORDER BY p.idproducto
    `, tipo ? [tipo] : []);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🔹 Crear producto
router.post('/', async (req, res) => {
  const { codigo, nombre, stock, precio, costo, idproveedor, tipo_inventario } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO productos (codigo, nombre, stock, precio, costo, idproveedor, tipo_inventario)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [codigo, nombre, stock, precio, costo, idproveedor || null, tipo_inventario || 'nuevo']
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🔹 Editar producto
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { codigo, nombre, stock, precio, costo, idproveedor, tipo_inventario } = req.body;

  try {
    await pool.query(
      `UPDATE productos
       SET codigo=$1, nombre=$2, stock=$3, precio=$4, costo=$5, idproveedor=$6, tipo_inventario=$7
       WHERE idproducto=$8`,
      [codigo, nombre, stock, precio, costo, idproveedor || null, tipo_inventario || 'nuevo', id]
    );
    res.json({ message: 'Producto actualizado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🔹 Eliminar producto
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

// 🔹 CONTAR PRODUCTOS
router.get('/count', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT COUNT(*) FROM productos'
    );
    res.json({ total: result.rows[0].count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🔹 OBTENER EL SIGUIENTE CÓDIGO SUGERIDO
router.get('/next-code', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT codigo 
      FROM productos 
      WHERE codigo ~ '^[0-9]+$' 
      ORDER BY CAST(codigo AS INTEGER) DESC 
      LIMIT 1
    `);

    let siguienteCodigo = "01";

    if (result.rows.length > 0) {
      const ultimoCodigoNum = parseInt(result.rows[0].codigo);
      siguienteCodigo = String(ultimoCodigoNum + 1).padStart(2, '0');
    }

    res.json({ nextCode: siguienteCodigo });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;