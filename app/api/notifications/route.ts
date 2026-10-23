import { NextResponse } from "next/server";
import { sameOrigin } from "@/lib/same-origin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET() {
  const db = await createServerSupabaseClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  const { data, error } = await db.from("notifications").select("id,title,message,request_id,created_at,read_at").order("created_at", { ascending: false }).limit(50);
  if (error) return NextResponse.json({ error: "Chargement des notifications impossible." }, { status: 500 });
  return NextResponse.json({ notifications: data }, { headers: { "Cache-Control": "no-store" } });
}
export async function PATCH(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Origine refusée." }, { status: 403 });
  const db = await createServerSupabaseClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  const { id } = await request.json();
  if (typeof id !== "string") return NextResponse.json({ error: "Notification invalide." }, { status: 400 });
  const { error } = await db.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", id).is("read_at", null);
  if (error) return NextResponse.json({ error: "Mise à jour impossible." }, { status: 400 });
  return NextResponse.json({ ok: true });
}
