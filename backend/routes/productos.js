const express = require('express');
const router = express.Router();
const pool = require('../db');

// 🔹 Obtener todos los productos con nombre del proveedor
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, pr.nombre AS proveedor
      FROM productos p
      LEFT JOIN proveedores pr ON p.idproveedor = pr.idproveedor
      ORDER BY p.idproducto
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🔹 Crear producto
router.post('/', async (req, res) => {
  const { codigo, nombre, stock, precio, costo, idproveedor } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO productos (codigo, nombre, stock, precio, costo, idproveedor)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [codigo, nombre, stock, precio, costo, idproveedor || null]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🔹 Editar producto
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { codigo, nombre, stock, precio, costo, idproveedor } = req.body;

  try {
    await pool.query(
      `UPDATE productos
       SET codigo=$1, nombre=$2, stock=$3, precio=$4, costo=$5, idproveedor=$6
       WHERE idproducto=$7`,
      [codigo, nombre, stock, precio, costo, idproveedor || null, id]
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
    // Buscamos el código que tenga el valor numérico más alto
    // Usamos regex para asegurar que solo evaluamos códigos que sean números
    const result = await pool.query(`
      SELECT codigo 
      FROM productos 
      WHERE codigo ~ '^[0-9]+$' 
      ORDER BY CAST(codigo AS INTEGER) DESC 
      LIMIT 1
    `);

    let siguienteCodigo = "01"; // Por defecto si no hay productos

    if (result.rows.length > 0) {
      const ultimoCodigoNum = parseInt(result.rows[0].codigo);
      // Sumamos 1 y formateamos a 2 dígitos (ej: 09 -> 10)
      siguienteCodigo = String(ultimoCodigoNum + 1).padStart(2, '0');
    }

    res.json({ nextCode: siguienteCodigo });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
