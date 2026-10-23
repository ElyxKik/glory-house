import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin) {
    return NextResponse.json({ error: "Origine non autorisée." }, { status: 403 });
  }
  try {
    const body = await request.json();
    const supabase = await createServerSupabaseClient();
    if (body.action === "session") {
      let error;
      if (typeof body.code === "string") {
        ({ error } = await supabase.auth.exchangeCodeForSession(body.code));
      } else if (typeof body.access_token === "string" && typeof body.refresh_token === "string") {
        ({ error } = await supabase.auth.setSession({ access_token: body.access_token, refresh_token: body.refresh_token }));
      } else {
        return NextResponse.json({ error: "Lien incomplet." }, { status: 400 });
      }
      if (error) return NextResponse.json({ error: "Lien invalide ou expiré. Demandez un nouveau lien." }, { status: 400 });
      return NextResponse.json({ ok: true });
    }
    if (typeof body.password !== "string" || body.password.length < 12) {
      return NextResponse.json({ error: "Utilisez au moins 12 caractères." }, { status: 400 });
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Session expirée. Demandez un nouveau lien." }, { status: 401 });
    const { error } = await supabase.auth.updateUser({ password: body.password });
    if (error) return NextResponse.json({ error: "Mot de passe refusé. Choisissez un mot de passe différent et suffisamment fort." }, { status: 400 });
    await supabase.auth.signOut();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Service indisponible. Réessayez." }, { status: 500 });
  }
}
