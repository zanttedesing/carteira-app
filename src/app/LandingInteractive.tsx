"use client";

import { useState } from "react";

function brl(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function ReceiptDemo() {
  const [tab, setTab] = useState<"pagamentos" | "reformas" | "donos">("pagamentos");

  return (
    <div className="receipt-stack">
      <div className="receipt copy blue" />
      <div className="receipt copy pink" />
      <div className="receipt top">
        <div className="rhead">
          <div>
            <div className="brand">Carteira</div>
            <span className="no">recibo digital · via administrador</span>
          </div>
          <span className="no">01/09/2026</span>
        </div>
        <div className="rtabs">
          <button
            className={`receipt-tab${tab === "pagamentos" ? " active" : ""}`}
            type="button"
            onClick={() => setTab("pagamentos")}
          >
            Pagamentos
          </button>
          <button
            className={`receipt-tab${tab === "reformas" ? " active" : ""}`}
            type="button"
            onClick={() => setTab("reformas")}
          >
            Reformas
          </button>
          <button
            className={`receipt-tab${tab === "donos" ? " active" : ""}`}
            type="button"
            onClick={() => setTab("donos")}
          >
            Clientes
          </button>
        </div>
        <div className="rbody">
          {tab === "pagamentos" && (
            <div className="receipt-panel">
              <div className="row">
                <div className="stat">
                  <div className="l">Previsto no mês</div>
                  <div className="v">R$ 7.400</div>
                </div>
                <div className="stat">
                  <div className="l">Em atraso</div>
                  <div className="v" style={{ color: "var(--danger)" }}>R$ 543</div>
                </div>
                <div className="stat">
                  <div className="l">Obras abertas</div>
                  <div className="v">2</div>
                </div>
              </div>
              <table>
                <tbody>
                  <tr>
                    <td>Casa 1 — R. das Palmeiras</td>
                    <td><b>João Silva</b></td>
                    <td><span className="pill ok">Pago em dia</span></td>
                  </tr>
                  <tr>
                    <td>Casa 2 — R. das Palmeiras</td>
                    <td><b>M. Souza &amp; A. Costa</b></td>
                    <td><span className="pill danger">Atrasado (12d)</span></td>
                  </tr>
                  <tr>
                    <td>Sítio Bela Vista</td>
                    <td><b>Renata Lima</b></td>
                    <td><span className="pill warn">A vencer</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
          {tab === "reformas" && (
            <div className="receipt-panel">
              <div className="row" style={{ gridTemplateColumns: "1fr 1fr" }}>
                <div className="stat">
                  <div className="l">Obras abertas</div>
                  <div className="v">2</div>
                </div>
                <div className="stat">
                  <div className="l">Custo pendente</div>
                  <div className="v">R$ 2.160</div>
                </div>
              </div>
              <table>
                <tbody>
                  <tr>
                    <td>Casa 2 — Telhado</td>
                    <td><span className="pill warn">Em andamento</span></td>
                    <td className="num">R$ 2.160</td>
                  </tr>
                  <tr>
                    <td>Sítio — Cerca nova</td>
                    <td><span className="pill neutral">Planejada</span></td>
                    <td className="num">R$ 640</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
          {tab === "donos" && (
            <div className="receipt-panel">
              <table>
                <tbody>
                  <tr>
                    <td><b>Marcos Reis</b> <span className="no">(10 imóveis)</span></td>
                    <td className="num">R$ 9.400</td>
                  </tr>
                  <tr>
                    <td><b>Imobiliária Vitale</b> <span className="no">(2 imóveis)</span></td>
                    <td className="num">R$ 2.600</td>
                  </tr>
                  <tr>
                    <td><b>Renata Lima</b> <span className="no">(1 imóvel)</span></td>
                    <td className="num">R$ 1.600</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function RentCalculator() {
  const [rent, setRent] = useState(1500);
  const [days, setDays] = useState(15);
  const [multaPct, setMultaPct] = useState(2);
  const [jurosPct, setJurosPct] = useState(1);
  const [correcaoPct, setCorrecaoPct] = useState(0.3);

  const multa = days > 0 ? rent * (multaPct / 100) : 0;
  const juros = days > 0 ? rent * (jurosPct / 100) * (days / 30) : 0;
  const correcao = days > 0 ? rent * (correcaoPct / 100) * (days / 30) : 0;
  const total = rent + multa + juros + correcao;

  return (
    <div className="calc">
      <div className="calc-inputs">
        <div className="calc-field">
          <div className="calc-label">
            <span>Valor do aluguel</span>
            <span className="calc-val">{brl(rent)}</span>
          </div>
          <input
            type="range"
            min={300}
            max={5000}
            step={50}
            value={rent}
            onChange={(e) => setRent(Number(e.target.value))}
          />
        </div>
        <div className="calc-field">
          <div className="calc-label">
            <span>Dias em atraso</span>
            <span className="calc-val">{days === 1 ? "1 dia" : `${days} dias`}</span>
          </div>
          <input
            type="range"
            min={0}
            max={60}
            step={1}
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
          />
        </div>
        <div className="calc-field">
          <div className="calc-label">
            <span>Multa por atraso</span>
            <span className="calc-val">{multaPct}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={10}
            step={0.5}
            value={multaPct}
            onChange={(e) => setMultaPct(Number(e.target.value))}
          />
        </div>
        <div className="calc-field">
          <div className="calc-label">
            <span>Juros ao mês</span>
            <span className="calc-val">{jurosPct}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={5}
            step={0.1}
            value={jurosPct}
            onChange={(e) => setJurosPct(Number(e.target.value))}
          />
        </div>
        <div className="calc-field">
          <div className="calc-label">
            <span>Correção monetária ao mês</span>
            <span className="calc-val">{correcaoPct.toString().replace(".", ",")}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={2}
            step={0.05}
            value={correcaoPct}
            onChange={(e) => setCorrecaoPct(Number(e.target.value))}
          />
          <span
            className="eyebrow"
            style={{ color: "var(--ink-3)", textTransform: "none", letterSpacing: 0 }}
          >
            Equivalente mensal de IPCA, IGP-M ou INPC — no sistema, você escolhe o
            índice do contrato e cadastra a tabela
          </span>
        </div>
      </div>
      <div className="calc-output">
        <div className="calc-line"><span>Aluguel</span><span className="num">{brl(rent)}</span></div>
        <div className="calc-line"><span>Multa</span><span className="num">{brl(multa)}</span></div>
        <div className="calc-line"><span>Juros</span><span className="num">{brl(juros)}</span></div>
        <div className="calc-line"><span>Correção monetária</span><span className="num">{brl(correcao)}</span></div>
        <div className="calc-line total"><span>Total devido</span><span className="num">{brl(total)}</span></div>
      </div>
    </div>
  );
}
