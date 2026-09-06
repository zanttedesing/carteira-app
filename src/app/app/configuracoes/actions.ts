"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAccountId } from "@/lib/account";
import { revalidatePath } from "next/cache";

export async function setModo(formData: FormData) {
  const modo = String(formData.get("modo") || "");
  if (modo !== "pessoal" && modo !== "profissional") return;

  const supabase = await createClient();
  const accountId = await requireAccountId(supabase);

  await supabase.from("accounts").update({ modo }).eq("id", accountId);

  revalidatePath("/app", "layout");
}
