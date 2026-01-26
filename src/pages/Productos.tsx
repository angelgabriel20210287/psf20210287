import { useState } from "react";
import "./Productos.css";

const Productos = () => {
  const [codigo, setCodigo] = useState("");
  const [nombre, setNombre] = useState("");
  const [categoria, setCategoria] = useState("");
  const [precio, setPrecio] = useState("");
  const [costo, setCosto] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const nuevoProducto = {
      codigo,
      nombre,
      categoria,
      precio,
      costo,
    };

    console.log("Producto agregado:", nuevoProducto);

    // Limpiar formulario
    setCodigo("");
    setNombre("");
    setCategoria("");
    setPrecio("");
    setCosto("");
  };

  return (
    <div className="productos-container">
      <h2>Registro de Productos</h2>

      <form className="productos-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="codigo">Código</label>
          <input
            id="codigo"
            type="text"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="nombre">Nombre del producto</label>
          <input
            id="nombre"
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="categoria">Categoría</label>
          <input
            id="categoria"
            type="text"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
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
          />
        </div>

        <button type="submit" className="btn-guardar">
          Guardar Producto
        </button>
      </form>
    </div>
  );
};

export default Productos;
