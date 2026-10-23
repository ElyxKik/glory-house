"use client";
import { Download, FileBarChart } from "lucide-react";
import { useStore } from "@/app/providers";
import { PageIntro } from "@/components/ui";
export default function Reports() {
  const { students, classes, requests } = useStore();
  function exportCsv() { const rows = [["Rapport Glory House"], ["Élèves", students.length], ["Classes", classes.length], ["Demandes traitées", `${requests.filter(x => x.status === "approved").length}/${requests.length}`]]; const blob = new Blob([rows.map(row => row.join(";")).join("\n")], { type: "text/csv" }); const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = "rapport-direction-glory-house.csv"; link.click(); URL.revokeObjectURL(link.href); }
  const capacity = classes.reduce((sum, c) => sum + c.capacity, 0); const enrolled = classes.reduce((sum, c) => sum + c.students, 0);
  return <><PageIntro title="Rapports de la Direction" text="Indicateurs pédagogiques et administratifs de l’école." action={<button className="btn primary" onClick={exportCsv}><Download/>Exporter en CSV</button>}/><section className="report-grid"><article className="app-card report-hero"><div><FileBarChart/><h3>Situation actuelle</h3><p>Données de l’établissement</p></div><dl><div><dt>Élèves actifs</dt><dd>{students.filter(x => x.status === "Actif").length}</dd></div><div><dt>Taux d’occupation</dt><dd>{capacity ? Math.round(enrolled / capacity * 100) : 0}%</dd></div><div><dt>Demandes traitées</dt><dd>{requests.filter(x => x.status === "approved").length}/{requests.length}</dd></div></dl></article></section><section className="app-card report-bars"><div className="card-head"><div><h3>Effectifs par classe</h3><p>Occupation actuelle</p></div></div>{classes.map(c => <div key={c.id}><span>{c.name}</span><i><b style={{ width: `${c.capacity ? c.students / c.capacity * 100 : 0}%` }}/></i><strong>{c.students}/{c.capacity}</strong></div>)}</section></>;
}
