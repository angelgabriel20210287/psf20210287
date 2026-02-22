import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "./Login.css";


interface Props {
  setAutenticado: (valor: boolean) => void;
}

const Login = ({ setAutenticado }: Props) => {
  const [usuario, setUsuario] = useState("");
  const [contraseña, setContraseña] = useState("");
  const navigate = useNavigate();

  const iniciarSesion = async () => {
    try {
      const res = await api.post("/login", {
        usuario,
        contraseña,
      });

      if (res.data.success) {
        localStorage.setItem("auth", "true");
        setAutenticado(true);
        navigate("/");
      }
    } catch (error) {
      alert("Usuario o contraseña incorrectos");
    }
  };

 return (
  <div className="login-container">
    <div className="login-box">
      <h2>Iniciar Sesión</h2>

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
