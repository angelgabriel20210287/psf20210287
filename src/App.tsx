import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Productos from "./pages/Productos";
import Ventas from "./pages/Ventas";
import Inventario from "./pages/Inventario";
import Reportes from "./pages/Reportes";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/productos" element={<Productos />} />
          <Route path="/ventas" element={<Ventas />} />
          <Route path="/inventario" element={<Inventario />} />
          <Route path="/reportes" element={<Reportes />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
