"use client";

import { useRef, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { safeFileName } from "@/lib/storage";

const MAX_MB = 20;

// Envia o arquivo direto do navegador para o armazenamento (sem passar pelo
// servidor, que no Vercel recusa corpos acima de ~4 MB) e só então avisa o
// servidor qual é o caminho, para registrar no banco.
export function DirectUpload({
  accountId,
  folder,
  action,
  fields,
  buttonLabel,
  accept,
}: {
  accountId: string;
  folder: string;
  action: (formData: FormData) => Promise<void>;
  fields: Record<string, string>;
  buttonLabel: string;
  accept?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [, startTransition] = useTransition();

  async function enviar() {
    const file = inputRef.current?.files?.[0];
    if (!file) {
      setErro("Escolha um arquivo primeiro.");
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setErro(`O arquivo passa de ${MAX_MB} MB.`);
      return;
    }

    setErro(null);
    setEnviando(true);

    const path = `${accountId}/${folder}/${Date.now()}-${safeFileName(file.name)}`;
    const supabase = createClient();
    const { error } = await supabase.storage.from("documents").upload(path, file);
    if (error) {
      setEnviando(false);
      setErro("Não foi possível enviar o arquivo. Tente de novo.");
      return;
    }

    const formData = new FormData();
    for (const [chave, valor] of Object.entries(fields)) formData.set(chave, valor);
    formData.set("path", path);
    formData.set("nome", file.name);

    startTransition(async () => {
      await action(formData);
      if (inputRef.current) inputRef.current.value = "";
      setEnviando(false);
    });
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="max-w-full text-sm text-ink"
        />
        <button
          type="button"
          onClick={enviar}
          disabled={enviando}
          className="rounded-lg border border-line px-3 py-1.5 text-sm font-medium text-ink hover:bg-surface-2 disabled:opacity-60"
        >
          {enviando ? "Enviando..." : buttonLabel}
        </button>
      </div>
      {erro && <p className="text-xs text-danger">{erro}</p>}
    </div>
  );
}
