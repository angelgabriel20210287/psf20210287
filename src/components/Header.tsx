import { useNavigate } from "react-router-dom";
import "./Header.css";

interface Props {
  setAutenticado: (valor: boolean) => void;
}

const Header = ({ setAutenticado }: Props) => {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("auth");
    setAutenticado(false);
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
