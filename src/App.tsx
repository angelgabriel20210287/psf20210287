import { Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import Login from "./pages/Login";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Productos from "./pages/Productos";
import Ventas from "./pages/Ventas";
import Inventario from "./pages/Inventario";
import Reportes from "./pages/Reportes";
import Historial from "./pages/Historial";
import Clientes from "./pages/Clientes";
import Proveedores from "./pages/Proveedores";
import InventarioMovimiento from "./pages/InventarioMovimiento";

function App() {
  const [autenticado, setAutenticado] = useState(
    localStorage.getItem("auth") === "true"
  );

  return (
    <Routes>
      {/* Si NO está autenticado → cualquier ruta va a login */}
      {!autenticado && (
        <>
          <Route
            path="/login"
            element={<Login setAutenticado={setAutenticado} />}
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </>
      )}

      {/* Si está autenticado → puede acceder al sistema */}
      {autenticado && (
        <>
          <Route path="/login" element={<Navigate to="/" replace />} />

          <Route element={<Layout setAutenticado={setAutenticado} />}>

            <Route path="/" element={<Home />} />
            <Route path="/productos" element={<Productos />} />
            <Route path="/proveedores" element={<Proveedores />} />
            <Route path="/ventas" element={<Ventas />} />
            <Route path="/inventario" element={<Inventario />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/historial" element={<Historial />} />
            <Route path="/reportes" element={<Reportes />} />
            <Route path="/movimientos" element={<InventarioMovimiento />} />
          </Route>
        </>
      )}
    </Routes>
  );
}

export default App;
