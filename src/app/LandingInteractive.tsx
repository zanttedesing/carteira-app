"use client";

import { useState } from "react";
import {
  HomeIcon,
  BuildingIcon,
  WalletIcon,
  UsersIcon,
  FileTextIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
} from "@/components/icons";

function brl(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const NAV_ICONS = [HomeIcon, BuildingIcon, FileTextIcon, WalletIcon, UsersIcon];

const VENCIMENTOS = [
  { casa: "Casa 01 — Centro", inquilino: "João Silva", valor: 1200, atrasado: false },
  { casa: "Apartamento 02 — Jardim", inquilino: "Maria Souza", valor: 950, atrasado: false },
  { casa: "Casa 03 — Vila Nova", inquilino: "Renata Lima", valor: 2800, atrasado: true },
];

const BARS = [40, 55, 48, 62, 58, 78];

export function DashboardPreview() {
  return (
    <div className="device-frame">
      <div className="device-dots">
        <span />
        <span />
        <span />
      </div>
      <div className="flex gap-2 rounded-xl border border-line bg-surface p-2.5">
        <div className="hidden w-11 shrink-0 flex-col items-center gap-2 rounded-lg bg-chrome py-3 sm:flex">
          {NAV_ICONS.map((Icon, i) => (
            <span
              key={i}
              className={
                i === 0
                  ? "flex h-7 w-7 items-center justify-center rounded-md bg-stamp-soft text-stamp"
                  : "flex h-7 w-7 items-center justify-center rounded-md text-chrome-fg-muted"
              }
            >
              <Icon className="h-4 w-4" />
            </span>
          ))}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-semibold text-ink">
                Olá, bem-vindo(a)!
              </p>
              <p className="text-[10px] text-ink-2">Resumo da sua carteira</p>
            </div>
            <span className="rounded-full border border-line bg-surface-2 px-2 py-1 text-[9px] text-ink-2">
              Hoje, 12 de Set
            </span>
          </div>

          <div className="grid grid-cols-4 gap-1.5">
            <div className="rounded-lg border border-line bg-surface-2 p-1.5">
              <BuildingIcon className="h-3 w-3 text-stamp" />
              <p className="mt-1 text-[13px] font-bold text-ink">12</p>
              <p className="text-[8px] text-ink-3">Imóveis</p>
            </div>
            <div className="rounded-lg border border-line bg-surface-2 p-1.5">
              <FileTextIcon className="h-3 w-3 text-stamp" />
              <p className="mt-1 text-[13px] font-bold text-ink">10</p>
              <p className="text-[8px] text-ink-3">Contratos</p>
            </div>
            <div className="rounded-lg border border-line bg-surface-2 p-1.5">
              <CheckCircleIcon className="h-3 w-3 text-stamp" />
              <p className="mt-1 text-[13px] font-bold text-ink">8</p>
              <p className="text-[8px] text-ink-3">Em dia</p>
            </div>
            <div className="rounded-lg border border-danger/30 bg-surface-2 p-1.5">
              <AlertTriangleIcon className="h-3 w-3 text-danger" />
              <p className="mt-1 text-[13px] font-bold text-danger">2</p>
              <p className="text-[8px] text-ink-3">Atraso</p>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-2">
            <div className="col-span-3 rounded-lg border border-line bg-surface-2 p-2">
              <p className="mb-1 text-[9px] font-semibold text-ink-2">
                Próximos vencimentos
              </p>
              <div className="flex flex-col gap-1">
                {VENCIMENTOS.map((v) => (
                  <div
                    key={v.casa}
                    className="flex items-center justify-between gap-1 text-[8.5px]"
                  >
                    <span className="truncate text-ink-2">
                      {v.casa} · {v.inquilino}
                    </span>
                    <span
                      className={
                        v.atrasado
                          ? "shrink-0 font-semibold text-danger"
                          : "shrink-0 font-semibold text-ink"
                      }
                    >
                      {brl(v.valor)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="col-span-2 rounded-lg border border-line bg-surface-2 p-2">
              <p className="text-[9px] font-semibold text-ink-2">Receita</p>
              <p className="text-[12px] font-bold text-ink">R$ 12.480</p>
              <div className="mt-1.5 flex h-8 items-end gap-1">
                {BARS.map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-sm bg-stamp/70"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>
          </div>
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
