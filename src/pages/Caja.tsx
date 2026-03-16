import { useEffect, useState } from "react";
import api from "../api/axios";
import "./Caja.css";

interface Caja {
  idcaja: number;
  usuario: string;
  fecha_apertura: string;
  fecha_cierre?: string;
  monto_inicial: number;
  monto_final?: number;
  estado: string;
}

const Caja = () => {
  const [caja, setCaja] = useState<Caja | null>(null);
  const [historial, setHistorial] = useState<Caja[]>([]);
  const [montoInicial, setMontoInicial] = useState(0);
  const [montoFinal, setMontoFinal] = useState(0);

  const authData = JSON.parse(localStorage.getItem("auth") || "{}");

  const cargarDatos = async () => {
    try {
      const [resActual, resHistorial] = await Promise.all([
        api.get("/api/caja/actual"),
        api.get("/api/caja/historial")
      ]);
      setCaja(resActual.data);
      setHistorial(resHistorial.data);
    } catch (error) {
      console.error("Error cargando datos de caja", error);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const abrirCaja = async () => {
    try {
      await api.post("/api/caja/abrir", {
        usuario: authData.usuario,
        monto_inicial: montoInicial,
      });
      alert("Caja abierta correctamente");
      setMontoInicial(0);
      cargarDatos();
    } catch (error: any) {
      alert(error.response?.data?.message || "Error al abrir caja");
    }
  };

  const cerrarCaja = async () => {
    if (!caja) return;
    try {
      const res = await api.post("/api/caja/cerrar", {
        idcaja: caja.idcaja,
        monto_final: montoFinal,
        usuario_cierre: authData.usuario,
      });
      alert(`Caja cerrada. Total ventas: RD$ ${res.data.totalventas}`);
      setMontoFinal(0);
      cargarDatos();
    } catch (error) {
      alert("Error al cerrar caja");
    }
  };

  return (
    <div className="caja-contenedor-principal">
      <h2>Control de Caja</h2>

      <div className="caja-seccion-operacion">
        {!caja && (
          <div className="caja-card-apertura">
            <h3>Apertura de Turno</h3>
            <input
              type="number"
              placeholder="Monto inicial (RD$)"
              value={montoInicial}
              onChange={(e) => setMontoInicial(Number(e.target.value))}
            />
            <button onClick={abrirCaja} className="caja-btn-abrir">Abrir Caja</button>
          </div>
        )}

        {caja && (
          <div className="caja-card-cerrar">
            <div className="caja-badge-abierta">CAJA ABIERTA</div>
            <p><strong>Cajero:</strong> {caja.usuario}</p>
            <p><strong>Iniciado el:</strong> {new Date(caja.fecha_apertura).toLocaleString()}</p>
            <p><strong>Monto Inicial:</strong> RD$ {Number(caja.monto_inicial).toFixed(2)}</p>
            <hr />
            <h3>Cerrar Turno</h3>
            <label>Monto contado físicamente:</label>
            <input
              type="number"
              placeholder="Total en efectivo"
              value={montoFinal}
              onChange={(e) => setMontoFinal(Number(e.target.value))}
            />
            <button onClick={cerrarCaja} className="caja-btn-cerrar">Cerrar Caja ahora</button>
          </div>
        )}
      </div>

      <div className="caja-card-historial">
        <h3>Historial de Cierres de Caja</h3>
        <table className="caja-tabla-datos">
          <thead>
            <tr>
              <th>Cajero</th>
              <th>Apertura</th>
              <th>Cierre</th>
              <th>Monto Inicial</th>
              <th>Monto Final</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {historial.map((reg) => (
              <tr key={reg.idcaja}>
                <td>{reg.usuario}</td>
                <td>{new Date(reg.fecha_apertura).toLocaleString()}</td>
                <td>{reg.fecha_cierre ? new Date(reg.fecha_cierre).toLocaleString() : '---'}</td>
                <td>RD$ {Number(reg.monto_inicial).toFixed(2)}</td>
                <td>RD$ {reg.monto_final ? Number(reg.monto_final).toFixed(2) : '---'}</td>
                <td><span className={`caja-badge-estado ${reg.estado}`}>{reg.estado}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Caja;