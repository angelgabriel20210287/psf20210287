import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import "./Layout.css";

interface Props {
  setAutenticado: (valor: boolean) => void;
}

const Layout = ({ setAutenticado }: Props) => {
  return (
    <div className="layout">
      <Header setAutenticado={setAutenticado} />
      <div className="body">
        <Sidebar />
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
