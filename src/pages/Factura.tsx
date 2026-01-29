import "./Factura.css";

interface FacturaItem {
  nombre: string;
  precio: number;
  cantidad: number;
  subtotal: number;
}

interface FacturaProps {
  items: FacturaItem[];
  total: number;
  pagoCon: number;
  cambio: number;
}

const Factura = ({ items, total, pagoCon, cambio }: FacturaProps) => {
  const fecha = new Date().toLocaleString();

  return (
    <div className="factura">
      <h2>Repuestos Ringo</h2>
      <p>Factura de Venta</p>
      <p>{fecha}</p>

      <hr />

      {items.map((item, index) => (
        <div key={index} className="factura-item">
          <span>{item.nombre}</span>
          <span>
            {item.cantidad} x ${item.precio}
          </span>
          <span>${item.subtotal}</span>
        </div>
      ))}

      <hr />

      <p>Total: ${total}</p>
      <p>Pagó con: ${pagoCon}</p>
      <p>Cambio: ${cambio}</p>

      <hr />
      <p className="gracias">¡Gracias por su compra!</p>
    </div>
  );
};

export default Factura;