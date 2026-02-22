import { useEffect, useState } from "react";
import api from "../api/axios";
import FacturaPrint from "./Factura";
import "./Historial.css";

interface FacturaLista {
  idfactura: number;
  numerofactura: string;
  fecha: string;
  total: number;
  cliente: string;
}

const Historial = () => {
  const [facturas, setFacturas] = useState<FacturaLista[]>([]);
  const [facturaPrint, setFacturaPrint] = useState<any>(null);

  useEffect(() => {
    cargarHistorial();
  }, []);

  const cargarHistorial = async () => {
    const res = await api.get("/historial");
    setFacturas(res.data);
  };

  const eliminarFactura = async (id: number) => {
    const ok = window.confirm("¿Seguro que deseas eliminar esta factura?");
    if (!ok) return;

    await api.delete(`/historial/${id}`);
    setFacturas(prev => prev.filter(f => f.idfactura !== id));
  };

  const reimprimir = async (id: number) => {
    const res = await api.get(`/historial/${id}`);
    setFacturaPrint(res.data);

    setTimeout(() => {
      window.print();
      setFacturaPrint(null);
    }, 300);
  };

  return (
    <div className="historial">
      <h2>Historial de Ventas</h2>

      <table>
        <thead>
          <tr>
            <th># Factura</th>
            <th>Cliente</th>
            <th>Fecha</th>
            <th>Total</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {facturas.map(f => (
            <tr key={f.idfactura}>
              <td>{f.numerofactura}</td>
              <td>{f.cliente}</td>
              <td>{new Date(f.fecha).toLocaleDateString()}</td>
              <td>${f.total}</td>
              <td>
                <button
                  className="btn-reimprimir"
                  onClick={() => reimprimir(f.idfactura)}
                >
                  Reimprimir
                </button>

                <button
                  className="btn-eliminar"
                  onClick={() => eliminarFactura(f.idfactura)}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 👉 SOLO se renderiza para impresión */}
      {facturaPrint && <FacturaPrint factura={facturaPrint} />}
    </div>
  );
};

export default Historial;
