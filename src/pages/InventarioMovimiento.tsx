import { useEffect, useState } from "react";
import api from "../api/axios";
import "./InventarioMovimiento.css";

interface Producto {
  idproducto: number;
  nombre: string;
}

interface Movimiento {
  idmovimiento: number;
  fecha: string;
  tipo: string;
  cantidad: number;
  motivo: string;
  producto: string;
}

const InventarioMovimiento = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [tipo, setTipo] = useState("ENTRADA");
  const [cantidad, setCantidad] = useState("");
  const [motivo, setMotivo] = useState("");
  const [idproducto, setIdproducto] = useState("");

  const cargarProductos = async () => {
    const res = await api.get("/productos");
    setProductos(res.data);
  };

  const cargarMovimientos = async () => {
    const res = await api.get("/inventario-movimientos");
    setMovimientos(res.data);
  };

  useEffect(() => {
    cargarProductos();
    cargarMovimientos();
  }, []);

  const registrarMovimiento = async (e: React.FormEvent) => {
    e.preventDefault();

    await api.post("/inventario-movimientos", {
      tipo,
      cantidad: Number(cantidad),
      motivo,
      idproducto: Number(idproducto),
    });

    setCantidad("");
    setMotivo("");
    setIdproducto("");

    cargarMovimientos();
  };

  return (
    <div>
      <h2>Movimientos de Inventario</h2>

      <form onSubmit={registrarMovimiento}>
        <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
          <option value="ENTRADA">Entrada</option>
          <option value="SALIDA">Salida</option>
        </select>

        <select
          value={idproducto}
          onChange={(e) => setIdproducto(e.target.value)}
          required
        >
          <option value="">Seleccione producto</option>
          {productos.map((p) => (
            <option key={p.idproducto} value={p.idproducto}>
              {p.nombre}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Cantidad"
          value={cantidad}
          onChange={(e) => setCantidad(e.target.value)}
          required
        />

        <input
          placeholder="Motivo"
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
        />

        <button type="submit">Registrar</button>
      </form>

      <hr />

      <h3>Historial</h3>
      <table>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Producto</th>
            <th>Tipo</th>
            <th>Cantidad</th>
            <th>Motivo</th>
          </tr>
        </thead>
        <tbody>
          {movimientos.map((m) => (
            <tr key={m.idmovimiento}>
              <td>{new Date(m.fecha).toLocaleString()}</td>
              <td>{m.producto}</td>
              <td>{m.tipo}</td>
              <td>{m.cantidad}</td>
              <td>{m.motivo}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InventarioMovimiento;