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
  tipo_inventario: string;
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
  const [busquedaCliente, setBusquedaCliente] = useState("");
  const [carrito, setCarrito] = useState<VentaItem[]>([]);

  const [mostrarCobro, setMostrarCobro] = useState(false);
  const [mostrarFactura, setMostrarFactura] = useState(false);

  // 🔹 pagoCon como string para manejar el input correctamente
  const [pagoCon, setPagoCon] = useState<string>("");

  const [facturaActual, setFacturaActual] = useState<any>(null);

  const [cajaAbierta, setCajaAbierta] = useState(false);
  const [idCajaActual, setIdCajaActual] = useState<number | null>(null);

  const [tipoInventario, setTipoInventario] = useState("nuevo");
  const [tipoPago, setTipoPago] = useState<"contado" | "credito">("contado");

  // 🔹 Calcular total y cambio en tiempo real
  const total = carrito.reduce((sum, i) => sum + i.subtotal, 0);
  const pagoNum = parseFloat(pagoCon) || 0;
  const cambio = pagoNum - total;
  const cambioValido = cambio >= 0 && pagoNum > 0;

  const cargarProductos = async (tipo: string) => {
    const prodRes = await api.get(`/productos?tipo=${tipo}`);
    const productosParseados = prodRes.data.map((p: any) => ({
      ...p,
      precio: Number(p.precio),
      stock: Number(p.stock),
    }));
    setProductos(productosParseados);
  };

  const cargarClientes = async () => {
    const cliRes = await api.get("/clientes");
    setClientes(cliRes.data);
  };

  const verificarCaja = async () => {
    try {
      const res = await api.get("/api/caja/actual");
      if (res.data) {
        setCajaAbierta(true);
        setIdCajaActual(res.data.idcaja);
      } else {
        setCajaAbierta(false);
        setIdCajaActual(null);
      }
    } catch (error) {
      console.error("Error verificando caja");
    }
  };

  useEffect(() => {
    cargarProductos("nuevo");
    cargarClientes();
    verificarCaja();
  }, []);

  useEffect(() => {
    cargarProductos(tipoInventario);
    setBusqueda("");
    setCarrito([]);
  }, [tipoInventario]);

  // 🔹 Limpiar el campo de pago al abrir el modal
  const abrirModalCobro = () => {
    setPagoCon("");
    setMostrarCobro(true);
  };

  const clientesFiltrados = clientes.filter((c) =>
    c.nombre.toLowerCase().includes(busquedaCliente.toLowerCase())
  );

  const productosFiltrados = productos.filter(
    (p) =>
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.codigo.toLowerCase().includes(busqueda.toLowerCase())
  );

  const agregarProducto = (producto: Producto) => {
    const existe = carrito.find((i) => i.idproducto === producto.idproducto);
    if (existe) {
      if (existe.cantidad >= producto.stock) return;
      setCarrito((prev) =>
        prev.map((i) =>
          i.idproducto === producto.idproducto
            ? { ...i, cantidad: i.cantidad + 1, subtotal: (i.cantidad + 1) * i.precio }
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

  const procesarCobro = async (imprimir: boolean) => {
    try {
      if (!cajaAbierta || !idCajaActual) {
        alert("Debe abrir caja antes de vender");
        return;
      }

      if (tipoPago === "credito" && !clienteId) {
        alert("⚠️ Las ventas a crédito requieren seleccionar un cliente.");
        return;
      }

      const venta = {
        idcliente: clienteId,
        total,
        pago: tipoPago === "contado" ? pagoNum : 0,
        cambio: tipoPago === "contado" ? cambio : 0,
        idcaja: idCajaActual,
        tipo_pago: tipoPago,
        detalles: carrito.map((i) => ({
          idproducto: i.idproducto,
          cantidad: i.cantidad,
          precio: i.precio,
        })),
      };

      const response = await api.post("/ventas", venta);
      const { numerofactura } = response.data;

      const clienteActual = clientes.find((c) => c.idcliente === clienteId) ?? {
        nombre: "Consumidor Final",
        telefono: "N/A",
        direccion: "N/A",
      };

      setFacturaActual({
        numerofactura,
        cliente: clienteActual,
        fecha: new Date(),
        total,
        pago: tipoPago === "contado" ? pagoNum : 0,
        cambio: tipoPago === "contado" ? cambio : 0,
        tipo_pago: tipoPago,
        detalles: carrito,
      });

      setMostrarCobro(false);

      if (imprimir) {
        setMostrarFactura(true);
        setTimeout(() => {
          window.print();
          setMostrarFactura(false);
        }, 700);
      }

      // Limpiar todo
      setCarrito([]);
      setPagoCon("");
      setClienteId(null);
      setBusquedaCliente("");
      setBusqueda("");
      setTipoPago("contado");
      cargarProductos(tipoInventario);
      cargarClientes();

    } catch (error: any) {
      console.error(error);
      alert(`❌ ${error.response?.data?.error || "Error al registrar la venta"}`);
    }
  };

  return (
    <div className="ventas-container">
      <h2>Ventas</h2>

      {!cajaAbierta && (
        <div className="caja-alerta">
          ⚠ Debe abrir la caja antes de realizar ventas.
        </div>
      )}

      {/* SELECTOR TIPO DE PAGO */}
      <div className="selector-tipo-pago">
        <button
          className={tipoPago === "contado" ? "pago-btn activo-contado" : "pago-btn"}
          onClick={() => setTipoPago("contado")}
        >
          💵 Al Contado
        </button>
        <button
          className={tipoPago === "credito" ? "pago-btn activo-credito" : "pago-btn"}
          onClick={() => setTipoPago("credito")}
        >
          📋 A Crédito
        </button>
      </div>

      {tipoPago === "credito" && (
        <div className="credito-aviso">
          📋 Venta a crédito — El cliente debe estar registrado y la deuda quedará pendiente de pago.
        </div>
      )}

      {/* SELECTOR INVENTARIO */}
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

      {/* BUSCADOR DE CLIENTES */}
      <div className="busqueda-cliente-container">
        <label>
          Cliente{" "}
          {tipoPago === "credito" && (
            <span className="requerido">* Requerido para crédito</span>
          )}
        </label>
        {!clienteId ? (
          <>
            <input
              placeholder="Buscar cliente..."
              value={busquedaCliente}
              onChange={(e) => setBusquedaCliente(e.target.value)}
            />
            {busquedaCliente && (
              <div className="dropdown-clientes">
                {clientesFiltrados.map((c) => (
                  <div
                    key={c.idcliente}
                    onClick={() => {
                      setClienteId(c.idcliente);
                      setBusquedaCliente(c.nombre);
                    }}
                  >
                    {c.nombre}
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="cliente-seleccionado">
            <span>👤 {busquedaCliente}</span>
            <button onClick={() => { setClienteId(null); setBusquedaCliente(""); }}>
              Cambiar
            </button>
          </div>
        )}
      </div>

      {/* BUSCADOR DE PRODUCTOS */}
      <input
        placeholder={`Buscar en ${tipoInventario === "nuevo" ? "Piezas Nuevas" : "Piezas Usadas"}...`}
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      <div className="productos-lista">
        {busqueda === "" ? (
          <div className="placeholder-ventas">
            🔍 Escriba para buscar productos en{" "}
            {tipoInventario === "nuevo" ? "🔵 Piezas Nuevas" : "🟠 Piezas Usadas"}...
          </div>
        ) : (
          productosFiltrados.map((p) => (
            <button
              key={p.idproducto}
              disabled={p.stock === 0}
              onClick={() => agregarProducto(p)}
            >
              {p.nombre} (RD$ {p.precio})
            </button>
          ))
        )}
      </div>

      {/* CARRITO */}
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
                  onChange={(e) => cambiarCantidad(i.idproducto, Number(e.target.value))}
                />
              </td>
              <td>RD$ {i.precio}</td>
              <td>RD$ {i.subtotal}</td>
              <td>
                <button onClick={() => eliminarItem(i.idproducto)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Total: RD$ {total}</h3>

      <button
        disabled={!carrito.length || !cajaAbierta}
        onClick={abrirModalCobro}
      >
        {tipoPago === "credito" ? "📋 Registrar a Crédito" : "💵 Cobrar"}
      </button>

      {/* MODAL DE COBRO */}
      {mostrarCobro && (
        <div className="cobro-modal">
          {tipoPago === "contado" ? (
            <>
              <h4>💵 Pago al Contado</h4>

              {/* Total a cobrar */}
              <div className="cobro-total-display">
                <span className="cobro-total-label">Total a cobrar</span>
                <span className="cobro-total-valor">RD$ {total.toFixed(2)}</span>
              </div>

              {/* Input de pago */}
              <input
                type="number"
                placeholder="¿Con cuánto paga el cliente?"
                value={pagoCon}
                onChange={(e) => setPagoCon(e.target.value)}
                autoFocus
                min={0}
              />

              {/* Cambio en tiempo real */}
              <div className={`cobro-cambio-display ${cambioValido ? "cambio-ok" : pagoNum > 0 ? "cambio-error" : "cambio-neutro"}`}>
                <span className="cobro-cambio-label">
                  {pagoNum === 0
                    ? "💬 Ingrese el monto recibido"
                    : cambioValido
                    ? "✅ Cambio a devolver"
                    : "❌ Monto insuficiente"}
                </span>
                {pagoNum > 0 && (
                  <span className="cobro-cambio-valor">
                    RD$ {cambioValido ? cambio.toFixed(2) : (pagoNum - total).toFixed(2)}
                  </span>
                )}
              </div>

              <button
                disabled={!cambioValido}
                onClick={() => procesarCobro(true)}
              >
                Cobrar e imprimir
              </button>
              <button
                disabled={!cambioValido}
                onClick={() => procesarCobro(false)}
              >
                Cobrar sin imprimir
              </button>
              <button onClick={() => setMostrarCobro(false)}>Cancelar</button>
            </>
          ) : (
            <>
              <h4>📋 Confirmar Venta a Crédito</h4>
              <div className="credito-resumen">
                <p>👤 Cliente: <strong>{busquedaCliente || "Sin cliente"}</strong></p>
                <p>💰 Total a crédito: <strong>RD$ {total.toFixed(2)}</strong></p>
                <p style={{ color: "#e65100", fontSize: 13 }}>
                  ⚠️ Esta deuda quedará registrada como pendiente de pago.
                </p>
              </div>
              <button onClick={() => procesarCobro(true)}>Registrar e imprimir</button>
              <button onClick={() => procesarCobro(false)}>Registrar sin imprimir</button>
              <button onClick={() => setMostrarCobro(false)}>Cancelar</button>
            </>
          )}
        </div>
      )}

      {mostrarFactura && facturaActual && <Factura factura={facturaActual} />}
    </div>
  );
};

export default Ventas;