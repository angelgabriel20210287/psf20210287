const express = require("express");
const router = express.Router();
const pool = require("../db");

router.post("/", async (req, res) => {
  const { usuario, contraseña } = req.body;

  try {
    const result = await pool.query(
      "SELECT * FROM usuario WHERE usuario = $1 AND contraseña = $2",
      [usuario, contraseña]
    );

    if (result.rows.length > 0) {
      res.json({ success: true });
    } else {
      res.status(401).json({ success: false });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
