import { createContext, useContext, useState } from "react";

/* =====================
   TIPOS
===================== */

export interface ClienteFactura {
  nombre: string;
  telefono: string;
  direccion: string;
}

export interface DetalleFactura {
  codigo: string;
  nombre: string;
  precio: number;
  cantidad: number;
  subtotal: number;
}

export interface Factura {
  id: number;
  numero: string; // #0001, #0002
  cliente: ClienteFactura;
  fecha: string;
  total: number;
  pago: number;
  cambio: number;
  detalles: DetalleFactura[];
}

interface FacturaContextType {
  facturas: Factura[];
  agregarFactura: (factura: Omit<Factura, "numero">) => void;
  eliminarFactura: (id: number) => void; // ✅ NUEVO
}

/* =====================
   CONTEXT
===================== */

const FacturaContext = createContext<FacturaContextType | undefined>(undefined);

/* =====================
   UTILIDAD: NÚMERO FACTURA
===================== */

const obtenerNumeroFactura = (): string => {
  const ultimo = localStorage.getItem("numeroFactura");
  const siguiente = ultimo ? Number(ultimo) + 1 : 1;

  localStorage.setItem("numeroFactura", String(siguiente));

  return `#${String(siguiente).padStart(4, "0")}`;
};

/* =====================
   PROVIDER
===================== */

export const FacturaProvider = ({ children }: { children: React.ReactNode }) => {
  const [facturas, setFacturas] = useState<Factura[]>([]);

  const agregarFactura = (factura: Omit<Factura, "numero">) => {
    const nuevaFactura: Factura = {
      ...factura,
      numero: obtenerNumeroFactura(),
    };

    setFacturas((prev) => [...prev, nuevaFactura]);
  };

  // 🗑️ ELIMINAR FACTURA
  const eliminarFactura = (id: number) => {
    setFacturas((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <FacturaContext.Provider
      value={{ facturas, agregarFactura, eliminarFactura }}
    >
      {children}
    </FacturaContext.Provider>
  );
};

/* =====================
   HOOK
===================== */

export const useFacturas = () => {
  const context = useContext(FacturaContext);
  if (!context) {
    throw new Error("useFacturas debe usarse dentro del FacturaProvider");
  }
  return context;
};
