import { useEffect, useState } from "react";
import api from "../api/axios";
import Factura from "./Factura";
import "./Ventas.css";

interface Producto {
  idproducto: number;
  codigo: string;
  nombre: string;
  precio: number;
  stock: number;
}

interface Cliente {
  idcliente: number;
  nombre: string;
  telefono: string;
  direccion: string;
}

interface VentaItem {
  idproducto: number;
  nombre: string;
  precio: number;
  cantidad: number;
  subtotal: number;
}

const Ventas = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteId, setClienteId] = useState<number | null>(null);

  const [busqueda, setBusqueda] = useState("");
  const [carrito, setCarrito] = useState<VentaItem[]>([]);

  const [mostrarCobro, setMostrarCobro] = useState(false);
  const [mostrarFactura, setMostrarFactura] = useState(false);
  const [pagoCon, setPagoCon] = useState(0);
  const [facturaActual, setFacturaActual] = useState<any>(null);

  // 🔹 Cargar datos
  const cargarDatos = async () => {
    const prodRes = await api.get("/productos");
    const cliRes = await api.get("/clientes");

    const productosParseados = prodRes.data.map((p: any) => ({
      ...p,
      precio: Number(p.precio),
      stock: Number(p.stock),
    }));

    setProductos(productosParseados);
    setClientes(cliRes.data);
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const clienteSeleccionado =
    clientes.find((c) => c.idcliente === clienteId) ?? null;

  const productosFiltrados = productos.filter(
    (p) =>
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.codigo.toLowerCase().includes(busqueda.toLowerCase())
  );

  // 🛒 AGREGAR PRODUCTO
  const agregarProducto = (producto: Producto) => {
    const existe = carrito.find((i) => i.idproducto === producto.idproducto);

    if (existe) {
      if (existe.cantidad >= producto.stock) return;

      setCarrito((prev) =>
        prev.map((i) =>
          i.idproducto === producto.idproducto
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
          idproducto: producto.idproducto,
          nombre: producto.nombre,
          precio: producto.precio,
          cantidad: 1,
          subtotal: producto.precio,
        },
      ]);
    }
  };

  const cambiarCantidad = (idproducto: number, cantidad: number) => {
    const producto = productos.find((p) => p.idproducto === idproducto);
    if (!producto || cantidad < 1 || cantidad > producto.stock) return;

    setCarrito((prev) =>
      prev.map((i) =>
        i.idproducto === idproducto
          ? { ...i, cantidad, subtotal: cantidad * i.precio }
          : i
      )
    );
  };

  const eliminarItem = (idproducto: number) => {
    setCarrito((prev) => prev.filter((i) => i.idproducto !== idproducto));
  };

  const total = carrito.reduce((sum, i) => sum + i.subtotal, 0);
  const cambio = pagoCon - total;

  // 💰 PROCESAR VENTA
  const procesarCobro = async (imprimir: boolean) => {
    try {
      const venta = {
        idcliente: clienteId,
        total,
        pago: pagoCon,
        cambio,
        detalles: carrito.map((i) => ({
          idproducto: i.idproducto,
          cantidad: i.cantidad,
          precio: i.precio,
        })),
      };

      await api.post("/ventas", venta);

      setFacturaActual({
        cliente:
          clienteSeleccionado ??
          { nombre: "Consumidor Final", telefono: "N/A", direccion: "N/A" },
        fecha: new Date().toLocaleString(),
        total,
        pago: pagoCon,
        cambio,
        detalles: carrito,
      });

      setMostrarCobro(false);

      if (imprimir) {
        setMostrarFactura(true);
        setTimeout(() => {
          window.print();
          setMostrarFactura(false);
        }, 500);
      }

      setCarrito([]);
      setPagoCon(0);
      cargarDatos(); // 🔥 refresca stock
    } catch (error) {
      console.error(error);
      alert("❌ Error al registrar la venta");
    }
  };

  return (
    <div className="ventas-container">
      <h2>Ventas</h2>

      <label>Cliente</label>
      <select
        value={clienteId ?? ""}
        onChange={(e) =>
          setClienteId(e.target.value ? Number(e.target.value) : null)
        }
      >
        <option value="">Consumidor Final</option>
        {clientes.map((c) => (
          <option key={c.idcliente} value={c.idcliente}>
            {c.nombre}
          </option>
        ))}
      </select>

      <input
        placeholder="Buscar producto..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      <div className="productos-lista">
        {productosFiltrados.map((p) => (
          <button
            key={p.idproducto}
            disabled={p.stock === 0}
            onClick={() => agregarProducto(p)}
          >
            {p.nombre} (RD$ {p.precio})
          </button>
        ))}
      </div>

      <table>
        <thead>
          <tr>
            <th>Producto</th>
            <th>Cant.</th>
            <th>Precio</th>
            <th>Subtotal</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {carrito.map((i) => (
            <tr key={i.idproducto}>
              <td>{i.nombre}</td>
              <td>
                <input
                  type="number"
                  value={i.cantidad}
                  onChange={(e) =>
                    cambiarCantidad(i.idproducto, Number(e.target.value))
                  }
                />
              </td>
              <td>RD$ {i.precio}</td>
              <td>RD$ {i.subtotal}</td>
              <td>
                <button onClick={() => eliminarItem(i.idproducto)}>
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Total: RD$ {total}</h3>

      <button disabled={!carrito.length} onClick={() => setMostrarCobro(true)}>
        Cobrar
      </button>

      {mostrarCobro && (
        <div className="cobro-modal">
          <input
            type="number"
            placeholder="Pagó con..."
            value={pagoCon}
            onChange={(e) => setPagoCon(Number(e.target.value))}
          />

          <h4>Cambio: RD$ {cambio >= 0 ? cambio : 0}</h4>

          <button disabled={cambio < 0} onClick={() => procesarCobro(true)}>
            Cobrar e imprimir
          </button>

          <button disabled={cambio < 0} onClick={() => procesarCobro(false)}>
            Cobrar sin imprimir
          </button>

          <button onClick={() => setMostrarCobro(false)}>Cancelar</button>
        </div>
      )}

      {mostrarFactura && facturaActual && <Factura factura={facturaActual} />}
    </div>
  );
};

export default Ventas;
