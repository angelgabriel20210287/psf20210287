import "./Inventario.css";

const Inventario = () => {
  return (
    <div className="inventario-container">
      {/* ENCABEZADO */}
      <h2 className="inventario-title">Inventario de Productos</h2>

      {/* BUSCADOR */}
      <div className="inventario-search">
        <input
          type="text"
          placeholder="Buscar producto..."
        />
      </div>

      {/* TABLA */}
      <div className="inventario-table">
        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Producto</th>
              <th>Stock</th>
              <th>Stock Mínimo</th>
              <th>Estado</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={6} style={{ textAlign: "center" }}>
                No hay productos registrados
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Inventario;
