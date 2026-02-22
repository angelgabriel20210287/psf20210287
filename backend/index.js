require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pool = require("./db");

const productosRoutes = require("./routes/productos");
const ventasRoutes = require("./routes/ventas");
const clientesRoutes = require("./routes/clientes");
const historialRoutes = require("./routes/historial"); // ✅ NUEVO
const proveedoresRoutes = require("./routes/proveedores");
const inventarioRoutes = require("./routes/inventario");
const reportesRoutes = require("./routes/reportes");

const app = express();
app.use(cors());
app.use(express.json());

// 🔹 Ruta de prueba
app.get("/test", async (req, res) => {
  const result = await pool.query("SELECT NOW()");
  res.json(result.rows[0]);
});

// 🔹 Rutas principales
app.use("/productos", productosRoutes);
app.use("/ventas", ventasRoutes);
app.use("/clientes", clientesRoutes);
app.use("/historial", historialRoutes); // ✅ REGISTRADA
app.use("/proveedores", proveedoresRoutes);
app.use("/login", require("./routes/login"));
app.use("/inventario-movimientos", inventarioRoutes);
app.use("/reportes", reportesRoutes);

// 🔹 Servidor
app.listen(3001, () => {
  console.log("Servidor corriendo en http://localhost:3001");
});
