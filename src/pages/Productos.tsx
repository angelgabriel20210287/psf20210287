import { useState } from "react";
import { useProductos, type Product } from "../Context/ProductContext";
import "./Productos.css";

const Productos = () => {
  const { agregarProducto } = useProductos();

  const [codigo, setCodigo] = useState("");
  const [nombre, setNombre] = useState("");
  const [stock, setStock] = useState("");
  const [precio, setPrecio] = useState("");
  const [costo, setCosto] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const nuevoProducto: Product = {
      codigo,
      nombre,
      stock: Number(stock),
      precio: Number(precio),
      costo: Number(costo),
    };

    agregarProducto(nuevoProducto);

    setCodigo("");
    setNombre("");
    setStock("");
    setPrecio("");
    setCosto("");
  };

  return (
    <div className="productos-container">
      <h2>Registro de Productos</h2>

      <form className="productos-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="codigo">Código</label>
          <input id="codigo" value={codigo} onChange={(e) => setCodigo(e.target.value)} required />
        </div>

        <div className="form-group">
          <label htmlFor="nombre">Nombre del producto</label>
          <input id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
        </div>

        <div className="form-group">
          <label htmlFor="stock">Stock</label>
          <input
            id="stock"
            type="number"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="precio">Precio de venta</label>
          <input
            id="precio"
            type="number"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="costo">Costo</label>
          <input
            id="costo"
            type="number"
            value={costo}
            onChange={(e) => setCosto(e.target.value)}
            required
          />
        </div>

        <button type="submit">Guardar Producto</button>
      </form>
    </div>
  );
};

export default Productos;