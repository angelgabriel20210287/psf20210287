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
}

const Inventario = () => {
  const [productos, setProductos] = useState<Product[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [productoEditando, setProductoEditando] = useState<Product | null>(null);

  // 🔹 Cargar productos desde la BD
  const cargarProductos = async () => {
    const response = await api.get("/productos");
    setProductos(response.data);
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  // 🔹 Filtrar productos
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
    cargarProductos();
  };

  // 🔹 Eliminar producto
  const eliminarProducto = async (id: number) => {
    const confirmar = confirm("¿Eliminar este producto?");
    if (!confirmar) return;

    await api.delete(`/productos/${id}`);
    cargarProductos();
  };

  return (
    <div className="inventario-container">
      <h2>Inventario</h2>

      <input
        type="text"
        placeholder="Buscar producto..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      <table>
        <thead>
          <tr>
            <th>Código</th>
            <th>Producto</th>
            <th>Stock</th>
            <th>Precio venta</th>
            <th>Costo</th>
            <th>Acción</th>
          </tr>
        </thead>

        <tbody>
          {productosFiltrados.length === 0 ? (
            <tr>
              <td colSpan={6} style={{ textAlign: "center" }}>
                No hay productos
              </td>
            </tr>
          ) : (
            productosFiltrados.map((p) => (
              <tr key={p.idproducto}>
                <td>{p.codigo}</td>
                <td>{p.nombre}</td>
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

      {/* FORMULARIO DE EDICIÓN */}
      {productoEditando && (
        <div className="editar-form">
          <h3>Editar Producto</h3>

          <input
            value={productoEditando.nombre}
            onChange={(e) =>
              setProductoEditando({
                ...productoEditando,
                nombre: e.target.value,
              })
            }
          />

          <input
            type="number"
            value={productoEditando.stock}
            onChange={(e) =>
              setProductoEditando({
                ...productoEditando,
                stock: Number(e.target.value),
              })
            }
          />

          <input
            type="number"
            value={productoEditando.precio}
            onChange={(e) =>
              setProductoEditando({
                ...productoEditando,
                precio: Number(e.target.value),
              })
            }
          />

          <input
            type="number"
            value={productoEditando.costo}
            onChange={(e) =>
              setProductoEditando({
                ...productoEditando,
                costo: Number(e.target.value),
              })
            }
          />

          <button onClick={guardarEdicion}>Guardar</button>
          <button onClick={() => setProductoEditando(null)}>Cancelar</button>
        </div>
      )}
    </div>
  );
};

export default Inventario;
