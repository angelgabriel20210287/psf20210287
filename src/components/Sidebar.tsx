import { NavLink } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <NavLink to="/">Inicio</NavLink>
      <NavLink to="/productos">Productos</NavLink>
      <NavLink to="/ventas">Ventas</NavLink>
      <NavLink to="/inventario">Inventario</NavLink>
      <NavLink to="/Historial">Historial</NavLink>
      <NavLink to="/Clientes">Clientes</NavLink>
      <NavLink to="/reportes">Reportes</NavLink>
    </aside>
  );
};

export default Sidebar;
