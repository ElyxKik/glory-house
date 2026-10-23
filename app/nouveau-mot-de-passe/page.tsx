"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function NewPassword() {
  const initialized = useRef(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const hash = new URLSearchParams(window.location.hash.slice(1));
    const query = new URLSearchParams(window.location.search);
    const access_token = hash.get("access_token");
    const refresh_token = hash.get("refresh_token");
    const code = query.get("code");
    window.history.replaceState(null, "", window.location.pathname);
    if (hash.has("error") || query.has("error")) {
      setError("Ce lien est invalide ou expiré. Demandez un nouveau lien et ouvrez uniquement le dernier e-mail reçu.");
      return;
    }
    if (!code && (!access_token || !refresh_token)) {
      setError("Ouvrez cette page depuis le lien reçu par e-mail.");
      return;
    }
    fetch("/api/auth/password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "session", code: code ?? undefined, access_token, refresh_token }) })
      .then(async response => { const result = await response.json(); if (!response.ok) throw new Error(result.error); setReady(true); })
      .catch(e => setError(e instanceof Error ? e.message : "Connexion impossible."));
  }, []);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    if (data.get("password") !== data.get("confirmation")) { setError("Les mots de passe ne correspondent pas."); return; }
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/auth/password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: data.get("password") }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setDone(true);
    } catch (e) { setError(e instanceof Error ? e.message : "Connexion impossible."); }
    finally { setBusy(false); }
  }
  return <main className="login-page"><section className="login-brand"><div className="big-logo">G</div><h1>Glory House</h1><p>Sécurisez votre accès administrateur.</p></section><section className="login-form"><form onSubmit={submit}><h2>Définir votre mot de passe</h2>{done ? <><p role="status">Votre mot de passe a été enregistré.</p><Link href="/connexion">Se connecter</Link></> : <><p>Choisissez un mot de passe d’au moins 12 caractères.</p>{ready && <><label>Nouveau mot de passe<div><input name="password" type="password" autoComplete="new-password" minLength={12} required/></div></label><label>Confirmer le mot de passe<div><input name="confirmation" type="password" autoComplete="new-password" minLength={12} required/></div></label><button className="login-submit" disabled={busy}>{busy ? "Enregistrement…" : "Enregistrer le mot de passe"}</button></>}{error && <p className="login-error" role="alert">{error}</p>}<Link href="/connexion">Retour à la connexion</Link></>}</form></section></main>;
}
