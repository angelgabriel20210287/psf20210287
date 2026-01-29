import { useState } from "react";
import { useProductos, type Product } from "../Context/ProductContext";
import "./Inventario.css";

const Inventario = () => {
  const { productos, eliminarProducto, actualizarProducto } = useProductos();
  const [busqueda, setBusqueda] = useState("");
  const [productoEditando, setProductoEditando] = useState<Product | null>(null);

  const productosFiltrados = productos.filter(
    (p) =>
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.codigo.toLowerCase().includes(busqueda.toLowerCase())
  );

  const obtenerEstado = (stock: number) =>
    stock > 0 ? "Disponible" : "Agotado";

  const guardarEdicion = () => {
    if (productoEditando) {
      actualizarProducto(productoEditando);
      setProductoEditando(null);
    }
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
            <th>Estado</th>
            <th>Acción</th>
          </tr>
        </thead>

        <tbody>
          {productosFiltrados.length === 0 ? (
            <tr>
              <td colSpan={7} style={{ textAlign: "center" }}>
                No hay productos
              </td>
            </tr>
          ) : (
            productosFiltrados.map((p) => (
              <tr key={p.codigo}>
                <td>{p.codigo}</td>
                <td>{p.nombre}</td>
                <td>{p.stock}</td>
                <td>{p.precio}</td>
                <td>{p.costo}</td>
                <td>{obtenerEstado(p.stock)}</td>
                <td>
                  <button onClick={() => setProductoEditando({ ...p })}>
                    Editar
                  </button>
                  <button onClick={() => eliminarProducto(p.codigo)}>
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
              setProductoEditando({ ...productoEditando, nombre: e.target.value })
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