import { useEffect, useState } from "react";
import api from "../api/axios";
import FacturaPrint from "./Factura";
import "./Creditos.css";

interface Credito {
  idcredito: number;
  idfactura: number;
  numerofactura: string;
  cliente: string;
  telefono: string;
  total_deuda: number;
  total_pagado: number;
  saldo: number;
  estado: string;
  fecha_creacion: string;
}

interface Abono {
  idabono: number;
  monto: number;
  fecha: string;
  nota: string;
}

const Creditos = () => {
  const [creditos, setCreditos] = useState<Credito[]>([]);
  const [filtroEstado, setFiltroEstado] = useState("pendiente");
  const [creditoSeleccionado, setCreditoSeleccionado] = useState<Credito | null>(null);
  const [abonos, setAbonos] = useState<Abono[]>([]);
  const [montoAbono, setMontoAbono] = useState("");
  const [notaAbono, setNotaAbono] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  // 🔹 Para imprimir comprobante saldado
  const [comprobante, setComprobante] = useState<any>(null);

  // 🔹 Efecto que dispara la impresión cuando hay comprobante listo
  useEffect(() => {
    if (comprobante) {
      const timer = setTimeout(() => {
        window.print();
        setComprobante(null);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [comprobante]);

  // 🔹 Cargar créditos
  const cargarCreditos = async (estado: string) => {
    try {
      const res = await api.get(`/creditos?estado=${estado}`);
      setCreditos(res.data);
    } catch (error) {
      console.error("Error al cargar créditos", error);
    }
  };

  // 🔹 Cargar abonos de un crédito
  const cargarAbonos = async (idcredito: number) => {
    try {
      const res = await api.get(`/creditos/${idcredito}/abonos`);
      setAbonos(res.data);
    } catch (error) {
      console.error("Error al cargar abonos", error);
    }
  };

  useEffect(() => {
    cargarCreditos("pendiente");
  }, []);

  useEffect(() => {
    cargarCreditos(filtroEstado);
    setBusqueda("");
    setCreditoSeleccionado(null);
    setMostrarModal(false);
  }, [filtroEstado]);

  // 🔹 Abrir modal de abono
  const abrirModal = async (credito: Credito) => {
    setCreditoSeleccionado(credito);
    setMontoAbono("");
    setNotaAbono("");
    await cargarAbonos(credito.idcredito);
    setMostrarModal(true);
  };

  // 🔹 Cerrar modal
  const cerrarModal = () => {
    setMostrarModal(false);
    setCreditoSeleccionado(null);
    setAbonos([]);
    setMontoAbono("");
    setNotaAbono("");
  };

  // 🔹 Registrar abono
  const registrarAbono = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!creditoSeleccionado) return;

    const monto = Number(montoAbono);

    if (monto <= 0) {
      alert("El monto debe ser mayor a 0");
      return;
    }

    if (monto > Number(creditoSeleccionado.saldo)) {
      alert(`El abono (RD$ ${monto.toFixed(2)}) supera el saldo pendiente (RD$ ${Number(creditoSeleccionado.saldo).toFixed(2)})`);
      return;
    }

    try {
      const res = await api.post(`/creditos/${creditoSeleccionado.idcredito}/abonos`, {
        monto,
        nota: notaAbono,
      });

      // 🔹 Si quedó pagado — preguntar si imprimir comprobante
      if (res.data.estado === "pagado") {
        cerrarModal();
        await cargarCreditos(filtroEstado);

        const imprimirComprobante = window.confirm(
          "✅ ¡Cuenta saldada completamente!\n\n¿Desea imprimir el comprobante de cuenta saldada?"
        );

        if (imprimirComprobante) {
          const comprobanteRes = await api.get(
            `/creditos/${creditoSeleccionado.idcredito}/comprobante`
          );
          setComprobante(comprobanteRes.data);
        }
        return;
      }

      // Si sigue pendiente — actualizar modal
      setMontoAbono("");
      setNotaAbono("");
      await cargarAbonos(creditoSeleccionado.idcredito);
      await cargarCreditos(filtroEstado);

      // Actualizar datos del crédito en el modal
      setCreditoSeleccionado((prev) =>
        prev
          ? {
              ...prev,
              total_pagado: Number(prev.total_pagado) + monto,
              saldo: Number(prev.saldo) - monto,
            }
          : prev
      );

      alert(res.data.message);

    } catch (error: any) {
      alert(`❌ Error: ${error.response?.data?.error || "Error al registrar abono"}`);
    }
  };

  // 🔹 Imprimir comprobante de crédito ya pagado (desde la tabla)
  const imprimirComprobantePagado = async (credito: Credito) => {
    try {
      const res = await api.get(`/creditos/${credito.idcredito}/comprobante`);
      setComprobante(res.data);
    } catch (error) {
      alert("❌ Error al obtener el comprobante");
    }
  };

  // 🔹 Filtrar por búsqueda
  const creditosFiltrados = creditos.filter(
    (c) =>
      c.cliente.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.numerofactura.toLowerCase().includes(busqueda.toLowerCase())
  );

  // 🔹 Total pendiente
  const totalDeudaPendiente = creditos
    .filter((c) => c.estado === "pendiente")
    .reduce((sum, c) => sum + Number(c.saldo), 0);

  return (
    <div className="creditos-container">
      <h2>Módulo de Créditos</h2>

      {/* 🔹 RESUMEN */}
      {filtroEstado === "pendiente" && (
        <div className="creditos-resumen">
          <div className="resumen-card">
            <span className="resumen-label">Créditos Pendientes</span>
            <span className="resumen-valor">
              {creditos.filter((c) => c.estado === "pendiente").length}
            </span>
          </div>
          <div className="resumen-card resumen-rojo">
            <span className="resumen-label">Total por Cobrar</span>
            <span className="resumen-valor">RD$ {totalDeudaPendiente.toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* 🔹 FILTROS */}
      <div className="creditos-filtros">
        <button
          className={filtroEstado === "pendiente" ? "filtro-btn activo-pendiente" : "filtro-btn"}
          onClick={() => setFiltroEstado("pendiente")}
        >
          ⏳ Pendientes
        </button>
        <button
          className={filtroEstado === "pagado" ? "filtro-btn activo-pagado" : "filtro-btn"}
          onClick={() => setFiltroEstado("pagado")}
        >
          ✅ Pagados
        </button>
        <button
          className={filtroEstado === "todos" ? "filtro-btn activo-todos" : "filtro-btn"}
          onClick={() => setFiltroEstado("todos")}
        >
          📋 Todos
        </button>
      </div>

      {/* 🔹 BUSCADOR */}
      <input
        type="text"
        className="creditos-buscador"
        placeholder="Buscar por cliente o número de factura..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      {/* 🔹 TABLA */}
      <table className="creditos-table">
        <thead>
          <tr>
            <th>Factura</th>
            <th>Cliente</th>
            <th>Teléfono</th>
            <th>Deuda Total</th>
            <th>Pagado</th>
            <th>Saldo</th>
            <th>Fecha</th>
            <th>Estado</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {creditosFiltrados.length === 0 ? (
            <tr>
              <td colSpan={9} style={{ textAlign: "center", padding: 30, color: "#9ca3af" }}>
                No hay créditos{" "}
                {filtroEstado === "pendiente"
                  ? "pendientes"
                  : filtroEstado === "pagado"
                  ? "pagados"
                  : ""}.
              </td>
            </tr>
          ) : (
            creditosFiltrados.map((c) => (
              <tr key={c.idcredito} className={c.estado === "pagado" ? "fila-pagada" : ""}>
                <td>{c.numerofactura}</td>
                <td>{c.cliente}</td>
                <td>{c.telefono || "—"}</td>
                <td>RD$ {Number(c.total_deuda).toFixed(2)}</td>
                <td>RD$ {Number(c.total_pagado).toFixed(2)}</td>
                <td className={c.estado === "pendiente" ? "saldo-pendiente" : "saldo-pagado"}>
                  RD$ {Number(c.saldo).toFixed(2)}
                </td>
                <td>{new Date(c.fecha_creacion).toLocaleDateString()}</td>
                <td>
                  <span className={c.estado === "pendiente" ? "badge-pendiente" : "badge-pagado"}>
                    {c.estado === "pendiente" ? "⏳ Pendiente" : "✅ Pagado"}
                  </span>
                </td>
                <td className="acciones-td">
                  {c.estado === "pendiente" && (
                    <button className="btn-abonar" onClick={() => abrirModal(c)}>
                      💳 Abonar
                    </button>
                  )}
                  {c.estado === "pagado" && (
                    <>
                      <button className="btn-ver-abonos" onClick={() => abrirModal(c)}>
                        📄 Ver abonos
                      </button>
                      <button
                        className="btn-comprobante"
                        onClick={() => imprimirComprobantePagado(c)}
                      >
                        🖨️ Comprobante
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* 🔹 MODAL DE ABONO */}
      {mostrarModal && creditoSeleccionado && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-abono" onClick={(e) => e.stopPropagation()}>

            <div className="modal-header">
              <h3>
                {creditoSeleccionado.estado === "pagado"
                  ? "📄 Historial de Abonos"
                  : "💳 Registrar Abono"}
              </h3>
              <button className="modal-cerrar" onClick={cerrarModal}>✕</button>
            </div>

            {/* Info del crédito */}
            <div className="modal-info">
              <div className="info-row">
                <span>👤 Cliente:</span>
                <strong>{creditoSeleccionado.cliente}</strong>
              </div>
              <div className="info-row">
                <span>📄 Factura:</span>
                <strong>{creditoSeleccionado.numerofactura}</strong>
              </div>
              <div className="info-row">
                <span>💰 Deuda total:</span>
                <strong>RD$ {Number(creditoSeleccionado.total_deuda).toFixed(2)}</strong>
              </div>
              <div className="info-row">
                <span>✅ Total pagado:</span>
                <strong>RD$ {Number(creditoSeleccionado.total_pagado).toFixed(2)}</strong>
              </div>
              <div className="info-row saldo-row">
                <span>⏳ Saldo pendiente:</span>
                <strong className="saldo-destacado">
                  RD$ {Number(creditoSeleccionado.saldo).toFixed(2)}
                </strong>
              </div>

              {/* Barra de progreso */}
              <div className="progreso-barra-container">
                <div
                  className="progreso-barra"
                  style={{
                    width: `${Math.min(
                      (Number(creditoSeleccionado.total_pagado) /
                        Number(creditoSeleccionado.total_deuda)) *
                        100,
                      100
                    )}%`,
                  }}
                />
              </div>
              <p className="progreso-texto">
                {(
                  (Number(creditoSeleccionado.total_pagado) /
                    Number(creditoSeleccionado.total_deuda)) *
                  100
                ).toFixed(0)}
                % pagado
              </p>
            </div>

            {/* Historial de abonos */}
            {abonos.length > 0 && (
              <div className="abonos-historial">
                <h4>Historial de abonos</h4>
                <table className="abonos-table">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Monto</th>
                      <th>Nota</th>
                    </tr>
                  </thead>
                  <tbody>
                    {abonos.map((a) => (
                      <tr key={a.idabono}>
                        <td>{new Date(a.fecha).toLocaleString()}</td>
                        <td>RD$ {Number(a.monto).toFixed(2)}</td>
                        <td>{a.nota || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Formulario de abono — solo si está pendiente */}
            {creditoSeleccionado.estado === "pendiente" && (
              <form className="abono-form" onSubmit={registrarAbono}>
                <h4>Nuevo abono</h4>
                <input
                  type="number"
                  placeholder={`Monto (máx. RD$ ${Number(creditoSeleccionado.saldo).toFixed(2)})`}
                  value={montoAbono}
                  onChange={(e) => setMontoAbono(e.target.value)}
                  required
                  min="1"
                  max={Number(creditoSeleccionado.saldo)}
                  step="0.01"
                />
                <input
                  type="text"
                  placeholder="Nota (opcional)"
                  value={notaAbono}
                  onChange={(e) => setNotaAbono(e.target.value)}
                />
                <div className="abono-botones">
                  <button type="submit" className="btn-confirmar-abono">
                    ✅ Confirmar Abono
                  </button>
                  <button type="button" className="btn-cancelar" onClick={cerrarModal}>
                    Cancelar
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 🔹 COMPROBANTE PARA IMPRIMIR — invisible en pantalla */}
      {comprobante && (
        <div className="print-only-wrapper">
          <FacturaPrint factura={comprobante} />
        </div>
      )}
    </div>
  );
};

export default Creditos;