import "./Home.css";
import logo from "../assets/react.svg"; // ajusta la ruta

const Home = () => {
  return (
    <div className="home-container">
      <img src={logo} alt="Repuestos Ringo" className="home-logo" />

      <h1>Repuestos Ringo</h1>
      <h2>Sistema de Facturación</h2>

      <p>
        Administra ventas, inventario, productos y reportes
        de forma rápida y segura.
      </p>

     
    </div>
  );
};

export default Home;