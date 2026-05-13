import { NavLink, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  FaHome, FaBox, FaTruck, FaShoppingCart,
  FaWarehouse, FaExchangeAlt, FaHistory,
  FaUsers, FaChartBar, FaCog, FaMoneyBillWave,
  FaCreditCard, FaSearch, FaChevronDown,
} from "react-icons/fa";
import "./Sidebar.css";

interface MenuItem {
  to: string;
  label: string;
  icon: React.ReactNode;
}

interface MenuGroup {
  id: string;
  label: string;
  emoji: string;
  items: MenuItem[];
}

const menuGroups: MenuGroup[] = [
  {
    id: "principal",
    label: "Principal",
    emoji: "🏠",
    items: [
      { to: "/",          label: "Inicio",    icon: <FaHome /> },
    ],
  },
  {
    id: "ventas",
    label: "Ventas",
    emoji: "💵",
    items: [
      { to: "/ventas",    label: "Ventas",    icon: <FaShoppingCart /> },
      { to: "/creditos",  label: "Créditos",  icon: <FaCreditCard /> },
      { to: "/caja",      label: "Caja",      icon: <FaMoneyBillWave /> },
      { to: "/Historial", label: "Historial", icon: <FaHistory /> },
    ],
  },
  {
    id: "inventario",
    label: "Inventario",
    emoji: "📦",
    items: [
      { to: "/productos",   label: "Productos",   icon: <FaBox /> },
      { to: "/inventario",  label: "Inventario",  icon: <FaWarehouse /> },
      { to: "/movimientos", label: "Movimientos", icon: <FaExchangeAlt /> },
      { to: "/proveedores", label: "Proveedores", icon: <FaTruck /> },
    ],
  },
  {
    id: "gestion",
    label: "Gestión",
    emoji: "👥",
    items: [
      { to: "/Clientes",  label: "Clientes",  icon: <FaUsers /> },
      { to: "/reportes",  label: "Reportes",  icon: <FaChartBar /> },
    ],
  },
  {
    id: "sistema",
    label: "Sistema",
    emoji: "⚙️",
    items: [
      { to: "/configuracion", label: "Configuración", icon: <FaCog /> },
    ],
  },
];

// Lista plana para la búsqueda
const todosLosItems: MenuItem[] = menuGroups.flatMap((g) => g.items);

const Sidebar = () => {
  const location = useLocation();
  const [busqueda, setBusqueda] = useState("");
  const [gruposAbiertos, setGruposAbiertos] = useState<Record<string, boolean>>({
    principal: true,
    ventas: true,
    inventario: true,
    gestion: true,
    sistema: true,
  });

  const toggleGrupo = (id: string) => {
    setGruposAbiertos((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Resultados de búsqueda
  const resultadosBusqueda = todosLosItems.filter((item) =>
    item.label.toLowerCase().includes(busqueda.toLowerCase())
  );

  const buscando = busqueda.trim().length > 0;

  return (
    <aside className="sb__sidebar">

      {/* Logo / Título */}
      <div className="sb__header">
        <span className="sb__logo-icon">🔧</span>
        <div className="sb__logo-text">
          <span className="sb__logo-title">Repuestos</span>
          <span className="sb__logo-sub">Ringo</span>
        </div>
      </div>

      {/* Buscador */}
      <div className="sb__search-container">
        <FaSearch className="sb__search-icon" />
        <input
          type="text"
          className="sb__search-input"
          placeholder="Buscar módulo..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        {busqueda && (
          <button className="sb__search-clear" onClick={() => setBusqueda("")}>
            ✕
          </button>
        )}
      </div>

      {/* MODO BÚSQUEDA */}
      {buscando && (
        <div className="sb__search-results">
          {resultadosBusqueda.length === 0 ? (
            <div className="sb__no-results">No se encontró nada</div>
          ) : (
            resultadosBusqueda.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  isActive ? "sb__item sb__item-active" : "sb__item"
                }
                onClick={() => setBusqueda("")}
              >
                <span className="sb__item-icon">{item.icon}</span>
                <span className="sb__item-label">{item.label}</span>
              </NavLink>
            ))
          )}
        </div>
      )}

      {/* MODO NORMAL — grupos */}
      {!buscando && (
        <nav className="sb__nav">
          {menuGroups.map((grupo) => {
            const abierto = gruposAbiertos[grupo.id];
            const tieneActivo = grupo.items.some(
              (item) => location.pathname === item.to ||
                (item.to !== "/" && location.pathname.startsWith(item.to))
            );

            return (
              <div key={grupo.id} className="sb__group">
                {/* Cabecera del grupo */}
                <button
                  className={`sb__group-header ${tieneActivo ? "sb__group-header-activo" : ""}`}
                  onClick={() => toggleGrupo(grupo.id)}
                >
                  <div className="sb__group-header-left">
                    <span className="sb__group-emoji">{grupo.emoji}</span>
                    <span className="sb__group-label">{grupo.label}</span>
                    {tieneActivo && <span className="sb__group-dot" />}
                  </div>
                  <FaChevronDown
                    className={`sb__group-chevron ${abierto ? "sb__chevron-abierto" : ""}`}
                  />
                </button>

                {/* Items del grupo */}
                <div className={`sb__group-items ${abierto ? "sb__group-items-abierto" : ""}`}>
                  {grupo.items.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.to === "/"}
                      className={({ isActive }) =>
                        isActive ? "sb__item sb__item-active" : "sb__item"
                      }
                    >
                      <span className="sb__item-icon">{item.icon}</span>
                      <span className="sb__item-label">{item.label}</span>
                    </NavLink>
                  ))}
                </div>
              </div>
            );
          })}
        </nav>
      )}

      {/* Pie del sidebar */}
      <div className="sb__footer">
        <span className="sb__footer-text">Repuestos Ringo v1.0</span>
      </div>
    </aside>
  );
};

export default Sidebar;