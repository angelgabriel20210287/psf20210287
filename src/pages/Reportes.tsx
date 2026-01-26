import "./Reportes.css";

const Reportes = () => {
  return (
    <div className="reportes-container">
      <h2>Reportes</h2>

      {/* Filtros */}
      <div className="reportes-filtros">
        <div className="filtro">
          <label htmlFor="fechaInicio">Desde</label>
          <input type="date" id="fechaInicio" />
        </div>

        <div className="filtro">
          <label htmlFor="fechaFin">Hasta</label>
          <input type="date" id="fechaFin" />
        </div>

        <button className="btn-generar">Generar Reporte</button>
      </div>

      {/* Resumen */}
      <div className="reportes-resumen">
        <div className="resumen-card">
          <h4>Total Ventas</h4>
          <p>RD$ 0.00</p>
        </div>

        <div className="resumen-card">
          <h4>Ventas del Día</h4>
          <p>RD$ 0.00</p>
        </div>

        <div className="resumen-card">
          <h4>Facturas Emitidas</h4>
          <p>0</p>
        </div>
      </div>

      {/* Sección visual */}
      <div className="reportes-detalle">
        <h3>Productos más vendidos</h3>

        <div className="productos-vendidos">
          <div className="producto-item">
            <span>Producto A</span>
            <span>0 unidades</span>
          </div>

          <div className="producto-item">
            <span>Producto B</span>
            <span>0 unidades</span>
          </div>

          <div className="producto-item">
            <span>Producto C</span>
            <span>0 unidades</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reportes;
