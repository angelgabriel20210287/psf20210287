import { useEffect, useState } from "react";
import api from "../api/axios";
import "./InventarioMovimiento.css";

interface Producto {
  idproducto: number;
  nombre: string;
  tipo_inventario: string;
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

  // 🔹 Buscador de producto
  const [busquedaProducto, setBusquedaProducto] = useState("");
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
  const [mostrarDropdown, setMostrarDropdown] = useState(false);

  // 🔹 Tipo de inventario seleccionado
  const [tipoInventario, setTipoInventario] = useState("nuevo");

  // 🔹 Cargar productos filtrados por tipo de inventario
  const cargarProductos = async (tipo: string) => {
    const res = await api.get(`/productos?tipo=${tipo}`);
    setProductos(res.data);
    setProductoSeleccionado(null);
    setBusquedaProducto("");
  };

  // 🔹 Cargar historial de movimientos
  const cargarMovimientos = async () => {
    const res = await api.get("/inventario-movimientos");
    setMovimientos(res.data);
  };

  useEffect(() => {
    cargarProductos("nuevo");
    cargarMovimientos();
  }, []);

  // 🔹 Recargar productos cuando cambia el tipo de inventario
  useEffect(() => {
    cargarProductos(tipoInventario);
  }, [tipoInventario]);

  // 🔹 Productos filtrados por búsqueda
  const productosFiltrados = productos.filter((p) =>
    p.nombre.toLowerCase().includes(busquedaProducto.toLowerCase())
  );

  // 🔹 Seleccionar producto del dropdown
  const seleccionarProducto = (p: Producto) => {
    setProductoSeleccionado(p);
    setBusquedaProducto(p.nombre);
    setMostrarDropdown(false);
  };

  // 🔹 Limpiar selección de producto
  const limpiarProducto = () => {
    setProductoSeleccionado(null);
    setBusquedaProducto("");
  };

  // 🔹 Registrar movimiento
  const registrarMovimiento = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!productoSeleccionado) {
      alert("Por favor seleccione un producto");
      return;
    }

    try {
      await api.post("/inventario-movimientos", {
        tipo,
        cantidad: Number(cantidad),
        motivo,
        idproducto: productoSeleccionado.idproducto,
      });

      setCantidad("");
      setMotivo("");
      limpiarProducto();

      cargarMovimientos();
      cargarProductos(tipoInventario);
      alert("✅ Movimiento registrado correctamente");
    } catch (error: any) {
      alert(`❌ Error: ${error.response?.data?.error || "Error al registrar movimiento"}`);
    }
  };

  return (
    <div>
      <h2>Movimientos de Inventario</h2>

      {/* 🔹 SELECTOR DE INVENTARIO */}
      <div className="selector-inventario">
        <button
          className={tipoInventario === "nuevo" ? "inv-btn activo-nuevo" : "inv-btn"}
          onClick={() => setTipoInventario("nuevo")}
        >
          🔵 Piezas Nuevas
        </button>
        <button
          className={tipoInventario === "usado" ? "inv-btn activo-usado" : "inv-btn"}
          onClick={() => setTipoInventario("usado")}
        >
          🟠 Piezas Usadas
        </button>
      </div>

      {/* 🔹 TÍTULO DINÁMICO */}
      <h3>
        Registrar movimiento en:{" "}
        {tipoInventario === "nuevo"
          ? "🔵 Inventario 1 — Piezas Nuevas"
          : "🟠 Inventario 2 — Piezas Usadas"}
      </h3>

      {/* 🔹 FORMULARIO */}
      <form onSubmit={registrarMovimiento}>

        {/* Tipo de movimiento */}
        <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
          <option value="ENTRADA">Entrada</option>
          <option value="SALIDA">Salida</option>
        </select>

        {/* 🔹 BUSCADOR DE PRODUCTO */}
        <div className="buscador-producto-container">
          {!productoSeleccionado ? (
            <>
              <input
                type="text"
                placeholder={`Buscar producto en ${tipoInventario === "nuevo" ? "Piezas Nuevas" : "Piezas Usadas"}...`}
                value={busquedaProducto}
                onChange={(e) => {
                  setBusquedaProducto(e.target.value);
                  setMostrarDropdown(true);
                }}
                onFocus={() => setMostrarDropdown(true)}
                autoComplete="off"
              />
              {mostrarDropdown && busquedaProducto && (
                <div className="dropdown-productos">
                  {productosFiltrados.length === 0 ? (
                    <div className="dropdown-empty">No se encontraron productos</div>
                  ) : (
                    productosFiltrados.map((p) => (
                      <div
                        key={p.idproducto}
                        className="dropdown-item"
                        onClick={() => seleccionarProducto(p)}
                      >
                        {p.nombre}
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          ) : (
            /* Producto seleccionado — mostrar chip con botón para cambiar */
            <div className="producto-seleccionado">
              <span>📦 {productoSeleccionado.nombre}</span>
              <button type="button" onClick={limpiarProducto}>
                Cambiar
              </button>
            </div>
          )}
        </div>

        <input
          type="number"
          placeholder="Cantidad"
          value={cantidad}
          onChange={(e) => setCantidad(e.target.value)}
          required
          min="1"
        />

        <input
          placeholder="Motivo (opcional)"
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
        />

        <button type="submit">Registrar Movimiento</button>
      </form>

      <hr />

      {/* 🔹 HISTORIAL COMPLETO */}
      <h3>Historial de Movimientos</h3>
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
          {movimientos.length === 0 ? (
            <tr>
              <td colSpan={5} style={{ textAlign: "center" }}>
                No hay movimientos registrados
              </td>
            </tr>
          ) : (
            movimientos.map((m) => (
              <tr key={m.idmovimiento}>
                <td>{new Date(m.fecha).toLocaleString()}</td>
                <td>{m.producto}</td>
                <td
                  style={{
                    color: m.tipo === "ENTRADA" ? "#2e7d32" : "#c62828",
                    fontWeight: "bold",
                  }}
                >
                  {m.tipo === "ENTRADA" ? "⬆ ENTRADA" : "⬇ SALIDA"}
                </td>
                <td>{m.cantidad}</td>
                <td>{m.motivo || "—"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default InventarioMovimiento;