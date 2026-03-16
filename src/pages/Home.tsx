import { useEffect, useState } from "react";
import api from "../api/axios";
import "./Home.css";
import logoDefault from "../assets/Logo.png";

const Home = () => {

  const [productos, setProductos] = useState(0);
  const [clientes, setClientes] = useState(0);
  const [proveedores, setProveedores] = useState(0);
  const [empresa, setEmpresa] = useState<any>(null);

  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        const prod = await api.get("/productos/count");
        const cli = await api.get("/clientes/count");
        const prov = await api.get("/proveedores/count");
        const emp = await api.get("/empresa");

        setProductos(prod.data.total);
        setClientes(cli.data.total);
        setProveedores(prov.data.total);
        setEmpresa(emp.data);
      } catch (error) {
        console.error("Error obteniendo datos:", error);
      }
    };

    obtenerDatos();
  }, []);

  return (
    <div className="home-container">

      <img
        src={empresa?.logo || logoDefault}
        alt={empresa?.nombre || "Empresa"}
        className="home-logo"
      />

      <h1>{empresa?.nombre || "Repuestos Ringo"}</h1>
      <h2>Sistema de Facturación</h2>

      {/* 🔹 Tarjetas de resumen */}
      <div className="dashboard-cards">

        <div className="card">
          <h3>Productos</h3>
          <p>{productos}</p>
        </div>

        <div className="card">
          <h3>Clientes</h3>
          <p>{clientes}</p>
        </div>

        <div className="card">
          <h3>Proveedores</h3>
          <p>{proveedores}</p>
        </div>

      </div>

      <p>
        Administra ventas, inventario, productos y reportes
        de forma rápida y segura.
      </p>
      <hr />

<div className="info-propietario">
  <h3>Propietario</h3>
  <p><strong>Nombre:</strong> {empresa?.propietario}</p>
  <p><strong>Teléfono:</strong> {empresa?.telefono}</p>
  <p><strong>Correo:</strong> {empresa?.correo}</p>
</div>

    </div>
    
  );
};

export default Home;