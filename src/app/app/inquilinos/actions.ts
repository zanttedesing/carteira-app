"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAccountId } from "@/lib/account";
import { revalidatePath } from "next/cache";

export async function createTenant(formData: FormData) {
  const unitId = String(formData.get("unit_id") || "");
  const valorAluguel = Number(formData.get("valor_aluguel") || 0);
  const diaVencimento = Number(formData.get("dia_vencimento") || 10);
  const dataInicio = String(formData.get("data_inicio") || "");
  const prazoIndeterminado = formData.get("prazo_indeterminado") === "on";
  const dataFim = prazoIndeterminado
    ? null
    : String(formData.get("data_fim") || "") || null;
  const multaPercent = Number(formData.get("multa_percent") || 0);
  const jurosMesPercent = Number(formData.get("juros_mes_percent") || 0);
  const indiceCorrecao = String(formData.get("indice_correcao") || "Nenhum");
  const contratoAssinado = formData.get("contrato_assinado") === "on";
  const obsContrato = String(formData.get("obs_contrato") || "");

  if (!unitId || !dataInicio) return;

  const supabase = await createClient();
  const accountId = await requireAccountId(supabase);

  await supabase.from("tenants").insert({
    account_id: accountId,
    unit_id: unitId,
    valor_aluguel: valorAluguel,
    dia_vencimento: diaVencimento,
    data_inicio: dataInicio,
    data_fim: dataFim,
    prazo_indeterminado: prazoIndeterminado,
    multa_percent: multaPercent,
    juros_mes_percent: jurosMesPercent,
    indice_correcao: indiceCorrecao,
    contrato_assinado: contratoAssinado,
    obs_contrato: obsContrato,
  });

  revalidatePath("/app/inquilinos");
}

export async function endTenant(formData: FormData) {
  const id = String(formData.get("id") || "");
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("tenants").update({ ativo: false }).eq("id", id);

  revalidatePath("/app/inquilinos");
}

export async function addMorador(formData: FormData) {
  const tenantId = String(formData.get("tenant_id") || "");
  const nome = String(formData.get("nome") || "").trim();
  const telefone = String(formData.get("telefone") || "");
  const email = String(formData.get("email") || "");

  if (!tenantId || !nome) return;

  const supabase = await createClient();
  await supabase.from("moradores").insert({ tenant_id: tenantId, nome, telefone, email });

  revalidatePath("/app/inquilinos");
}

export async function removeMorador(formData: FormData) {
  const id = String(formData.get("id") || "");
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("moradores").delete().eq("id", id);

  revalidatePath("/app/inquilinos");
}

export async function uploadDocument(formData: FormData) {
  const tenantId = String(formData.get("tenant_id") || "");
  const file = formData.get("file") as File | null;

  if (!tenantId || !file || file.size === 0) return;

  const supabase = await createClient();
  const accountId = await requireAccountId(supabase);

  const path = `${accountId}/${tenantId}/${Date.now()}-${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from("documents")
    .upload(path, file);

  if (uploadError) return;

  await supabase.from("documents").insert({
    account_id: accountId,
    tenant_id: tenantId,
    nome: file.name,
    storage_path: path,
  });

  revalidatePath("/app/inquilinos");
}

export async function deleteDocument(formData: FormData) {
  const id = String(formData.get("id") || "");
  const storagePath = String(formData.get("storage_path") || "");
  if (!id) return;

  const supabase = await createClient();

  if (storagePath) {
    await supabase.storage.from("documents").remove([storagePath]);
  }
  await supabase.from("documents").delete().eq("id", id);

  revalidatePath("/app/inquilinos");
}
