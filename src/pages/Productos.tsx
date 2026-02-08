import { useEffect, useState } from "react";
import api from "../api/axios";
import "./Productos.css";

interface Product {
  idproducto?: number;
  codigo: string;
  nombre: string;
  stock: number;
  precio: number;
  costo: number;
}

const Productos = () => {
  const [productos, setProductos] = useState<Product[]>([]);
  const [productoEditando, setProductoEditando] = useState<Product | null>(null);

  const [codigo, setCodigo] = useState("");
  const [nombre, setNombre] = useState("");
  const [stock, setStock] = useState("");
  const [precio, setPrecio] = useState("");
  const [costo, setCosto] = useState("");

  // 🔹 Obtener productos desde PostgreSQL
  const cargarProductos = async () => {
    const response = await api.get("/productos");
    setProductos(response.data);
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  // 🔹 Guardar / Actualizar producto
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nuevoProducto = {
      codigo,
      nombre,
      stock: Number(stock),
      precio: Number(precio),
      costo: Number(costo),
    };

    if (productoEditando) {
      await api.put(`/productos/${productoEditando.idproducto}`, nuevoProducto);
      setProductoEditando(null);
    } else {
      await api.post("/productos", nuevoProducto);
    }

    cargarProductos();
    limpiarFormulario();
  };

  // 🔹 Editar producto
  const handleEditar = (p: Product) => {
    setProductoEditando(p);
    setCodigo(p.codigo);
    setNombre(p.nombre);
    setStock(String(p.stock));
    setPrecio(String(p.precio));
    setCosto(String(p.costo));
  };

  // 🔹 Eliminar producto
  const handleEliminar = async (id: number) => {
    const confirmar = confirm("¿Seguro que deseas eliminar este producto?");
    if (!confirmar) return;

    await api.delete(`/productos/${id}`);
    cargarProductos();
  };

  // 🔹 Limpiar formulario
  const limpiarFormulario = () => {
    setCodigo("");
    setNombre("");
    setStock("");
    setPrecio("");
    setCosto("");
  };

  return (
    <div className="productos-container">
      <h2>{productoEditando ? "Editar Producto" : "Registro de Productos"}</h2>

      <form className="productos-form" onSubmit={handleSubmit}>
        <input
          placeholder="Código"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          required
        />

        <input
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />

        <input
          type="number"
          placeholder="Stock"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          required
        />

        <input
          type="number"
          placeholder="Precio"
          value={precio}
          onChange={(e) => setPrecio(e.target.value)}
          required
        />

        <input
          type="number"
          placeholder="Costo"
          value={costo}
          onChange={(e) => setCosto(e.target.value)}
          required
        />

        <button type="submit">
          {productoEditando ? "Actualizar" : "Guardar Producto"}
        </button>
      </form>

      <hr />

      <h3>Listado de Productos</h3>
      <ul>
        {productos.map((p) => (
          <li key={p.idproducto}>
            {p.codigo} - {p.nombre} | Stock: {p.stock}
            <button onClick={() => handleEditar(p)}>✏️</button>
            <button onClick={() => handleEliminar(p.idproducto!)}>🗑</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Productos;
