import { createContext, useContext, useState } from "react";

/* =====================
   TIPOS
===================== */

export interface Cliente {
  id: number;
  nombre: string;
  telefono: string;
  direccion: string;
}

interface ClienteContextType {
  clientes: Cliente[];
  agregarCliente: (cliente: Omit<Cliente, "id">) => void;
  actualizarCliente: (cliente: Cliente) => void; // ✅
  eliminarCliente: (id: number) => void;         // ✅
  obtenerClientePorId: (id: number | null) => Cliente | null;
}

/* =====================
   CONTEXT
===================== */

const ClienteContext = createContext<ClienteContextType | undefined>(undefined);

/* =====================
   PROVIDER
===================== */

export const ClienteProvider = ({ children }: { children: React.ReactNode }) => {
  const [clientes, setClientes] = useState<Cliente[]>([]);

  const agregarCliente = (cliente: Omit<Cliente, "id">) => {
    setClientes((prev) => [
      ...prev,
      {
        id: Date.now(),
        ...cliente,
      },
    ]);
  };

  const actualizarCliente = (clienteActualizado: Cliente) => {
    setClientes((prev) =>
      prev.map((c) => (c.id === clienteActualizado.id ? clienteActualizado : c))
    );
  };

  const eliminarCliente = (id: number) => {
    setClientes((prev) => prev.filter((c) => c.id !== id));
  };

  const obtenerClientePorId = (id: number | null) => {
    if (!id) return null;
    return clientes.find((c) => c.id === id) ?? null;
  };

  return (
    <ClienteContext.Provider
      value={{
        clientes,
        agregarCliente,
        actualizarCliente,
        eliminarCliente,
        obtenerClientePorId,
      }}
    >
      {children}
    </ClienteContext.Provider>
  );
};

/* =====================
   HOOK
===================== */

export const useClientes = () => {
  const context = useContext(ClienteContext);
  if (!context) {
    throw new Error("useClientes debe usarse dentro del ClienteProvider");
  }
  return context;
};
