import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

export interface Product {
  codigo: string;
  nombre: string;
  stock: number;
  precio: number;
  costo: number;
}

interface ProductContextType {
  productos: Product[];
  agregarProducto: (producto: Product) => void;
  eliminarProducto: (codigo: string) => void;
  actualizarProducto: (producto: Product) => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [productos, setProductos] = useState<Product[]>([]);

  const agregarProducto = (producto: Product) => {
    setProductos((prev) => [...prev, producto]);
  };

  const eliminarProducto = (codigo: string) => {
    setProductos((prev) => prev.filter((p) => p.codigo !== codigo));
  };

  const actualizarProducto = (productoActualizado: Product) => {
    setProductos((prev) =>
      prev.map((p) =>
        p.codigo === productoActualizado.codigo ? productoActualizado : p
      )
    );
  };

  return (
    <ProductContext.Provider
      value={{ productos, agregarProducto, eliminarProducto, actualizarProducto }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProductos = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error("useProductos debe usarse dentro de ProductProvider");
  }
  return context;
};