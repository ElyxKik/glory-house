"use client";
import { useEffect, useState } from "react";
type Student = { id: string; full_name: string; classes: { name: string } | null };
export function StudentPicker() {
  const [students, setStudents] = useState<Student[]>([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Student | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    setStudents([]); setError("");
    const timer = setTimeout(() => { fetch(`/api/payment-students?q=${encodeURIComponent(query)}`, { signal: controller.signal }).then(async r => { const data = await r.json(); if (!r.ok) throw new Error(data.error); setStudents(data.students); }).catch(e => { if (!controller.signal.aborted) setError(e.message); }); }, 250);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [query]);
  const results = students;
  return <div><label className="app-field"><span>Rechercher et sélectionner un élève</span><input value={query} onChange={e => { setQuery(e.target.value); setSelected(null); }} placeholder="Nom de l’élève" autoComplete="off" aria-label="Recherche d’élève"/></label><input type="hidden" name="studentId" value={selected?.id ?? ""}/>{error && <p role="alert">{error}</p>}{!selected && <div className="student-results">{results.map(s => <button key={s.id} type="button" className="btn ghost" onClick={() => { setSelected(s); setQuery(s.full_name); }}>{s.full_name} — {s.classes?.name ?? "Sans classe"} · {s.id}</button>)}{!results.length && <p>Aucun résultat disponible. Précisez le nom pour rechercher.</p>}</div>}{selected && <p role="status">Élève sélectionné : {selected.full_name} — {selected.classes?.name ?? "Sans classe"}</p>}</div>;
}
