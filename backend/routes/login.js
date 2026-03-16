const express = require("express");
const router = express.Router();
const pool = require("../db");

router.post("/", async (req, res) => {
  const { usuario, contraseña, rol } = req.body;

  try {
    const result = await pool.query(
      "SELECT idusuario, usuario, nombre, rol FROM usuario WHERE usuario = $1 AND contraseña = $2 AND rol = $3",
      [usuario, contraseña, rol]
    );

    if (result.rows.length > 0) {
      const user = result.rows[0];

      res.json({
        success: true,
        usuario: {
          id: user.idusuario,
          nombre: user.nombre,
          usuario: user.usuario,
          rol: user.rol
        }
      });
    } else {
      res.status(401).json({ success: false });
    }

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;