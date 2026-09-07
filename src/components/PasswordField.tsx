"use client";

import { useState } from "react";

function strengthOf(senha: string) {
  if (!senha) return { score: 0, label: "", color: "" };

  let score = 0;
  if (senha.length >= 6) score++;
  if (senha.length >= 10) score++;
  if (/[a-z]/.test(senha) && /[A-Z]/.test(senha)) score++;
  if (/\d/.test(senha)) score++;
  if (/[^a-zA-Z0-9]/.test(senha)) score++;

  if (score <= 1) return { score, label: "Fraca", color: "var(--danger)" };
  if (score <= 3) return { score, label: "Média", color: "var(--warn)" };
  return { score, label: "Forte", color: "var(--stamp)" };
}

export function PasswordField({
  name,
  required,
  minLength,
  showStrength,
  className,
}: {
  name: string;
  required?: boolean;
  minLength?: number;
  showStrength?: boolean;
  className?: string;
}) {
  const [visivel, setVisivel] = useState(false);
  const [valor, setValor] = useState("");
  const forca = strengthOf(valor);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="relative">
        <input
          name={name}
          type={visivel ? "text" : "password"}
          required={required}
          minLength={minLength}
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          className={`${className ?? ""} w-full pr-16`}
        />
        <button
          type="button"
          onClick={() => setVisivel((v) => !v)}
          className="absolute inset-y-0 right-0 px-3 text-xs font-medium text-ink-2 hover:text-ink"
        >
          {visivel ? "Ocultar" : "Mostrar"}
        </button>
      </div>
      {showStrength && valor && (
        <div className="flex items-center gap-2">
          <div className="flex flex-1 gap-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <span
                key={i}
                className="h-1 flex-1 rounded-full"
                style={{
                  background: i < forca.score ? forca.color : "var(--line)",
                }}
              />
            ))}
          </div>
          <span className="text-xs font-medium" style={{ color: forca.color }}>
            {forca.label}
          </span>
        </div>
      )}
    </div>
  );
}
