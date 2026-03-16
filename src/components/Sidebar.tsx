import { NavLink } from "react-router-dom";
import {
  FaHome,
  FaBox,
  FaTruck,
  FaShoppingCart,
  FaWarehouse,
  FaExchangeAlt,
  FaHistory,
  FaUsers,
  FaChartBar
} from "react-icons/fa";
import "./Sidebar.css";

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <NavLink to="/">
        <FaHome className="icon" />
        Inicio
      </NavLink>

      <NavLink to="/productos">
        <FaBox className="icon" />
        Productos
      </NavLink>

      <NavLink to="/proveedores">
        <FaTruck className="icon" />
        Proveedores
      </NavLink>

      <NavLink to="/ventas">
        <FaShoppingCart className="icon" />
        Ventas
      </NavLink>

     <NavLink to="/caja">
  💰 Caja
     </NavLink>

      <NavLink to="/inventario">
        <FaWarehouse className="icon" />
        Inventario
      </NavLink>

      <NavLink to="/movimientos">
        <FaExchangeAlt className="icon" />
        Movimientos
      </NavLink>

      <NavLink to="/Historial">
        <FaHistory className="icon" />
        Historial
      </NavLink>

      <NavLink to="/Clientes">
        <FaUsers className="icon" />
        Clientes
      </NavLink>

      <NavLink to="/reportes">
        <FaChartBar className="icon" />
        Reportes
      </NavLink>

      <NavLink to="/configuracion">
  ⚙ Configuración
      </NavLink>
    </aside>
  );
};

export default Sidebar;