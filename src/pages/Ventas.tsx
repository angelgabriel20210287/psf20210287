import "./Ventas.css";

const Ventas = () => {
  return (
    <div className="ventas-container">
      {/* ENCABEZADO */}
      <h2 className="ventas-title">Registro de Ventas</h2>

      {/* DATOS DE LA VENTA */}
      <div className="ventas-form">
        <div className="input-group">
          <label htmlFor="producto">Producto</label>
          <input
            type="text"
            id="producto"
            placeholder="Buscar producto"
          />
        </div>

        <div className="input-group">
          <label htmlFor="cantidad">Cantidad</label>
          <input
            type="number"
            id="cantidad"
            placeholder="0"
            min={1}
          />
        </div>

        <div className="input-group">
          <label htmlFor="precio">Precio</label>
          <input
            type="number"
            id="precio"
            placeholder="0.00"
            step="0.01"
          />
        </div>

        <div className="input-group">
          <label htmlFor="fecha">Fecha</label>
          <input type="date" id="fecha" />
        </div>

        <div className="input-group">
          <label>&nbsp;</label>
          <button className="btn-agregar">
            Agregar
          </button>
        </div>
      </div>

      {/* TABLA DE PRODUCTOS */}
      <div className="ventas-tabla">
        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Precio</th>
              <th>Subtotal</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={5} style={{ textAlign: "center" }}>
                No hay productos agregados
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* TOTALES */}
      <div className="ventas-totales">
        <div>
          <strong>Subtotal:</strong> RD$ 0.00
        </div>
        <div>
          <strong>ITBIS (18%):</strong> RD$ 0.00
        </div>
        <div className="total">
          <strong>Total:</strong> RD$ 0.00
        </div>
      </div>

      {/* ACCIONES */}
      <div className="ventas-acciones">
        <button className="btn-cancelar">Cancelar</button>
        <button className="btn-guardar">Guardar Venta</button>
      </div>
    </div>
  );
};

export default Ventas;
