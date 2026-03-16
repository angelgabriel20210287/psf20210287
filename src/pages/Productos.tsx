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
  idproveedor?: number | null;
  proveedor?: string; // viene del JOIN
}

interface Proveedor {
  idproveedor: number;
  nombre: string;
}

const Productos = () => {
  const [productos, setProductos] = useState<Product[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [productoEditando, setProductoEditando] = useState<Product | null>(null);

  const [codigo, setCodigo] = useState("");
  const [nombre, setNombre] = useState("");
  const [stock, setStock] = useState("");
  const [precio, setPrecio] = useState("");
  const [costo, setCosto] = useState("");
  const [idproveedor, setIdproveedor] = useState("");

  // 🔹 Función para pedir el siguiente código al servidor
  const sugerirCodigo = async () => {
    try {
      const res = await api.get("/productos/next-code");
      setCodigo(res.data.nextCode);
    } catch (error) {
      console.error("Error al obtener código sugerido", error);
    }
  };

  // 🔹 Cargar productos
  const cargarProductos = async () => {
    const response = await api.get("/productos");
    setProductos(response.data);
  };

  // 🔹 Cargar proveedores
  const cargarProveedores = async () => {
    const response = await api.get("/proveedores");
    setProveedores(response.data);
  };

  useEffect(() => {
    cargarProductos();
    cargarProveedores();
    sugerirCodigo(); // 🔥 Sugerir código al cargar el componente
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
      idproveedor: idproveedor ? Number(idproveedor) : null,
    };

    try {
      if (productoEditando) {
        await api.put(
          `/productos/${productoEditando.idproducto}`,
          nuevoProducto
        );
        setProductoEditando(null);
      } else {
        await api.post("/productos", nuevoProducto);
      }

      await cargarProductos();
      limpiarFormulario();
      // Solo sugerimos nuevo código si no estamos editando
      if (!productoEditando) {
        sugerirCodigo();
      }
    } catch (error) {
      console.error("Error al guardar producto", error);
      alert("Error al procesar la solicitud");
    }
  };

  // 🔹 Editar producto
  const handleEditar = (p: Product) => {
    setProductoEditando(p);
    setCodigo(p.codigo);
    setNombre(p.nombre);
    setStock(String(p.stock));
    setPrecio(String(p.precio));
    setCosto(String(p.costo));
    setIdproveedor(p.idproveedor ? String(p.idproveedor) : "");
  };

  // 🔹 Eliminar producto
  const handleEliminar = async (id: number) => {
    const confirmar = window.confirm(
      "¿Seguro que deseas eliminar este producto?"
    );
    if (!confirmar) return;

    await api.delete(`/productos/${id}`);
    cargarProductos();
    // Actualizamos la sugerencia de código por si el eliminado era el último
    sugerirCodigo();
  };

  // 🔹 Limpiar formulario
  const limpiarFormulario = () => {
    setCodigo(""); 
    setNombre("");
    setStock("");
    setPrecio("");
    setCosto("");
    setIdproveedor("");
    setProductoEditando(null);
  };

  return (
    <div className="productos-container">
      <h2>
        {productoEditando ? "Editar Producto" : "Registro de Productos"}
      </h2>

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

        {/* 🔹 Selector de proveedor */}
        <select
          value={idproveedor}
          onChange={(e) => setIdproveedor(e.target.value)}
        >
          <option value="">Sin proveedor</option>
          {proveedores.map((prov) => (
            <option key={prov.idproveedor} value={prov.idproveedor}>
              {prov.nombre}
            </option>
          ))}
        </select>

        <div className="form-buttons">
          <button type="submit">
            {productoEditando ? "Actualizar" : "Guardar Producto"}
          </button>
          
          {productoEditando && (
            <button type="button" onClick={limpiarFormulario}>
              Cancelar Edición
            </button>
          )}
        </div>
      </form>

      <hr />

      <h3>Listado de Productos</h3>
      <ul>
        {productos.map((p) => (
          <li key={p.idproducto}>
            <strong>{p.codigo}</strong> - {p.nombre} | Stock: {p.stock} | 
            Proveedor: {p.proveedor || "Sin proveedor"}

            <div className="list-actions">
              <button onClick={() => handleEditar(p)}>✏️</button>
              <button onClick={() => handleEliminar(p.idproducto!)}>
                🗑
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Productos;