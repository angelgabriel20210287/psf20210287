import { useFacturas } from "../Context/FacturaContext";
import "./Historial.css";

const Historial = () => {
  const { facturas, eliminarFactura } = useFacturas();

  return (
    <div className="historial-container">
      <h2>Historial de Ventas</h2>

      {facturas.length === 0 ? (
        <p>No hay ventas registradas</p>
      ) : (
        facturas.map((f) => (
          <div key={f.id} className="factura-card">
            <h3>Factura {f.numero}</h3>

            <p><strong>Fecha:</strong> {f.fecha}</p>

            <p><strong>Cliente:</strong> {f.cliente.nombre}</p>
            <p><strong>Teléfono:</strong> {f.cliente.telefono}</p>
            <p><strong>Dirección:</strong> {f.cliente.direccion}</p>

            <table>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Cant.</th>
                  <th>Precio</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {f.detalles.map((d, i) => (
                  <tr key={i}>
                    <td>{d.nombre}</td>
                    <td>{d.cantidad}</td>
                    <td>RD$ {d.precio}</td>
                    <td>RD$ {d.subtotal}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h4>Total: RD$ {f.total}</h4>

            {/* 🗑️ BOTÓN ELIMINAR */}
            <button
              className="btn-eliminar"
              onClick={() => {
                if (confirm("¿Eliminar esta factura del historial?")) {
                  eliminarFactura(f.id);
                }
              }}
            >
              Eliminar factura
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default Historial;
