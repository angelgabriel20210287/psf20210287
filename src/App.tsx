import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Productos from "./pages/Productos";
import Ventas from "./pages/Ventas";
import Inventario from "./pages/Inventario";
import Reportes from "./pages/Reportes";
import Historial from "./pages/Historial";
import Clientes from "./pages/Clientes";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/productos" element={<Productos />} />
        <Route path="/ventas" element={<Ventas />} />
        <Route path="/inventario" element={<Inventario />} />
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/historial" element={<Historial />} />
        <Route path="/reportes" element={<Reportes />} />
      </Route>
    </Routes>
  );
}

export default App;