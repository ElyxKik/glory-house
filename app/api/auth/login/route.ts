import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const { email, password } = await request.json();
  if (typeof email !== "string" || typeof password !== "string") {
    return NextResponse.json({ error: "E-mail et mot de passe requis." }, { status: 400 });
  }

  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return NextResponse.json({ error: "Identifiants incorrects." }, { status: 401 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Connexion indisponible. Réessayez." }, { status: 500 });
  }
}
