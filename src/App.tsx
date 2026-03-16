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
import Configuracion from "./pages/Configuracion";
import Caja from "./pages/Caja";

function App() {
  const [autenticado, setAutenticado] = useState(
    !!localStorage.getItem("auth")
  );

  const usuario = JSON.parse(localStorage.getItem("auth") || "{}");

  return (
    <Routes>
      {/* 🔐 SI NO ESTÁ AUTENTICADO */}
      {!autenticado && (
        <>
          <Route
            path="/login"
            element={<Login setAutenticado={setAutenticado} />}
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </>
      )}

      {/* 🔓 SI ESTÁ AUTENTICADO */}
      {autenticado && (
        <>
          <Route path="/login" element={<Navigate to="/" replace />} />

          <Route element={<Layout setAutenticado={setAutenticado} />}>

            {/* TODOS LOS ROLES */}
            <Route path="/" element={<Home />} />

            {/* CAJERO, ADMINISTRADOR Y JEFE */}
            {(usuario.rol === "cajero" ||
              usuario.rol === "administrador" ||
              usuario.rol === "jefe") && (
              <>
                <Route path="/ventas" element={<Ventas />} />
                <Route path="/historial" element={<Historial />} />
                <Route path="/clientes" element={<Clientes />} />
                <Route path="/caja" element={<Caja />} />
              </>
            )}

            {/* ADMINISTRADOR Y JEFE */}
            {(usuario.rol === "administrador" ||
              usuario.rol === "jefe") && (
              <>
                <Route path="/productos" element={<Productos />} />
                <Route path="/proveedores" element={<Proveedores />} />
                <Route path="/inventario" element={<Inventario />} />
                <Route path="/movimientos" element={<InventarioMovimiento />} />
                
              </>
            )}

            {/* SOLO JEFE */}
            {usuario.rol === "jefe" && (
              <>
              <Route path="/configuracion" element={<Configuracion />} />
                <Route path="/reportes" element={<Reportes />} />
              </>
            )}

            {/* RUTA NO AUTORIZADA */}
            <Route path="*" element={<Navigate to="/" replace />} />

          </Route>
        </>
      )}
    </Routes>
  );
}

export default App;