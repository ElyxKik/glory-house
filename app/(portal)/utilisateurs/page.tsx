"use client";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Field, Modal, PageIntro, useModal } from "@/components/ui";
import type { Role, StaffUser } from "@/lib/types";
const names: Record<Role, string> = { principal_admin: "Admin principale", finance: "Finance", direction: "Direction" };
export default function Users() {
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [allowed, setAllowed] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const m = useModal();
  async function load() {
    const response = await fetch("/api/users", { cache: "no-store" });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error);
    setUsers(result.users); setAllowed(true);
  }
  useEffect(() => { load().catch(e => setError(e.message)); }, []);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setMessage("");
    const data = new FormData(event.currentTarget);
    try {
      if (data.get("password") !== data.get("confirmation")) throw new Error("Les mots de passe ne correspondent pas.");
      const response = await fetch("/api/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: data.get("name"), email: data.get("email"), password: data.get("password"), role: data.get("role") }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      m.hide(); setMessage("Compte créé. Connexion immédiate avec l’e-mail et le mot de passe, sans invitation.");
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : "Service indisponible."); }
    finally { setBusy(false); }
  }
  return <><PageIntro title="Utilisateurs & accès" text="Créez les comptes et attribuez leurs rôles sans invitation par e-mail." action={allowed && <button className="btn primary" onClick={() => { setError(""); m.show(); }}><Plus/>Nouvel utilisateur</button>}/>{message && <p role="status">{message}</p>}{error && !m.open && <p role="alert">{error}</p>}<div className="table-tools"><input aria-label="Rechercher un utilisateur" placeholder="Nom ou e-mail..." value={query} onChange={e=>setQuery(e.target.value)}/><select aria-label="Rôle" value={filterRole} onChange={e=>setFilterRole(e.target.value)}><option value="">Tous les rôles</option><option value="principal_admin">Admin principale</option><option value="direction">Direction</option><option value="finance">Finance</option></select></div><section className="user-grid">{users.filter(u=>(!filterRole||u.role===filterRole)&&(u.name+" "+u.email).toLowerCase().includes(query.toLowerCase())).map(u => <article className="app-card user-card" key={u.id}><div className="user-avatar">{u.name.slice(0, 2)}</div><div><h3>{u.name}</h3><p>{u.email}</p><span className={`role-chip ${u.role}`}>{names[u.role]}</span></div></article>)}</section>{m.open && <Modal title="Créer un utilisateur" text="Le compte pourra se connecter immédiatement." onClose={() => { if (!busy) m.hide(); }}><form className="app-form" onSubmit={submit}><Field label="Nom complet"><input name="name" maxLength={150} required/></Field><Field label="Adresse e-mail"><input name="email" type="email" maxLength={254} required/></Field><Field label="Rôle"><select name="role"><option value="direction">Direction</option><option value="finance">Finance</option><option value="principal_admin">Admin principale</option></select></Field><Field label="Mot de passe (12 caractères minimum)"><input name="password" type="password" autoComplete="new-password" minLength={12} maxLength={128} required/></Field><Field label="Confirmer le mot de passe"><input name="confirmation" type="password" autoComplete="new-password" minLength={12} maxLength={128} required/></Field>{error && <p role="alert">{error}</p>}<div className="form-actions"><button type="button" className="btn ghost" disabled={busy} onClick={m.hide}>Annuler</button><button className="btn primary" disabled={busy}>{busy ? "Création…" : "Créer le compte"}</button></div></form></Modal>}</>;
}
