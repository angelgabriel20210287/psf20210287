import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { ClienteProvider } from "./Context/ClienteContext";
import { FacturaProvider } from "./Context/FacturaContext";
import { ProductProvider } from "./Context/ProductContext";
import logo from './assets/Logo.png'

// 2. Esta pequeña función inyecta el logo como favicon al cargar la app
const setFavicon = (url: string) => {
  let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.getElementsByTagName('head')[0].appendChild(link);
  }
  link.href = url;
};

setFavicon(logo);


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