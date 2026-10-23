import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
export async function GET(request: Request) {
  const db = await createServerSupabaseClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  const { data: profile } = await db.from("profiles").select("role").eq("id", user.id).single();
  if (!["finance", "principal_admin"].includes(profile?.role)) return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
  const query = (new URL(request.url).searchParams.get("q") ?? "").slice(0, 150).replace(/[%_\\]/g, "");
  const { data, error } = await createAdminClient().from("students").select("id,full_name,classes(name)").ilike("full_name", `%${query}%`).order("full_name").limit(30);
  if (error) return NextResponse.json({ error: "Chargement impossible." }, { status: 500 });
  return NextResponse.json({ students: data }, { headers: { "Cache-Control": "no-store" } });
}
