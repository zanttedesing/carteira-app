import Link from "next/link";
import { login } from "./actions";

export default async function LoginPage(props: {
  searchParams: Promise<{ erro?: string; aviso?: string }>;
}) {
  const params = await props.searchParams;

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 py-16">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-zinc-900">Entrar</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Acesse sua carteira de aluguéis.
        </p>

        {params.aviso && (
          <p className="mt-4 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700">
            {params.aviso}
          </p>
        )}
        {params.erro && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {params.erro}
          </p>
        )}

        <form action={login} className="mt-6 flex flex-col gap-4">
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
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
            />
          </label>
          <button
            type="submit"
            className="mt-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
          >
            Entrar
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500">
          Ainda não tem conta?{" "}
          <Link href="/signup" className="font-medium text-zinc-900 underline">
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  );
}
