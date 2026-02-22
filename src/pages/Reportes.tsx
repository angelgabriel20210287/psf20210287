import { useEffect, useState } from "react";
import axios from "axios";
import "./Reportes.css";

interface Producto {
  idproducto: number;
  nombre: string;
}

const Reportes = () => {
  const hoy = new Date().toISOString().split("T")[0];

  const [desde, setDesde] = useState(hoy);
  const [hasta, setHasta] = useState(hoy);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState("");

  const [ventas, setVentas] = useState<any>(null);
  const [ganancia, setGanancia] = useState<any>(null);
  const [productoData, setProductoData] = useState<any>(null);
  const [movimientos, setMovimientos] = useState<any[]>([]);
  const [topProductos, setTopProductos] = useState<any[]>([]);
  const [topClientes, setTopClientes] = useState<any[]>([]);

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    const res = await axios.get("http://localhost:3001/productos");
    setProductos(res.data);
  };

  const generarReporte = async () => {
    const ventasRes = await axios.get("http://localhost:3001/reportes/ventas-rango", {
      params: { desde, hasta }
    });
    setVentas(ventasRes.data);

    const gananciaRes = await axios.get("http://localhost:3001/reportes/ganancia-rango", {
      params: { desde, hasta }
    });
    setGanancia(gananciaRes.data);

    const movimientosRes = await axios.get("http://localhost:3001/reportes/movimientos-detalle", {
      params: { desde, hasta }
    });
    setMovimientos(movimientosRes.data);

    const topProdRes = await axios.get("http://localhost:3001/reportes/top-productos-rango", {
      params: { desde, hasta }
    });
    setTopProductos(topProdRes.data);

    const topCliRes = await axios.get("http://localhost:3001/reportes/top-clientes", {
      params: { desde, hasta }
    });
    setTopClientes(topCliRes.data);

    if (productoSeleccionado) {
      const prodRes = await axios.get("http://localhost:3001/reportes/ventas-producto", {
        params: { idproducto: productoSeleccionado, desde, hasta }
      });
      setProductoData(prodRes.data);
    }
  };

  return (
    <div className="reportes-container">
      <h1>📊 Reportes Inteligentes</h1>

      <div className="filtros">
        <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
        <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />

        <select
          value={productoSeleccionado}
          onChange={(e) => setProductoSeleccionado(e.target.value)}
        >
          <option value="">-- Seleccionar Producto --</option>
          {productos.map((p) => (
            <option key={p.idproducto} value={p.idproducto}>
              {p.nombre}
            </option>
          ))}
        </select>

        <button onClick={generarReporte}>Generar Reporte</button>
      </div>

      {ventas && (
        <div className="cards">
          <div className="card">
            <h3>Total Ventas</h3>
            <p>RD$ {ventas.total_vendido}</p>
          </div>

          <div className="card">
            <h3>Ganancia</h3>
            <p>RD$ {ganancia?.ganancia}</p>
          </div>

          <div className="card">
            <h3>Facturas</h3>
            <p>{ventas.cantidad_facturas}</p>
          </div>
        </div>
      )}

      {productoData && (
        <div className="seccion">
          <h2>📦 Producto Seleccionado</h2>
          <p><strong>Producto:</strong> {productoData.nombre}</p>
          <p><strong>Cantidad Vendida:</strong> {productoData.cantidad_vendida}</p>
          <p><strong>Total Generado:</strong> RD$ {productoData.total_generado}</p>
        </div>
      )}

      {movimientos.length > 0 && (
        <div className="seccion">
          <h2>🔄 Movimientos de Inventario</h2>
          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Tipo</th>
                <th>Cantidad</th>
              </tr>
            </thead>
            <tbody>
              {movimientos.map((m, i) => (
                <tr key={i}>
                  <td>{m.nombre}</td>
                  <td>{m.tipo}</td>
                  <td>{m.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {topProductos.length > 0 && (
        <div className="seccion">
          <h2>🔥 Top 5 Productos</h2>
          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cantidad Vendida</th>
              </tr>
            </thead>
            <tbody>
              {topProductos.map((p, i) => (
                <tr key={i}>
                  <td>{p.nombre}</td>
                  <td>{p.total_vendido}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {topClientes.length > 0 && (
        <div className="seccion">
          <h2>🏆 Top 3 Clientes</h2>
          <table>
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Compras</th>
                <th>Total Gastado</th>
              </tr>
            </thead>
            <tbody>
              {topClientes.map((c, i) => (
                <tr key={i}>
                  <td>{c.nombre}</td>
                  <td>{c.total_compras}</td>
                  <td>RD$ {c.total_gastado}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Reportes;