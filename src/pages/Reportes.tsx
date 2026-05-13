import { useEffect, useState } from "react";
import api from "../api/axios";
import "./Reportes.css";

interface Producto {
  idproducto: number;
  nombre: string;
  tipo_inventario: string;
}

interface StockBajo {
  idproducto: number;
  codigo: string;
  nombre: string;
  stock: number;
  tipo_inventario: string;
  proveedor: string;
}

const Reportes = () => {
  const hoy = new Date().toISOString().split("T")[0];
  const [desde, setDesde] = useState(hoy);
  const [hasta, setHasta] = useState(hoy);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState("");
  const [filtroInventario, setFiltroInventario] = useState("todos");
  const [tabActiva, setTabActiva] = useState("resumen");
  const [cargando, setCargando] = useState(false);

  const [resumen, setResumen] = useState<any>(null);
  const [ganancia, setGanancia] = useState<any>(null);
  const [ventasDiarias, setVentasDiarias] = useState<any[]>([]);
  const [topProductos, setTopProductos] = useState<any[]>([]);
  const [topClientes, setTopClientes] = useState<any[]>([]);
  const [creditosReporte, setCreditosReporte] = useState<any[]>([]);
  const [movimientos, setMovimientos] = useState<any[]>([]);
  const [stockActual, setStockActual] = useState<any[]>([]);
  const [productoData, setProductoData] = useState<any>(null);
  const [stockBajo, setStockBajo] = useState<StockBajo[]>([]);
  const [mostrarAlerta, setMostrarAlerta] = useState(false);

  useEffect(() => {
    cargarProductos();
    cargarStockBajo();
  }, []);

  const cargarProductos = async () => {
    const res = await api.get("/productos");
    setProductos(res.data);
  };

  const cargarStockBajo = async () => {
    const res = await api.get("/reportes/stock-bajo");
    setStockBajo(res.data);
    if (res.data.length > 0) setMostrarAlerta(true);
  };

  const generarReporte = async () => {
    setCargando(true);
    try {
      const params = { desde, hasta };

      const [
        resumenRes, gananciaRes, diariasRes,
        topProdRes, topCliRes, creditosRes,
        movRes, stockRes,
      ] = await Promise.all([
        api.get("/reportes/resumen", { params }),
        api.get("/reportes/ganancia-rango", { params }),
        api.get("/reportes/ventas-diarias", { params }),
        api.get("/reportes/top-productos-rango", {
          params: {
            ...params,
            tipo_inventario: filtroInventario !== "todos" ? filtroInventario : undefined,
          },
        }),
        api.get("/reportes/top-clientes", { params }),
        api.get("/reportes/creditos", { params }),
        api.get("/reportes/movimientos-detalle", { params }),
        api.get("/reportes/stock-actual", {
          params: {
            tipo_inventario: filtroInventario !== "todos" ? filtroInventario : undefined,
          },
        }),
      ]);

      setResumen(resumenRes.data);
      setGanancia(gananciaRes.data);
      setVentasDiarias(diariasRes.data);
      setTopProductos(topProdRes.data);
      setTopClientes(topCliRes.data);
      setCreditosReporte(creditosRes.data);
      setMovimientos(movRes.data);
      setStockActual(stockRes.data);

      if (productoSeleccionado) {
        const prodRes = await api.get("/reportes/ventas-producto", {
          params: { idproducto: productoSeleccionado, ...params },
        });
        setProductoData(prodRes.data);
      }
    } catch (error) {
      console.error("Error generando reportes", error);
    } finally {
      setCargando(false);
    }
  };

  const fmt = (n: any) =>
    Number(n || 0).toLocaleString("es-DO", { minimumFractionDigits: 2 });

  const pct = (a: any, b: any) =>
    b > 0 ? ((Number(a) / Number(b)) * 100).toFixed(1) : "0.0";

  const BarraProgreso = ({ valor, max, color = "#ff6b35" }: any) => (
    <div className="rpt__barra-bg">
      <div
        className="rpt__barra-fill"
        style={{ width: `${Math.min((valor / max) * 100, 100)}%`, background: color }}
      />
    </div>
  );

  const stockBajoNuevo = stockBajo.filter((p) => p.tipo_inventario === "nuevo");
  const stockBajoUsado = stockBajo.filter((p) => p.tipo_inventario === "usado");
  const maxVenta = Math.max(...ventasDiarias.map((d) => Number(d.total)), 1);
  const creditoPendiente = creditosReporte.find((c) => c.estado === "pendiente");
  const creditoPagado = creditosReporte.find((c) => c.estado === "pagado");

  const TablaStockBajo = ({ lista }: { lista: StockBajo[] }) => (
    <table className="rpt__table">
      <thead>
        <tr>
          <th>Código</th>
          <th>Producto</th>
          <th>Stock</th>
          <th>Proveedor</th>
          <th>Urgencia</th>
        </tr>
      </thead>
      <tbody>
        {lista.map((p) => (
          <tr key={p.idproducto} className={p.stock === 0 ? "rpt__fila-agotado" : "rpt__fila-bajo"}>
            <td>{p.codigo}</td>
            <td>{p.nombre}</td>
            <td>
              <span className={p.stock === 0 ? "rpt__stock-cero" : p.stock <= 2 ? "rpt__stock-critico" : "rpt__stock-bajo"}>
                {p.stock === 0 ? "❌ AGOTADO" : `⚠️ ${p.stock} uds`}
              </span>
            </td>
            <td>{p.proveedor || "—"}</td>
            <td>
              <span className={p.stock === 0 ? "rpt__urgencia-critica" : p.stock <= 2 ? "rpt__urgencia-alta" : "rpt__urgencia-media"}>
                {p.stock === 0 ? "🔴 URGENTE" : p.stock <= 2 ? "🟠 Alta" : "🟡 Media"}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="rpt__container">

      {/* ALERTA STOCK BAJO */}
      {mostrarAlerta && stockBajo.length > 0 && (
        <div className="rpt__alerta-banner">
          <div className="rpt__alerta-content">
            <span className="rpt__alerta-icono">🚨</span>
            <div>
              <strong className="rpt__alerta-titulo">¡Alerta de Stock Bajo!</strong>
              <span className="rpt__alerta-desc">
                {stockBajo.length} producto{stockBajo.length > 1 ? "s" : ""} con 5 o menos unidades
                {stockBajoNuevo.length > 0 && ` — 🔵 ${stockBajoNuevo.length} nuevas`}
                {stockBajoUsado.length > 0 && ` — 🟠 ${stockBajoUsado.length} usadas`}
              </span>
            </div>
          </div>
          <div className="rpt__alerta-acciones">
            <button className="rpt__btn-ver-alertas" onClick={() => setTabActiva("stock")}>
              Ver productos
            </button>
            <button className="rpt__btn-cerrar-alerta" onClick={() => setMostrarAlerta(false)}>
              ✕
            </button>
          </div>
        </div>
      )}

      <h1 className="rpt__titulo">📊 Reportes del Negocio</h1>

      {/* FILTROS */}
      <div className="rpt__filtros-panel">
        <div className="rpt__filtros-fila">
          <div className="rpt__filtro-grupo">
            <label>Desde</label>
            <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
          </div>
          <div className="rpt__filtro-grupo">
            <label>Hasta</label>
            <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
          </div>
          <div className="rpt__filtro-grupo">
            <label>Inventario</label>
            <select value={filtroInventario} onChange={(e) => setFiltroInventario(e.target.value)}>
              <option value="todos">📋 Todos</option>
              <option value="nuevo">🔵 Piezas Nuevas</option>
              <option value="usado">🟠 Piezas Usadas</option>
            </select>
          </div>
          <div className="rpt__filtro-grupo">
            <label>Producto específico</label>
            <select value={productoSeleccionado} onChange={(e) => setProductoSeleccionado(e.target.value)}>
              <option value="">-- Opcional --</option>
              {productos.map((p) => (
                <option key={p.idproducto} value={p.idproducto}>
                  {p.tipo_inventario === "nuevo" ? "🔵" : "🟠"} {p.nombre}
                </option>
              ))}
            </select>
          </div>
          <button className="rpt__btn-generar" onClick={generarReporte} disabled={cargando}>
            {cargando ? "⏳ Cargando..." : "🔍 Generar Reporte"}
          </button>
        </div>

        <div className="rpt__atajos">
          <span className="rpt__atajos-label">Período rápido:</span>
          {[
            { label: "Hoy", dias: 0 },
            { label: "7 días", dias: 7 },
            { label: "15 días", dias: 15 },
            { label: "Este mes", dias: 30 },
            { label: "3 meses", dias: 90 },
          ].map(({ label, dias }) => (
            <button
              key={label}
              className="rpt__atajo-btn"
              onClick={() => {
                const d = new Date();
                d.setDate(d.getDate() - dias);
                setDesde(d.toISOString().split("T")[0]);
                setHasta(hoy);
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* TABS */}
      <div className="rpt__tabs-nav">
        {[
          { id: "resumen",   label: "📈 Resumen" },
          { id: "ventas",    label: "💵 Ventas" },
          { id: "ganancias", label: "💰 Ganancias" },
          { id: "productos", label: "📦 Productos" },
          { id: "clientes",  label: "👥 Clientes" },
          { id: "creditos",  label: "📋 Créditos" },
          { id: "stock",     label: `🏭 Stock${stockBajo.length > 0 ? ` 🚨${stockBajo.length}` : ""}` },
        ].map((tab) => (
          <button
            key={tab.id}
            className={tabActiva === tab.id ? "rpt__tab-btn rpt__tab-activo" : "rpt__tab-btn"}
            onClick={() => setTabActiva(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* SIN DATOS */}
      {!resumen && tabActiva !== "stock" && (
        <div className="rpt__empty">
          Selecciona un período y presiona <strong>Generar Reporte</strong>
        </div>
      )}

      {/* ── TAB RESUMEN ── */}
      {tabActiva === "resumen" && resumen && (
        <div className="rpt__tab-contenido">
          <div className="rpt__cards-grid">
            <div className="rpt__card rpt__card-verde">
              <span className="rpt__card-icono">💵</span>
              <div className="rpt__card-body">
                <span className="rpt__card-label">Total Vendido</span>
                <span className="rpt__card-valor">RD$ {fmt(resumen.ventas.total_vendido)}</span>
                <span className="rpt__card-sub">{resumen.ventas.facturas} facturas</span>
              </div>
            </div>
            <div className="rpt__card rpt__card-azul">
              <span className="rpt__card-icono">📈</span>
              <div className="rpt__card-body">
                <span className="rpt__card-label">Ganancia Neta</span>
                <span className="rpt__card-valor">RD$ {fmt(resumen.ganancia.ganancia)}</span>
                <span className="rpt__card-sub">Margen: {pct(resumen.ganancia.ganancia, resumen.ganancia.ingresos)}%</span>
              </div>
            </div>
            <div className="rpt__card rpt__card-naranja">
              <span className="rpt__card-icono">📋</span>
              <div className="rpt__card-body">
                <span className="rpt__card-label">Créditos Pendientes</span>
                <span className="rpt__card-valor">RD$ {fmt(resumen.creditos.pendiente_cobro)}</span>
                <span className="rpt__card-sub">{resumen.creditos.total_creditos} cuentas activas</span>
              </div>
            </div>
            <div className={`rpt__card ${Number(resumen.stockBajo.productos_bajo_stock) > 0 ? "rpt__card-rojo" : "rpt__card-gris"}`}>
              <span className="rpt__card-icono">🚨</span>
              <div className="rpt__card-body">
                <span className="rpt__card-label">Stock Bajo</span>
                <span className="rpt__card-valor">{resumen.stockBajo.productos_bajo_stock}</span>
                <span className="rpt__card-sub">productos con ≤ 5 unidades</span>
              </div>
            </div>
          </div>

          <div className="rpt__seccion">
            <h2 className="rpt__seccion-h2">Desglose de Ventas</h2>
            <div className="rpt__desglose-grid">
              {[
                { label: "💵 Contado",         val: resumen.ventas.contado,   max: resumen.ventas.total_vendido, color: "#10b981" },
                { label: "📋 Crédito",          val: resumen.ventas.credito,   max: resumen.ventas.total_vendido, color: "#f59e0b" },
                { label: "📦 Ingresos Brutos",  val: resumen.ganancia.ingresos, max: resumen.ganancia.ingresos,  color: "#6366f1" },
                { label: "🏷️ Costo Mercancía", val: resumen.ganancia.costos,   max: resumen.ganancia.ingresos,  color: "#ef4444" },
              ].map(({ label, val, max, color }) => (
                <div key={label} className="rpt__desglose-item">
                  <span className="rpt__desglose-label">{label}</span>
                  <span className="rpt__desglose-valor">RD$ {fmt(val)}</span>
                  <BarraProgreso valor={Number(val)} max={Number(max)} color={color} />
                  <span className="rpt__desglose-small">{pct(val, max)}% del total</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB VENTAS ── */}
      {tabActiva === "ventas" && resumen && (
        <div className="rpt__tab-contenido">
          <div className="rpt__cards-grid">
            {[
              { icon: "🧾", label: "Facturas emitidas",  val: resumen.ventas.facturas,            cls: "rpt__card-azul" },
              { icon: "💵", label: "Total vendido",       val: `RD$ ${fmt(resumen.ventas.total_vendido)}`, cls: "rpt__card-verde" },
              { icon: "✅", label: "Ventas contado",      val: `RD$ ${fmt(resumen.ventas.contado)}`,  cls: "rpt__card-verde" },
              { icon: "📋", label: "Ventas crédito",      val: `RD$ ${fmt(resumen.ventas.credito)}`,  cls: "rpt__card-naranja" },
            ].map(({ icon, label, val, cls }) => (
              <div key={label} className={`rpt__card ${cls}`}>
                <span className="rpt__card-icono">{icon}</span>
                <div className="rpt__card-body">
                  <span className="rpt__card-label">{label}</span>
                  <span className="rpt__card-valor">{val}</span>
                </div>
              </div>
            ))}
          </div>

          {ventasDiarias.length > 0 && (
            <div className="rpt__seccion">
              <h2 className="rpt__seccion-h2">📅 Ventas por Día</h2>
              <div className="rpt__grafica">
                {ventasDiarias.map((d, i) => (
                  <div key={i} className="rpt__grafica-col">
                    <span className="rpt__grafica-valor">RD$ {fmt(d.total)}</span>
                    <div
                      className="rpt__grafica-barra"
                      style={{ height: `${Math.max((Number(d.total) / maxVenta) * 160, 6)}px` }}
                    />
                    <span className="rpt__grafica-label">
                      {new Date(d.dia).toLocaleDateString("es-DO", { day: "2-digit", month: "short" })}
                    </span>
                    <span className="rpt__grafica-facts">{d.facturas} fact.</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB GANANCIAS ── */}
      {tabActiva === "ganancias" && ganancia && (
        <div className="rpt__tab-contenido">
          <div className="rpt__cards-grid">
            {[
              { icon: "📥", label: "Ingresos Brutos",    val: `RD$ ${fmt(ganancia.ingresos)}`, sub: "Lo que entró", cls: "rpt__card-azul" },
              { icon: "📤", label: "Costo Mercancía",    val: `RD$ ${fmt(ganancia.costos)}`,   sub: "Lo que costó", cls: "rpt__card-rojo" },
              { icon: Number(ganancia.ganancia) >= 0 ? "✅" : "❌",
                label: "Ganancia Neta",
                val: `RD$ ${fmt(ganancia.ganancia)}`,
                sub: Number(ganancia.ganancia) >= 0 ? "✅ Ganando" : "❌ Perdiendo",
                cls: Number(ganancia.ganancia) >= 0 ? "rpt__card-verde" : "rpt__card-rojo" },
              { icon: "📊", label: "Margen de Ganancia", val: `${pct(ganancia.ganancia, ganancia.ingresos)}%`, sub: "Por cada RD$ vendido", cls: "rpt__card-gris" },
            ].map(({ icon, label, val, sub, cls }) => (
              <div key={label} className={`rpt__card ${cls}`}>
                <span className="rpt__card-icono">{icon}</span>
                <div className="rpt__card-body">
                  <span className="rpt__card-label">{label}</span>
                  <span className="rpt__card-valor">{val}</span>
                  <span className="rpt__card-sub">{sub}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="rpt__seccion">
            <h2 className="rpt__seccion-h2">📊 Análisis de Rentabilidad</h2>
            <div className="rpt__rent-container">
              {[
                { label: "Ingresos", pct: 100, cls: "rpt__rent-ingreso", val: `RD$ ${fmt(ganancia.ingresos)}` },
                { label: "Costos",   pct: Number(pct(ganancia.costos, ganancia.ingresos)), cls: "rpt__rent-costo",    val: `RD$ ${fmt(ganancia.costos)} (${pct(ganancia.costos, ganancia.ingresos)}%)` },
                { label: "Ganancia", pct: Math.max(Number(pct(ganancia.ganancia, ganancia.ingresos)), 0), cls: "rpt__rent-ganancia", val: `RD$ ${fmt(ganancia.ganancia)} (${pct(ganancia.ganancia, ganancia.ingresos)}%)` },
              ].map(({ label, pct: p, cls, val }) => (
                <div key={label} className="rpt__rent-item">
                  <span className="rpt__rent-label">{label}</span>
                  <div className="rpt__rent-barra-bg">
                    <div className={`rpt__rent-barra ${cls}`} style={{ width: `${p}%` }} />
                  </div>
                  <span className="rpt__rent-valor">{val}</span>
                </div>
              ))}
            </div>
          </div>

          {productoData && (
            <div className="rpt__seccion">
              <h2 className="rpt__seccion-h2">📦 Producto Específico</h2>
              <div className="rpt__cards-grid">
                <div className="rpt__card rpt__card-azul">
                  <span className="rpt__card-icono">📦</span>
                  <div className="rpt__card-body">
                    <span className="rpt__card-label">{productoData.nombre}</span>
                    <span className="rpt__card-valor">{productoData.cantidad_vendida} uds</span>
                    <span className="rpt__card-sub">{productoData.tipo_inventario === "nuevo" ? "🔵 Nueva" : "🟠 Usada"}</span>
                  </div>
                </div>
                <div className="rpt__card rpt__card-verde">
                  <span className="rpt__card-icono">💵</span>
                  <div className="rpt__card-body">
                    <span className="rpt__card-label">Total Generado</span>
                    <span className="rpt__card-valor">RD$ {fmt(productoData.total_generado)}</span>
                  </div>
                </div>
                <div className="rpt__card rpt__card-azul">
                  <span className="rpt__card-icono">📈</span>
                  <div className="rpt__card-body">
                    <span className="rpt__card-label">Ganancia</span>
                    <span className="rpt__card-valor">RD$ {fmt(productoData.ganancia)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB PRODUCTOS ── */}
      {tabActiva === "productos" && (
        <div className="rpt__tab-contenido">
          {topProductos.length > 0 && (
            <div className="rpt__seccion">
              <h2 className="rpt__seccion-h2">🔥 Top 10 Productos Más Vendidos</h2>
              {filtroInventario !== "todos" && (
                <span className="rpt__badge-inventario">
                  {filtroInventario === "nuevo" ? "🔵 Piezas Nuevas" : "🟠 Piezas Usadas"}
                </span>
              )}
              <table className="rpt__table">
                <thead>
                  <tr>
                    <th>#</th><th>Producto</th><th>Inventario</th>
                    <th>Unidades</th><th>Ingresos</th><th>Ganancia</th>
                  </tr>
                </thead>
                <tbody>
                  {topProductos.map((p, i) => (
                    <tr key={i}>
                      <td>{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}</td>
                      <td>{p.nombre}</td>
                      <td>
                        <span className={p.tipo_inventario === "nuevo" ? "rpt__badge-nuevo" : "rpt__badge-usado"}>
                          {p.tipo_inventario === "nuevo" ? "🔵 Nuevo" : "🟠 Usado"}
                        </span>
                      </td>
                      <td>{p.total_vendido}</td>
                      <td>RD$ {fmt(p.total_generado)}</td>
                      <td className="rpt__td-ganancia">RD$ {fmt(p.ganancia)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {movimientos.length > 0 && (
            <div className="rpt__seccion">
              <h2 className="rpt__seccion-h2">🔄 Movimientos de Inventario</h2>
              <table className="rpt__table">
                <thead>
                  <tr><th>Producto</th><th>Inventario</th><th>Tipo</th><th>Cantidad</th></tr>
                </thead>
                <tbody>
                  {movimientos.map((m, i) => (
                    <tr key={i}>
                      <td>{m.nombre}</td>
                      <td>
                        <span className={m.tipo_inventario === "nuevo" ? "rpt__badge-nuevo" : "rpt__badge-usado"}>
                          {m.tipo_inventario === "nuevo" ? "🔵 Nuevo" : "🟠 Usado"}
                        </span>
                      </td>
                      <td>
                        <span className={m.tipo === "ENTRADA" ? "rpt__badge-entrada" : "rpt__badge-salida"}>
                          {m.tipo === "ENTRADA" ? "⬆ ENTRADA" : "⬇ SALIDA"}
                        </span>
                      </td>
                      <td>{m.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!topProductos.length && !movimientos.length && (
            <div className="rpt__empty">No hay datos de productos en este período.</div>
          )}
        </div>
      )}

      {/* ── TAB CLIENTES ── */}
      {tabActiva === "clientes" && (
        <div className="rpt__tab-contenido">
          {topClientes.length > 0 ? (
            <div className="rpt__seccion">
              <h2 className="rpt__seccion-h2">🏆 Top 5 Clientes</h2>
              <table className="rpt__table">
                <thead>
                  <tr><th>#</th><th>Cliente</th><th>Teléfono</th><th>Compras</th><th>A Crédito</th><th>Total Gastado</th></tr>
                </thead>
                <tbody>
                  {topClientes.map((c, i) => (
                    <tr key={i}>
                      <td>{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}</td>
                      <td>{c.nombre}</td>
                      <td>{c.telefono || "—"}</td>
                      <td>{c.total_compras}</td>
                      <td>{c.compras_credito > 0 ? `📋 ${c.compras_credito}` : "—"}</td>
                      <td className="rpt__td-ganancia">RD$ {fmt(c.total_gastado)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rpt__empty">No hay datos de clientes en este período.</div>
          )}
        </div>
      )}

      {/* ── TAB CRÉDITOS ── */}
      {tabActiva === "creditos" && (
        <div className="rpt__tab-contenido">
          {creditosReporte.length > 0 ? (
            <>
              <div className="rpt__cards-grid">
                {creditoPendiente && (
                  <div className="rpt__card rpt__card-naranja">
                    <span className="rpt__card-icono">⏳</span>
                    <div className="rpt__card-body">
                      <span className="rpt__card-label">Créditos Pendientes</span>
                      <span className="rpt__card-valor">{creditoPendiente.cantidad}</span>
                      <span className="rpt__card-sub">RD$ {fmt(creditoPendiente.saldo_pendiente)} por cobrar</span>
                    </div>
                  </div>
                )}
                {creditoPagado && (
                  <div className="rpt__card rpt__card-verde">
                    <span className="rpt__card-icono">✅</span>
                    <div className="rpt__card-body">
                      <span className="rpt__card-label">Créditos Pagados</span>
                      <span className="rpt__card-valor">{creditoPagado.cantidad}</span>
                      <span className="rpt__card-sub">RD$ {fmt(creditoPagado.total_pagado)} cobrado</span>
                    </div>
                  </div>
                )}
                {creditoPendiente && (
                  <div className="rpt__card rpt__card-rojo">
                    <span className="rpt__card-icono">💸</span>
                    <div className="rpt__card-body">
                      <span className="rpt__card-label">Total Pendiente</span>
                      <span className="rpt__card-valor">RD$ {fmt(creditoPendiente.saldo_pendiente)}</span>
                      <span className="rpt__card-sub">Dinero aún no recibido</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="rpt__seccion">
                <h2 className="rpt__seccion-h2">📋 Detalle de Créditos</h2>
                <table className="rpt__table">
                  <thead>
                    <tr><th>Estado</th><th>Cantidad</th><th>Deuda Total</th><th>Pagado</th><th>Pendiente</th></tr>
                  </thead>
                  <tbody>
                    {creditosReporte.map((c, i) => (
                      <tr key={i}>
                        <td>
                          <span className={c.estado === "pendiente" ? "rpt__badge-pendiente" : "rpt__badge-pagado"}>
                            {c.estado === "pendiente" ? "⏳ Pendiente" : "✅ Pagado"}
                          </span>
                        </td>
                        <td>{c.cantidad}</td>
                        <td>RD$ {fmt(c.total_deuda)}</td>
                        <td>RD$ {fmt(c.total_pagado)}</td>
                        <td className={c.estado === "pendiente" ? "rpt__td-alerta" : "rpt__td-ganancia"}>
                          RD$ {fmt(c.saldo_pendiente)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="rpt__empty">No hay créditos en este período.</div>
          )}
        </div>
      )}

      {/* ── TAB STOCK ── */}
      {tabActiva === "stock" && (
        <div className="rpt__tab-contenido">
          {stockBajo.length > 0 ? (
            <div className="rpt__seccion rpt__seccion-alerta">
              <h2 className="rpt__seccion-h2">🚨 Productos con Stock Bajo (≤ 5 unidades)</h2>

              {stockBajoNuevo.length > 0 && (
                <>
                  <span className="rpt__subtitulo-inv">🔵 Piezas Nuevas — {stockBajoNuevo.length} producto(s)</span>
                  <TablaStockBajo lista={stockBajoNuevo} />
                </>
              )}

              {stockBajoUsado.length > 0 && (
                <div style={{ marginTop: 20 }}>
                  <span className="rpt__subtitulo-inv">🟠 Piezas Usadas — {stockBajoUsado.length} producto(s)</span>
                  <TablaStockBajo lista={stockBajoUsado} />
                </div>
              )}
            </div>
          ) : (
            <div className="rpt__empty-verde">
              ✅ ¡Todos los productos tienen stock suficiente!
            </div>
          )}

          {stockActual.length > 0 && (
            <div className="rpt__seccion">
              <h2 className="rpt__seccion-h2">🏭 Stock Actual Completo</h2>
              <table className="rpt__table">
                <thead>
                  <tr>
                    <th>Código</th><th>Producto</th><th>Inventario</th>
                    <th>Stock</th><th>Precio</th><th>Costo</th><th>Valor en Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {stockActual.map((p, i) => (
                    <tr key={i} className={p.stock === 0 ? "rpt__fila-agotado" : p.stock <= 5 ? "rpt__fila-bajo" : ""}>
                      <td>{p.codigo}</td>
                      <td>{p.nombre}</td>
                      <td>
                        <span className={p.tipo_inventario === "nuevo" ? "rpt__badge-nuevo" : "rpt__badge-usado"}>
                          {p.tipo_inventario === "nuevo" ? "🔵 Nuevo" : "🟠 Usado"}
                        </span>
                      </td>
                      <td>
                        <span className={p.stock === 0 ? "rpt__stock-cero" : p.stock <= 2 ? "rpt__stock-critico" : p.stock <= 5 ? "rpt__stock-bajo" : ""}>
                          {p.stock}{p.stock <= 5 ? " ⚠️" : ""}
                        </span>
                      </td>
                      <td>RD$ {fmt(p.precio)}</td>
                      <td>RD$ {fmt(p.costo)}</td>
                      <td className="rpt__td-ganancia">RD$ {fmt(p.valor_inventario)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!stockActual.length && stockBajo.length === 0 && (
            <div className="rpt__empty">
              Presiona <strong>Generar Reporte</strong> para ver el stock actual.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Reportes;