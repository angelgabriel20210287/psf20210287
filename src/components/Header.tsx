import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Header.css";

interface Props {
  setAutenticado: (valor: boolean) => void;
}

interface Usuario {
  nombre: string;
  rol: string;
}

const Header = ({ setAutenticado }: Props) => {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  useEffect(() => {
    const data = localStorage.getItem("auth");
    if (data) {
      setUsuario(JSON.parse(data));
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("auth");
    setAutenticado(false);
    navigate("/login");
  };

  return (
    <header className="header">
      <h1>Sistema de Facturación</h1>
      <div>
        <span>{usuario?.rol?.toUpperCase()}</span>
        <button onClick={logout}>Cerrar sesión</button>
      </div>
    </header>
  );
};

export default Header;