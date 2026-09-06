import Link from "next/link";
import { signup } from "./actions";

export default async function SignupPage(props: {
  searchParams: Promise<{ erro?: string; conta?: string }>;
}) {
  const params = await props.searchParams;
  const contaId = params.conta;

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 py-16">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-zinc-900">
          {contaId ? "Aceitar convite" : "Criar conta"}
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          {contaId
            ? "Você foi convidado a participar de uma carteira existente."
            : "Comece a organizar seus aluguéis."}
        </p>

        {params.erro && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {params.erro}
          </p>
        )}

        <form action={signup} className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm text-zinc-700">
            Seu nome
            <input
              name="nome"
              type="text"
              required
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-zinc-700">
            E-mail
            <input
              name="email"
              type="email"
              required
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-zinc-700">
            Senha
            <input
              name="senha"
              type="password"
              required
              minLength={6}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
            />
          </label>

          {contaId ? (
            <input type="hidden" name="conta_id" value={contaId} />
          ) : (
            <fieldset className="flex flex-col gap-2 text-sm text-zinc-700">
              <legend className="mb-1">Como você vai usar a carteira?</legend>
              <label className="flex items-center gap-2 rounded-lg border border-zinc-300 px-3 py-2">
                <input type="radio" name="modo" value="pessoal" defaultChecked />
                Imóveis próprios e da família
              </label>
              <label className="flex items-center gap-2 rounded-lg border border-zinc-300 px-3 py-2">
                <input type="radio" name="modo" value="profissional" />
                Administro imóveis de clientes/terceiros
              </label>
            </fieldset>
          )}

          <button
            type="submit"
            className="mt-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
          >
            {contaId ? "Entrar na carteira" : "Criar conta"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500">
          Já tem conta?{" "}
          <Link href="/login" className="font-medium text-zinc-900 underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
