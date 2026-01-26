import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import "./Layout.css";

const Layout = () => {
  return (
    <div className="layout">
      <Header />
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
