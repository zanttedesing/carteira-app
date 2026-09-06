"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAccountId } from "@/lib/account";
import { revalidatePath } from "next/cache";

export async function createProperty(formData: FormData) {
  const endereco = String(formData.get("endereco") || "").trim();
  const comissaoPercent = Number(formData.get("comissao_percent") || 0);
  const clientId = String(formData.get("client_id") || "") || null;

  if (!endereco) return;

  const supabase = await createClient();
  const accountId = await requireAccountId(supabase);

  await supabase.from("properties").insert({
    account_id: accountId,
    endereco,
    comissao_percent: comissaoPercent,
    client_id: clientId,
  });

  revalidatePath("/app/imoveis");
}

export async function deleteProperty(formData: FormData) {
  const id = String(formData.get("id") || "");
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("properties").delete().eq("id", id);

  revalidatePath("/app/imoveis");
}

export async function createUnit(formData: FormData) {
  const propertyId = String(formData.get("property_id") || "");
  const label = String(formData.get("label") || "").trim();
  if (!propertyId || !label) return;

  const supabase = await createClient();
  const accountId = await requireAccountId(supabase);

  await supabase.from("units").insert({
    account_id: accountId,
    property_id: propertyId,
    label,
  });

  revalidatePath("/app/imoveis");
}

export async function deleteUnit(formData: FormData) {
  const id = String(formData.get("id") || "");
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("units").delete().eq("id", id);

  revalidatePath("/app/imoveis");
}
