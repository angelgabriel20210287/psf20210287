import type { Factura as FacturaType } from "../Context/FacturaContext";
import "./Factura.css";

interface Props {
  factura: FacturaType;
}

const FacturaPrint = ({ factura }: Props) => {
  return (
    <div className="factura">
      <h2>Repuestos Ringo</h2>
      <p>Factura de Venta</p>
      <p>{factura.fecha}</p>

      <p><strong>Cliente:</strong> {factura.cliente.nombre}</p>
      <p><strong>Teléfono:</strong> {factura.cliente.telefono}</p>
      <p><strong>Dirección:</strong> {factura.cliente.direccion}</p>

      <hr />

      {factura.detalles.map((item, index) => (
        <div key={index} className="factura-item">
          <span>{item.nombre}</span>
          <span>{item.cantidad} x RD$ {item.precio}</span>
          <span>RD$ {item.subtotal}</span>
        </div>
      ))}

      <hr />

      <p>Total: RD$ {factura.total}</p>
      <p>Pagó con: RD$ {factura.pago}</p>
      <p>Cambio: RD$ {factura.cambio}</p>

      <p className="gracias">¡Gracias por su compra!</p>
    </div>
  );
};

export default FacturaPrint;