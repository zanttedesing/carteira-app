"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAccountId } from "@/lib/account";
import { revalidatePath } from "next/cache";

export async function savePayment(formData: FormData) {
  const tenantId = String(formData.get("tenant_id") || "");
  const mesReferencia = String(formData.get("mes_referencia") || "");
  const dataPagamento = String(formData.get("data_pagamento") || "") || null;
  const luzPaga = formData.get("luz_paga") === "on";
  const aguaPaga = formData.get("agua_paga") === "on";
  const obs = String(formData.get("obs") || "");

  if (!tenantId || !mesReferencia) return;

  const supabase = await createClient();
  const accountId = await requireAccountId(supabase);

  await supabase
    .from("payments")
    .upsert(
      {
        account_id: accountId,
        tenant_id: tenantId,
        mes_referencia: mesReferencia,
        data_pagamento: dataPagamento,
        luz_paga: luzPaga,
        agua_paga: aguaPaga,
        obs,
      },
      { onConflict: "tenant_id,mes_referencia" }
    );

  revalidatePath("/app/pagamentos");
}
