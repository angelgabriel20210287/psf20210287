import { useNavigate } from "react-router-dom";
import "./Header.css";

const Header = () => {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("auth");
    navigate("/login");
  };

  return (
    <header className="header">
      <h1>Sistema de Facturación</h1>
      <div>
        <span>Administrador</span>
        <button onClick={logout}>Cerrar sesión</button>
      </div>
    </header>
  );
};

export default Header;
