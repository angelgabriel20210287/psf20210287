import { useEffect, useState } from "react";
import api from "../api/axios";
import "./Configuracion.css";

const Configuracion = () => {

  const [nombre, setNombre] = useState("");
  const [logo, setLogo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [correo, setCorreo] = useState("");
  const [propietario, setPropietario] = useState("");

  useEffect(() => {
    obtenerEmpresa();
  }, []);

  const obtenerEmpresa = async () => {
    const res = await api.get("/empresa");

    setNombre(res.data?.nombre || "");
    setLogo(res.data?.logo || "");
    setTelefono(res.data?.telefono || "");
    setCorreo(res.data?.correo || "");
    setPropietario(res.data?.propietario || "");
  };

  const manejarImagen = (e: any) => {
    const archivo = e.target.files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      setLogo(reader.result as string);
    };

    if (archivo) {
      reader.readAsDataURL(archivo);
    }
  };

  const guardarCambios = async () => {
    await api.put("/empresa", {
      nombre,
      logo,
      telefono,
      correo,
      propietario
    });

    alert("Datos actualizados correctamente");

    // 🔥 Recargar datos actualizados en lugar de dejar vacío
    obtenerEmpresa();
  };

  return (
    <div className="config-container">

      <h2>⚙ Configuración de Empresa</h2>

      <label>Nombre Empresa</label>
      <input value={nombre} onChange={(e) => setNombre(e.target.value)} />

      <label>Logo</label>
      <input type="file" accept="image/*" onChange={manejarImagen} />

      <label>Nombre del Propietario</label>
      <input value={propietario} onChange={(e) => setPropietario(e.target.value)} />

      <label>Teléfono del Propietario</label>
      <input value={telefono} onChange={(e) => setTelefono(e.target.value)} />

      <label>Correo del Propietario</label>
      <input value={correo} onChange={(e) => setCorreo(e.target.value)} />

      <button type="button" onClick={guardarCambios}>
  Guardar Cambios
</button>

<hr />

<div className="about-section">
  <h3>📌 Información del Sistema</h3>

  <p>
    Sistema de Facturación desarrollado para la gestión eficiente
    de ventas e inventario.
  </p>

  <p>
    👨‍💻 Desarrollado por: <strong>Angel Gabriel Jimenez Moya</strong>
  </p>

  <p>
    📞 Teléfono: 829-320-5730
  </p>

  <p>
    📧 Correo: angeljimenes634@gmail.com
  </p>
</div>

    </div>
  );
};

export default Configuracion;