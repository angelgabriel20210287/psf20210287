import { useEffect, useState } from "react";
import api from "../api/axios";
import "./Proveedores.css"; // reutilizamos el mismo estilo de clientes

interface Proveedor {
  idproveedor: number;
  nombre: string;
  telefono: string;
  email: string;
  direccion: string;
}

const Proveedores = () => {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [proveedorEditando, setProveedorEditando] = useState<Proveedor | null>(null);

  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [direccion, setDireccion] = useState("");

  // 🔹 Cargar proveedores
  const cargarProveedores = async () => {
    const res = await api.get("/proveedores");
    setProveedores(res.data);
  };

  useEffect(() => {
    cargarProveedores();
  }, []);

  // 🔹 Guardar proveedor
  const guardarProveedor = async () => {
    if (!nombre) {
      alert("El nombre es obligatorio");
      return;
    }

    if (proveedorEditando) {
      await api.put(`/proveedores/${proveedorEditando.idproveedor}`, {
        nombre,
        telefono,
        email,
        direccion,
      });
      setProveedorEditando(null);
    } else {
      await api.post("/proveedores", {
        nombre,
        telefono,
        email,
        direccion,
      });
    }

    limpiarFormulario();
    cargarProveedores();
  };

  // 🔹 Editar proveedor
  const editarProveedor = (p: Proveedor) => {
    setProveedorEditando(p);
    setNombre(p.nombre);
    setTelefono(p.telefono || "");
    setEmail(p.email || "");
    setDireccion(p.direccion || "");
  };

  // 🔹 Eliminar proveedor
  const eliminarProveedor = async (id: number) => {
    if (!window.confirm("¿Eliminar proveedor?")) return;
    await api.delete(`/proveedores/${id}`);
    cargarProveedores();
  };

  const limpiarFormulario = () => {
    setNombre("");
    setTelefono("");
    setEmail("");
    setDireccion("");
  };

  return (
    <div className="clientes-container">
      <h2>
        {proveedorEditando ? "Editar Proveedor" : "Registro de Proveedores"}
      </h2>

      <div className="form-clientes">
        <input
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />

        <input
          placeholder="Teléfono"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
        />

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          placeholder="Dirección"
          value={direccion}
          onChange={(e) => setDireccion(e.target.value)}
        />

        <button onClick={guardarProveedor}>
          {proveedorEditando ? "Actualizar" : "Guardar"}
        </button>

        {proveedorEditando && (
          <button
            onClick={() => {
              setProveedorEditando(null);
              limpiarFormulario();
            }}
          >
            Cancelar
          </button>
        )}
      </div>

      <h3>Proveedores registrados</h3>

      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Teléfono</th>
            <th>Email</th>
            <th>Dirección</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {proveedores.map((p) => (
            <tr key={p.idproveedor}>
              <td>{p.nombre}</td>
              <td>{p.telefono}</td>
              <td>{p.email}</td>
              <td>{p.direccion}</td>
              <td>
                <button onClick={() => editarProveedor(p)}>Editar</button>
                <button onClick={() => eliminarProveedor(p.idproveedor)}>
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Proveedores;
