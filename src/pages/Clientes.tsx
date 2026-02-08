import { useEffect, useState } from "react";
import api from "../api/axios";
import "./Clientes.css";

interface Cliente {
  idcliente: number;
  nombre: string;
  telefono: string;
  direccion: string;
}

const Clientes = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteEditando, setClienteEditando] = useState<Cliente | null>(null);

  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");

  // 🔹 Cargar clientes
  const cargarClientes = async () => {
    const res = await api.get("/clientes");
    setClientes(res.data);
  };

  useEffect(() => {
    cargarClientes();
  }, []);

  // 🔹 Guardar cliente
  const guardarCliente = async () => {
    if (!nombre || !telefono || !direccion) {
      alert("Complete todos los campos");
      return;
    }

    if (clienteEditando) {
      await api.put(`/clientes/${clienteEditando.idcliente}`, {
        nombre,
        telefono,
        direccion,
      });
      setClienteEditando(null);
    } else {
      await api.post("/clientes", {
        nombre,
        telefono,
        direccion,
      });
    }

    limpiarFormulario();
    cargarClientes();
  };

  // 🔹 Editar
  const editarCliente = (c: Cliente) => {
    setClienteEditando(c);
    setNombre(c.nombre);
    setTelefono(c.telefono);
    setDireccion(c.direccion);
  };

  // 🔹 Eliminar
  const eliminarCliente = async (id: number) => {
    if (!confirm("¿Eliminar cliente?")) return;
    await api.delete(`/clientes/${id}`);
    cargarClientes();
  };

  const limpiarFormulario = () => {
    setNombre("");
    setTelefono("");
    setDireccion("");
  };

  return (
    <div className="clientes-container">
      <h2>{clienteEditando ? "Editar Cliente" : "Registro de Clientes"}</h2>

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
          placeholder="Dirección"
          value={direccion}
          onChange={(e) => setDireccion(e.target.value)}
        />

        <button onClick={guardarCliente}>
          {clienteEditando ? "Actualizar" : "Guardar"}
        </button>

        {clienteEditando && (
          <button onClick={() => {
            setClienteEditando(null);
            limpiarFormulario();
          }}>
            Cancelar
          </button>
        )}
      </div>

      <h3>Clientes registrados</h3>

      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Teléfono</th>
            <th>Dirección</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map((c) => (
            <tr key={c.idcliente}>
              <td>{c.nombre}</td>
              <td>{c.telefono}</td>
              <td>{c.direccion}</td>
              <td>
                <button onClick={() => editarCliente(c)}>Editar</button>
                <button onClick={() => eliminarCliente(c.idcliente)}>
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

export default Clientes;
