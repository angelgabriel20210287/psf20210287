import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const Login = () => {
  const [usuario, setUsuario] = useState("");
  const [clave, setClave] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (usuario === "Angel" && clave === "1234") {
      localStorage.setItem("auth", "true");
      navigate("/");
    } else {
      setError("Usuario o contraseña incorrectos");
    }
  };

  return (
    <div className="login-container">
      <form className="login-box" onSubmit={handleLogin}>
        <h2>Iniciar sesión</h2>

        {error && <p className="error">{error}</p>}

        <input
          type="text"
          placeholder="Usuario"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={clave}
          onChange={(e) => setClave(e.target.value)}
        />

        <button type="submit">Entrar</button>
      </form>
    </div>
  );
};

export default Login;
