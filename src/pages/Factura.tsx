import logo from "../assets/Logo.png";
import "./Factura.css";

const FacturaPrint = ({ factura }: any) => {
  const esCredito = factura.tipo_pago === "credito";
  const esSaldado = factura.tipo === "comprobante_saldado";

  // ── COMPROBANTE DE CUENTA SALDADA ──────────────────────────
  if (esSaldado) {
    return (
      <div className="ticket-minimal">
        <div className="tk-center">
          <img src={logo} alt="Logo" className="tk-logo-bn" />
          <p className="tk-bold tk-xl">REPUESTOS RINGO</p>
          <p className="tk-bold">★ CUENTA SALDADA ★</p>
          <p>COMPROBANTE DE PAGO</p>
          <p>Ref: {factura.numerofactura || "S/N"}</p>
          <p>{new Date().toLocaleString()}</p>
        </div>

        <p className="tk-divisor">================================</p>

        <div className="tk-section">
          <p>CLIENTE: {factura.cliente?.nombre || "CONSUMIDOR FINAL"}</p>
          {factura.cliente?.telefono && factura.cliente.telefono !== "N/A" && (
            <p>TEL: {factura.cliente.telefono}</p>
          )}
        </div>

        <p className="tk-divisor">--------------------------------</p>

        {/* Resumen de la deuda */}
        <div className="tk-totales">
          <div className="tk-row">
            <span>DEUDA ORIGINAL:</span>
            <span>RD$ {Number(factura.total_deuda).toFixed(2)}</span>
          </div>
          <div className="tk-row tk-bold tk-lg">
            <span>TOTAL PAGADO:</span>
            <span>RD$ {Number(factura.total_pagado).toFixed(2)}</span>
          </div>
          <div className="tk-row tk-bold">
            <span>SALDO PENDIENTE:</span>
            <span>RD$ 0.00</span>
          </div>
        </div>

        <p className="tk-divisor">--------------------------------</p>

        {/* Historial de abonos */}
        {factura.abonos && factura.abonos.length > 0 && (
          <>
            <p className="tk-bold" style={{ marginBottom: 4 }}>ABONOS REALIZADOS:</p>
            {factura.abonos.map((a: any, i: number) => (
              <div className="tk-row" key={i} style={{ fontSize: 11 }}>
                <span>{new Date(a.fecha).toLocaleDateString()}</span>
                <span>RD$ {Number(a.monto).toFixed(2)}</span>
              </div>
            ))}
            <p className="tk-divisor">--------------------------------</p>
          </>
        )}

        <p className="tk-divisor">================================</p>

        <div className="tk-center tk-footer">
          <p className="tk-bold">✓ DEUDA CANCELADA EN SU TOTALIDAD</p>
          <p>GRACIAS POR SU PAGO</p>
          <p>¡VUELVA PRONTO!</p>
        </div>
      </div>
    );
  }

  // ── TICKET NORMAL (CONTADO O CRÉDITO) ──────────────────────
  return (
    <div className="ticket-minimal">

      {/* ENCABEZADO */}
      <div className="tk-center">
        <img src={logo} alt="Logo" className="tk-logo-bn" />
        <p className="tk-bold tk-xl">REPUESTOS RINGO</p>
        <p>{esCredito ? "FACTURA A CRÉDITO" : "TICKET DE VENTA"}</p>
        <p>N°: {factura.numerofactura || factura.numero || "S/N"}</p>
        <p>{new Date().toLocaleString()}</p>
      </div>

      <p className="tk-divisor">================================</p>

      {/* CLIENTE */}
      <div className="tk-section">
        <p>CLIENTE: {factura.cliente?.nombre || "CONSUMIDOR FINAL"}</p>
        {factura.cliente?.telefono && factura.cliente.telefono !== "N/A" && (
          <p>TEL: {factura.cliente.telefono}</p>
        )}
        <p className={esCredito ? "tk-badge-credito" : "tk-badge-contado"}>
          {esCredito ? "★ VENTA A CRÉDITO" : "✓ VENTA AL CONTADO"}
        </p>
      </div>

      <p className="tk-divisor">--------------------------------</p>

      {/* PRODUCTOS */}
      <div className="tk-items">
        <div className="tk-row tk-bold">
          <span className="col-1">CANT</span>
          <span className="col-2">DESCRIPCION</span>
          <span className="col-3">TOTAL</span>
        </div>
        {(factura.detalles || []).map((item: any, index: number) => (
          <div className="tk-row" key={index}>
            <span className="col-1">{item.cantidad}</span>
            <span className="col-2">{item.nombre || item.producto}</span>
            <span className="col-3">
              {Number(item.subtotal || item.precio * item.cantidad).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      <p className="tk-divisor">--------------------------------</p>

      {/* TOTALES */}
      <div className="tk-totales">
        <div className="tk-row">
          <span>SUBTOTAL:</span>
          <span>RD$ {Number(factura.total).toFixed(2)}</span>
        </div>
        <div className="tk-row tk-bold tk-lg">
          <span>TOTAL:</span>
          <span>RD$ {Number(factura.total).toFixed(2)}</span>
        </div>

        {esCredito ? (
          <>
            <p className="tk-divisor">- - - - - - - - - - - - - - - -</p>
            <div className="tk-row tk-bold">
              <span>SALDO PENDIENTE:</span>
              <span>RD$ {Number(factura.total).toFixed(2)}</span>
            </div>
            <div className="tk-row">
              <span>ABONADO:</span>
              <span>RD$ 0.00</span>
            </div>
            <p className="tk-credito-nota">
              * Este comprobante acredita una deuda pendiente de pago.
            </p>
          </>
        ) : (
          <>
            <div className="tk-row">
              <span>PAGO:</span>
              <span>RD$ {Number(factura.pago || 0).toFixed(2)}</span>
            </div>
            <div className="tk-row">
              <span>CAMBIO:</span>
              <span>RD$ {Number(factura.cambio || 0).toFixed(2)}</span>
            </div>
          </>
        )}
      </div>

      <p className="tk-divisor">================================</p>

      {/* PIE */}
      <div className="tk-center tk-footer">
        {esCredito ? (
          <>
            <p>GRACIAS POR SU PREFERENCIA</p>
            <p>RECUERDE SALDAR SU DEUDA</p>
          </>
        ) : (
          <>
            <p>GRACIAS POR SU COMPRA</p>
            <p>¡VUELVA PRONTO!</p>
          </>
        )}
      </div>
    </div>
  );
};

export default FacturaPrint;