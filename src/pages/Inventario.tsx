import { useEffect, useState } from "react";
import api from "../api/axios";
import "./Inventario.css";

interface Product {
  idproducto: number;
  codigo: string;
  nombre: string;
  stock: number;
  precio: number;
  costo: number;
  idproveedor?: number | null;
  proveedor?: string;
  tipo_inventario: string;
}

interface Proveedor {
  idproveedor: number;
  nombre: string;
}

const Inventario = () => {
  const [productos, setProductos] = useState<Product[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [productoEditando, setProductoEditando] = useState<Product | null>(null);
  const [filtroTipo, setFiltroTipo] = useState("nuevo");

  // 🔹 Cargar productos filtrados por tipo
  const cargarProductos = async (tipo: string) => {
    const response = await api.get(`/productos?tipo=${tipo}`);
    setProductos(response.data);
  };

  // 🔹 Cargar proveedores
  const cargarProveedores = async () => {
    const response = await api.get("/proveedores");
    setProveedores(response.data);
  };

  useEffect(() => {
    cargarProductos("nuevo");
    cargarProveedores();
  }, []);

  // 🔹 Recargar cuando cambia el filtro
  useEffect(() => {
    cargarProductos(filtroTipo);
    setBusqueda("");
    setProductoEditando(null);
  }, [filtroTipo]);

  // 🔹 Filtrar productos por búsqueda
  const productosFiltrados = productos.filter(
    (p) =>
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.codigo.toLowerCase().includes(busqueda.toLowerCase())
  );

  // 🔹 Guardar edición
  const guardarEdicion = async () => {
    if (!productoEditando) return;

    await api.put(`/productos/${productoEditando.idproducto}`, productoEditando);
    setProductoEditando(null);
    cargarProductos(filtroTipo);
  };

  // 🔹 Eliminar producto
  const eliminarProducto = async (id: number) => {
    const confirmar = window.confirm("¿Eliminar este producto?");
    if (!confirmar) return;

    await api.delete(`/productos/${id}`);
    cargarProductos(filtroTipo);
  };

  return (
    <div className="inventario-container">
      <h2>Inventario</h2>

      {/* 🔹 SELECTOR DE INVENTARIO */}
      <div className="selector-inventario">
        <button
          className={filtroTipo === "nuevo" ? "inv-btn activo-nuevo" : "inv-btn"}
          onClick={() => setFiltroTipo("nuevo")}
        >
          🔵 Piezas Nuevas
        </button>
        <button
          className={filtroTipo === "usado" ? "inv-btn activo-usado" : "inv-btn"}
          onClick={() => setFiltroTipo("usado")}
        >
          🟠 Piezas Usadas
        </button>
      </div>

      {/* 🔹 TÍTULO DINÁMICO */}
      <h3>
        {filtroTipo === "nuevo"
          ? "🔵 Inventario 1 — Piezas Nuevas"
          : "🟠 Inventario 2 — Piezas Usadas"}
      </h3>

      {/* 🔹 BUSCADOR */}
      <input
        type="text"
        placeholder={`Buscar en ${filtroTipo === "nuevo" ? "Piezas Nuevas" : "Piezas Usadas"}...`}
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      {/* 🔹 TABLA DE PRODUCTOS */}
      <table>
        <thead>
          <tr>
            <th>Código</th>
            <th>Producto</th>
            <th>Proveedor</th>
            <th>Stock</th>
            <th>Precio venta</th>
            <th>Costo</th>
            <th>Acción</th>
          </tr>
        </thead>

        <tbody>
          {productosFiltrados.length === 0 ? (
            <tr>
              <td colSpan={7} style={{ textAlign: "center" }}>
                No hay productos en este inventario
              </td>
            </tr>
          ) : (
            productosFiltrados.map((p) => (
              <tr key={p.idproducto}>
                <td>{p.codigo}</td>
                <td>{p.nombre}</td>
                <td>{p.proveedor || "Sin proveedor"}</td>
                <td>{p.stock}</td>
                <td>{p.precio}</td>
                <td>{p.costo}</td>
                <td>
                  <button onClick={() => setProductoEditando({ ...p })}>
                    Editar
                  </button>
                  <button onClick={() => eliminarProducto(p.idproducto)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* 🔹 FORMULARIO DE EDICIÓN */}
      {productoEditando && (
        <div className="editar-form">
          <h3>Editar Producto</h3>

          <input
            value={productoEditando.nombre}
            onChange={(e) =>
              setProductoEditando({ ...productoEditando, nombre: e.target.value })
            }
          />

          <input
            type="number"
            value={productoEditando.stock}
            onChange={(e) =>
              setProductoEditando({ ...productoEditando, stock: Number(e.target.value) })
            }
          />

          <input
            type="number"
            value={productoEditando.precio}
            onChange={(e) =>
              setProductoEditando({ ...productoEditando, precio: Number(e.target.value) })
            }
          />

          <input
            type="number"
            value={productoEditando.costo}
            onChange={(e) =>
              setProductoEditando({ ...productoEditando, costo: Number(e.target.value) })
            }
          />

          {/* 🔹 Selector de proveedor */}
          <select
            value={productoEditando.idproveedor || ""}
            onChange={(e) =>
              setProductoEditando({
                ...productoEditando,
                idproveedor: e.target.value ? Number(e.target.value) : null,
              })
            }
          >
            <option value="">Sin proveedor</option>
            {proveedores.map((prov) => (
              <option key={prov.idproveedor} value={prov.idproveedor}>
                {prov.nombre}
              </option>
            ))}
          </select>

          {/* 🔹 Selector de tipo de inventario */}
          <select
            value={productoEditando.tipo_inventario}
            onChange={(e) =>
              setProductoEditando({
                ...productoEditando,
                tipo_inventario: e.target.value,
              })
            }
          >
            <option value="nuevo">🔵 Piezas Nuevas</option>
            <option value="usado">🟠 Piezas Usadas</option>
          </select>

          <button onClick={guardarEdicion}>Guardar</button>
          <button onClick={() => setProductoEditando(null)}>Cancelar</button>
        </div>
      )}
    </div>
  );
};

export default Inventario;