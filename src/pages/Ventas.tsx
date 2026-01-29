import { useState } from "react";
import { useProductos, type Product } from "../Context/ProductContext";
import Factura from "./Factura";
import "./Ventas.css";

interface VentaItem {
  codigo: string;
  nombre: string;
  precio: number;
  cantidad: number;
  subtotal: number;
}

const Ventas = () => {
  const { productos, actualizarProducto } = useProductos();

  const [busqueda, setBusqueda] = useState("");
  const [carrito, setCarrito] = useState<VentaItem[]>([]);
  const [mostrarCobro, setMostrarCobro] = useState(false);
  const [mostrarFactura, setMostrarFactura] = useState(false);
  const [pagoCon, setPagoCon] = useState(0);

  const productosFiltrados = productos.filter(
    (p) =>
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.codigo.toLowerCase().includes(busqueda.toLowerCase())
  );

  const agregarProducto = (producto: Product) => {
    const existe = carrito.find((i) => i.codigo === producto.codigo);

    if (existe) {
      if (existe.cantidad >= producto.stock) return;

      setCarrito((prev) =>
        prev.map((i) =>
          i.codigo === producto.codigo
            ? {
                ...i,
                cantidad: i.cantidad + 1,
                subtotal: (i.cantidad + 1) * i.precio,
              }
            : i
        )
      );
    } else {
      setCarrito((prev) => [
        ...prev,
        {
          codigo: producto.codigo,
          nombre: producto.nombre,
          precio: producto.precio,
          cantidad: 1,
          subtotal: producto.precio,
        },
      ]);
    }
  };

  const cambiarCantidad = (codigo: string, cantidad: number) => {
    const producto = productos.find((p) => p.codigo === codigo);
    if (!producto || cantidad < 1 || cantidad > producto.stock) return;

    setCarrito((prev) =>
      prev.map((i) =>
        i.codigo === codigo
          ? { ...i, cantidad, subtotal: cantidad * i.precio }
          : i
      )
    );
  };

  const eliminarItem = (codigo: string) => {
    setCarrito((prev) => prev.filter((i) => i.codigo !== codigo));
  };

  const total = carrito.reduce((sum, i) => sum + i.subtotal, 0);
  const cambio = pagoCon - total;

  // 🔵 COBRAR E IMPRIMIR
  const cobrarEImprimir = () => {
    carrito.forEach((item) => {
      const producto = productos.find((p) => p.codigo === item.codigo);
      if (!producto) return;

      actualizarProducto({
        ...producto,
        stock: producto.stock - item.cantidad,
      });
    });

    setMostrarCobro(false);
    setMostrarFactura(true);

    setTimeout(() => {
      window.print();
      setMostrarFactura(false);
      setCarrito([]);
      setPagoCon(0);
    }, 500);
  };

  // 🟢 COBRAR SIN IMPRIMIR
  const cobrarSinImprimir = () => {
    carrito.forEach((item) => {
      const producto = productos.find((p) => p.codigo === item.codigo);
      if (!producto) return;

      actualizarProducto({
        ...producto,
        stock: producto.stock - item.cantidad,
      });
    });

    setMostrarCobro(false);
    setCarrito([]);
    setPagoCon(0);
  };

  return (
    <div className="ventas-container">
      <h2>Ventas</h2>

      <input
        type="text"
        placeholder="Buscar producto..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      {/* PRODUCTOS */}
      <div className="productos-lista">
        {productosFiltrados.map((p) => (
          <button
            key={p.codigo}
            disabled={p.stock === 0}
            onClick={() => agregarProducto(p)}
          >
            {p.nombre} (${p.precio})
          </button>
        ))}
      </div>

      {/* CARRITO */}
      <table>
        <thead>
          <tr>
            <th>Producto</th>
            <th>Cant.</th>
            <th>Precio</th>
            <th>Subtotal</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {carrito.length === 0 ? (
            <tr>
              <td colSpan={5} style={{ textAlign: "center" }}>
                Sin productos
              </td>
            </tr>
          ) : (
            carrito.map((i) => (
              <tr key={i.codigo}>
                <td>{i.nombre}</td>
                <td>
                  <input
                    type="number"
                    value={i.cantidad}
                    onChange={(e) =>
                      cambiarCantidad(i.codigo, Number(e.target.value))
                    }
                  />
                </td>
                <td>${i.precio}</td>
                <td>${i.subtotal}</td>
                <td>
                  <button onClick={() => eliminarItem(i.codigo)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <h3>Total: ${total}</h3>

      <button
        disabled={carrito.length === 0}
        onClick={() => setMostrarCobro(true)}
      >
        Cobrar
      </button>

      <button onClick={() => setCarrito([])}>Cancelar venta</button>

      {/* MODAL DE COBRO */}
      {mostrarCobro && (
        <div className="cobro-modal">
          <h3>Total a pagar: ${total}</h3>

          <input
            type="number"
            placeholder="Pagó con..."
            value={pagoCon}
            onChange={(e) => setPagoCon(Number(e.target.value))}
          />

          <h4>Cambio: ${cambio >= 0 ? cambio : 0}</h4>

          <div className="acciones-cobro">
            <button disabled={cambio < 0} onClick={cobrarEImprimir}>
              Cobrar e imprimir
            </button>

            <button disabled={cambio < 0} onClick={cobrarSinImprimir}>
              Cobrar sin imprimir
            </button>

            <button onClick={() => setMostrarCobro(false)}>Cancelar</button>
          </div>
        </div>
      )}

      {/* FACTURA */}
      {mostrarFactura && (
        <Factura
          items={carrito}
          total={total}
          pagoCon={pagoCon}
          cambio={cambio}
        />
      )}
    </div>
  );
};

export default Ventas;
