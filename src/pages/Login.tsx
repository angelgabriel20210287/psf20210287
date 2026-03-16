import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import logoDefault from "../assets/Logo.png";
import "./Login.css";

interface Props {
  setAutenticado: (valor: boolean) => void;
}

const Login = ({ setAutenticado }: Props) => {

  const [rol, setRol] = useState("cajero");
  const [usuario, setUsuario] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [empresa, setEmpresa] = useState<any>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const obtenerEmpresa = async () => {
      try {
        const res = await api.get("/empresa");
        setEmpresa(res.data);
      } catch (error) {
        console.error("Error obteniendo empresa:", error);
      }
    };

    obtenerEmpresa();
  }, []);

  const iniciarSesion = async () => {
    try {
      const res = await api.post("/login", {
        usuario,
        contraseña,
        rol
      });

      if (res.data.success) {
        localStorage.setItem("auth", JSON.stringify(res.data.usuario));
        setAutenticado(true);
        navigate("/");
      }
    } catch (error) {
      alert("Credenciales incorrectas para el rol seleccionado");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">

        <img
          src={empresa?.logo || logoDefault}
          alt={empresa?.nombre || "Empresa"}
          className="login-logo"
        />

        <h2>{empresa?.nombre || "Repuestos Ringo"}</h2>

        <select
          value={rol}
          onChange={(e) => setRol(e.target.value)}
        >
          <option value="cajero">Cajero</option>
          <option value="administrador">Administrador</option>
          <option value="jefe">Jefe</option>
        </select>

        <input
          type="text"
          placeholder="Usuario"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={contraseña}
          onChange={(e) => setContraseña(e.target.value)}
        />

        <button onClick={iniciarSesion}>Entrar</button>

      </div>
    </div>
  );
};

export default Login;