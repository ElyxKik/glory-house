import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function authorized() {
  const client = await createServerSupabaseClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) return false;
  const { data } = await client.from("profiles").select("role").eq("id", user.id).single();
  return data?.role === "principal_admin";
}
export async function GET() {
  try {
    if (!await authorized()) return NextResponse.json({ error: "Accès réservé aux administrateurs principaux." }, { status: 403 });
    const admin = createAdminClient();
    const { data: profiles, error } = await admin.from("profiles").select("id,full_name,role").order("created_at", { ascending: false });
    if (error) throw error;
    const users = [];
    for (const profile of profiles ?? []) {
      const { data, error: authError } = await admin.auth.admin.getUserById(profile.id);
      if (authError) throw authError;
      users.push({ id: profile.id, name: profile.full_name, email: data.user.email ?? "", role: profile.role });
    }
    return NextResponse.json({ users }, { headers: { "Cache-Control": "no-store" } });
  } catch { return NextResponse.json({ error: "Chargement impossible." }, { status: 500 }); }
}
export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin) return NextResponse.json({ error: "Origine non autorisée." }, { status: 403 });
  try {
    if (!await authorized()) return NextResponse.json({ error: "Accès réservé aux administrateurs principaux." }, { status: 403 });
    const { name, email, password, role } = await request.json();
    if (typeof name !== "string" || !name.trim() || name.length > 150 || typeof email !== "string" || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || typeof password !== "string" || password.length < 12 || password.length > 128 || !["principal_admin", "direction", "finance"].includes(role)) return NextResponse.json({ error: "Vérifiez les champs (mot de passe de 12 à 128 caractères)." }, { status: 400 });
    const admin = createAdminClient();
    const { data, error } = await admin.auth.admin.createUser({ email: email.trim().toLowerCase(), password, email_confirm: true, user_metadata: { full_name: name.trim() } });
    if (error) return NextResponse.json({ error: "Création refusée : adresse déjà utilisée ou mot de passe non accepté." }, { status: 400 });
    const { error: profileError } = await admin.from("profiles").insert({ id: data.user.id, full_name: name.trim(), role });
    if (profileError) {
      const { error: rollbackError } = await admin.auth.admin.deleteUser(data.user.id);
      return NextResponse.json({ error: rollbackError ? "Profil non créé. Un compte Auth incomplet reste à vérifier dans Supabase." : "Profil non créé. Création annulée." }, { status: 500 });
    }
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch { return NextResponse.json({ error: "Service indisponible." }, { status: 500 }); }
}
