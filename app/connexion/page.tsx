"use client";

import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Login() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false); const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError("");
    const data = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: data.get("email"), password: data.get("password") }) });
    const result = await response.json();
    if (!response.ok) { setError(result.error ?? "Connexion impossible."); setLoading(false); return; }
    router.replace("/dashboard"); router.refresh();
  }
  return <main className="login-page"><section className="login-brand"><div className="big-logo">G</div><h1>Glory House</h1><p>Gérez votre établissement avec clarté, sécurité et efficacité.</p><blockquote>« Une école bien organisée offre à chaque enfant les meilleures chances de réussir. »</blockquote></section><section className="login-form"><form onSubmit={submit}><span className="mobile-logo">G</span><p>ESPACE SÉCURISÉ</p><h2>Connectez-vous</h2><small>Utilisez votre adresse e-mail professionnelle.</small><label>Adresse e-mail<div><Mail/><input name="email" type="email" autoComplete="email" required/></div></label><label>Mot de passe<div><Lock/><input name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" required/><button type="button" aria-label="Afficher le mot de passe" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff/> : <Eye/>}</button></div></label>{error && <div className="login-error" role="alert">{error}</div>}<button className="login-submit" disabled={loading}>{loading ? "Connexion..." : "Se connecter"}</button><em>Les comptes sont créés uniquement par l’administration.</em></form></section></main>;
}
