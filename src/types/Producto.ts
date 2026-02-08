export interface Producto {
  idproducto: number;
  codigo: string;
  nombre: string;
  stock: number;
  precio: string; // viene como string desde PostgreSQL
  costo: string;
}
