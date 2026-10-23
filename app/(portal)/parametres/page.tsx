"use client";
import { useStore } from "@/app/providers";
import { PageIntro } from "@/components/ui";
export default function Settings() {
  const { name, role } = useStore();
  return <><PageIntro title="Paramètres" text="Informations du compte connecté."/><section className="app-card"><p>Nom : {name}</p><p>Rôle : {role}</p><p>La configuration de l’établissement et des notifications n’est pas encore disponible.</p></section></>;
}
