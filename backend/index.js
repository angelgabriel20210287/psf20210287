require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pool = require("./db");

const productosRoutes = require("./routes/productos");
const ventasRoutes = require("./routes/ventas");
const clientesRoutes = require("./routes/clientes");
const historialRoutes = require("./routes/historial");
const proveedoresRoutes = require("./routes/proveedores");
const inventarioRoutes = require("./routes/inventario");
const reportesRoutes = require("./routes/reportes");
const cajaRoutes = require("./routes/caja");

const app = express();

app.use(cors());

// 🔥 IMPORTANTE PARA IMÁGENES BASE64
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// 🔹 Ruta de prueba
app.get("/test", async (req, res) => {
  const result = await pool.query("SELECT NOW()");
  res.json(result.rows[0]);
});

// 🔹 Rutas principales
app.use("/productos", productosRoutes);
app.use("/ventas", ventasRoutes);
app.use("/clientes", clientesRoutes);
app.use("/historial", historialRoutes);
app.use("/proveedores", proveedoresRoutes);
app.use("/login", require("./routes/login"));
app.use("/inventario-movimientos", inventarioRoutes);
app.use("/reportes", reportesRoutes);
app.use("/empresa", require("./routes/empresa"));
app.use("/api/caja", cajaRoutes);

// 🔹 Servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});