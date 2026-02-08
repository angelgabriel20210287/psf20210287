import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { ClienteProvider } from "./Context/ClienteContext";
import { FacturaProvider } from "./Context/FacturaContext";
import { ProductProvider } from "./Context/ProductContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ClienteProvider>
        <FacturaProvider>
          <ProductProvider>
            <App />
          </ProductProvider>
        </FacturaProvider>
      </ClienteProvider>
    </BrowserRouter>
  </React.StrictMode>
);