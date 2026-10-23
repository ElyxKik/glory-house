import { createAdminClient } from "@/lib/supabase/admin";
import { sameOrigin } from "@/lib/same-origin";
import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET() {
  const db = await createServerSupabaseClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  const results = await Promise.all([db.from("profiles").select("id,full_name,role").eq("id", user.id).single(), db.from("classes").select("*"), db.from("students").select("*"), db.from("school_requests").select("*"), db.from("financial_transactions").select("*"), db.from("profiles").select("id,full_name")]);
  if (results.some(r => r.error)) return NextResponse.json({ error: "Chargement des données impossible." }, { status: 500 });
  const profile = results[0].data as unknown as { full_name: string; role: string };
  const classes = results[1].data as unknown as Record<string, any>[];
  const students = results[2].data as unknown as Record<string, any>[];
  const profiles = results[5].data as unknown as { id: string; full_name: string }[];
  const profileNames = new Map(profiles.map(p => [p.id, p.full_name]));
  return NextResponse.json({ role: profile.role, name: profile.full_name,
    classes: classes.map(c => ({ ...c, teacher: c.teacher ?? "", students: students.filter(s => s.class_id === c.id).length })),
    students: students.map(s => ({ id: s.id, name: s.full_name, gender: s.gender ?? "", className: classes.find(c => c.id === s.class_id)?.name ?? "", guardian: s.guardian_name ?? "", phone: s.guardian_phone ?? "", status: s.status ?? "Actif" })),
    requests: (results[3].data as unknown as Record<string, any>[]).map(r => ({ ...r, category: r.category ?? "", requestedBy: profileNames.get(r.requested_by) ?? "Auteur inconnu", createdAt: r.created_at })),
    transactions: (results[4].data as unknown as Record<string, any>[]).map(t => ({ ...t, date: t.created_at })), users: []
  }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Origine refusée." }, { status: 403 });
  try {
    const db = await createServerSupabaseClient();
    const { data: { user } } = await db.auth.getUser();
    if (!user) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
    const { data: profile } = await db.from("profiles").select("role").eq("id", user.id).single();
    const { action, value: v, id, amount, approved } = await request.json();
    const permissions: Record<string, string[]> = { addStudent: ["direction", "principal_admin"], addClass: ["direction", "principal_admin"], addRequest: ["direction"], decideRequest: ["principal_admin"], addTransaction: ["finance"], decideTransaction: ["principal_admin"] };
    if (!permissions[action]?.includes(profile?.role)) return NextResponse.json({ error: "Permission refusée." }, { status: 403 });
    let result;
    if (action === "addClass") result = await db.from("classes").insert({ name: v.name, level: v.level, capacity: v.capacity, teacher: v.teacher });
    if (action === "addStudent") {
      const { data: c } = await db.from("classes").select("id").eq("name", v.className).single();
      if (!c) return NextResponse.json({ error: "Classe introuvable." }, { status: 400 });
      result = await db.from("students").insert({ full_name: v.name, gender: v.gender, guardian_name: v.guardian, guardian_phone: v.phone, class_id: c.id });
    }
    if (action === "addRequest") result = await db.from("school_requests").insert({ subject: v.subject, details: v.details, category: v.category, amount: v.amount ?? null, requested_by: user.id, status: "pending_admin" });
    if (action === "addTransaction" && v.category === "Paiement élève") {
      const { data: student } = await createAdminClient().from("students").select("id,full_name").eq("id", v.studentId).single();
      if (!student || v.kind !== "income") return NextResponse.json({ error: "Sélectionnez un élève valide et une entrée." }, { status: 400 });
      v.label = student.full_name + " [" + student.id + "] — " + v.label;
    }
    if (action === "addTransaction") result = await db.from("financial_transactions").insert({ label: v.label, category: v.category, amount: v.amount, kind: v.kind, created_by: user.id, status: v.kind === "income" ? "approved" : "pending" });
    if (action === "decideRequest" || action === "decideTransaction") {
      if (typeof approved !== "boolean") return NextResponse.json({ error: "Décision invalide." }, { status: 400 });
      let query = db.from(action === "decideRequest" ? "school_requests" : "financial_transactions").update({ status: approved ? "approved" : "rejected", validated_by: user.id, validated_at: new Date().toISOString() }).eq("id", id).eq("status", action === "decideRequest" ? "pending_admin" : "pending");
      if (action === "decideTransaction") query = query.eq("kind", "expense");
      result = await query.select("id");
    }
    if (result?.error) { console.error("Store mutation rejected", { action, code: result.error.code }); return NextResponse.json({ error: "Opération refusée par la base. Vérifiez les permissions et les migrations." }, { status: 400 }); }
    if (!result || (Array.isArray(result.data) && !result.data.length)) return NextResponse.json({ error: "Cette opération a déjà été traitée ou n’est plus en attente. Actualisez la page." }, { status: 409 });
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "Opération impossible." }, { status: 400 }); }
}
