import { useEffect, useState } from "react";
import api from "../api/axios";
import FacturaPrint from "./Factura";
import "./Historial.css";

interface FacturaLista {
  idfactura: number;
  numerofactura: string;
  fecha: string;
  total: number | string;
  cliente: string;
}

const Historial = () => {
  const [facturas, setFacturas] = useState<FacturaLista[]>([]);
  const [facturaPrint, setFacturaPrint] = useState<any>(null);

  useEffect(() => {
    cargarHistorial();
  }, []);

  // EFECTO CRÍTICO: Dispara la impresión solo cuando el estado facturaPrint cambia
  useEffect(() => {
    if (facturaPrint) {
      const timer = setTimeout(() => {
        window.print();
        setFacturaPrint(null); // Limpiamos para la próxima impresión
      }, 500); // 500ms para asegurar renderizado de imagen/logo
      return () => clearTimeout(timer);
    }
  }, [facturaPrint]);

  const cargarHistorial = async () => {
    try {
      const res = await api.get("/historial");
      setFacturas(res.data);
    } catch (error) {
      console.error("Error al cargar historial:", error);
    }
  };

  const eliminarFactura = async (id: number) => {
    const ok = window.confirm("¿Seguro que deseas eliminar esta factura?");
    if (!ok) return;
    await api.delete(`/historial/${id}`);
    setFacturas(prev => prev.filter(f => f.idfactura !== id));
  };

  const reimprimir = async (id: number) => {
    try {
      const res = await api.get(`/historial/${id}`);
      setFacturaPrint(res.data); 
    } catch (error) {
      console.error("Error al obtener datos de factura:", error);
    }
  };

  return (
    <div className="historial-container">
      <h2>Historial de Ventas</h2>

      <table className="historial-table">
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
              <td>RD$ {Number(f.total).toFixed(2)}</td>
              <td>
                <button className="btn-reimprimir" onClick={() => reimprimir(f.idfactura)}>
                  Reimprimir
                </button>
                <button className="btn-eliminar" onClick={() => eliminarFactura(f.idfactura)}>
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Renderizado condicional para impresión */}
      {facturaPrint && (
        <div className="print-only-wrapper">
          <FacturaPrint factura={facturaPrint} />
        </div>
      )}
    </div>
  );
};

export default Historial;