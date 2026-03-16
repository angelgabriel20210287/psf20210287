import logo from "../assets/Logo.png";
import "./Factura.css";

interface FacturaData {
  numerofactura?: string;
  numero?: string;
  fecha: string | Date;
  cliente?: {
    nombre: string;
    telefono: string;
    direccion: string;
  };
  detalles: any[];
  total: number | string;
  pago?: number | string;
}

interface Props {
  factura: FacturaData;
}

const FacturaPrint = ({ factura }: Props) => {
  // Función robusta para formatear fechas sin errores
  const formatearFecha = (fecha: any) => {
    try {
      const d = new Date(fecha);
      if (isNaN(d.getTime())) throw new Error("Fecha inválida");
      return d.toLocaleString("es-DO", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return new Date().toLocaleString("es-DO");
    }
  };

  return (
    <div className="factura">
      <div className="top-section">
        <div className="logo-box">
          <img src={logo} alt="Logo" />
          <p>Repuestos Ringo</p>
        </div>

        <div className="factura-info">
          <h1>FACTURA</h1>
          {/* Prioriza numerofactura de la DB, luego el del context, luego S/N */}
          <p>
            <strong>N°:</strong> {factura.numerofactura || factura.numero || "S/N"}
          </p>
          <p>
            <strong>Fecha:</strong> {formatearFecha(factura.fecha)}
          </p>
        </div>
      </div>

      <div className="cliente-section">
        <p>
          <strong>Nombre:</strong> {factura.cliente?.nombre || "Consumidor Final"}
        </p>
        <p>
          <strong>Teléfono:</strong> {factura.cliente?.telefono || "N/A"}
        </p>
        <p>
          <strong>Dirección:</strong> {factura.cliente?.direccion || "N/A"}
        </p>
      </div>

      <table className="tabla">
        <thead>
          <tr>
            <th>Descripción</th>
            <th>Precio</th>
            <th>Cant.</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {(factura.detalles || []).map((item: any, index: number) => (
            <tr key={index}>
              <td>{item.nombre || item.producto}</td>
              <td>RD$ {Number(item.precio || 0).toFixed(2)}</td>
              <td>{item.cantidad}</td>
              <td>RD$ {Number(item.subtotal || (item.precio * item.cantidad)).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="totales">
        <div>
          <span>SUBTOTAL</span>
          <span>RD$ {Number(factura.total).toFixed(2)}</span>
        </div>
        <div>
          <span>PAGO</span>
          <span>RD$ {Number(factura.pago || 0).toFixed(2)}</span>
        </div>
        <div className="total-final">
          <span>TOTAL</span>
          <span>RD$ {Number(factura.total).toFixed(2)}</span>
        </div>
      </div>

      <div className="footer">
        <p>Factura al contado</p>
        <p>Gracias por su compra</p>
        <p>Este documento es un comprobante de venta.</p>
      </div>
    </div>
  );
};

export default FacturaPrint;