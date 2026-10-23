"use client";
import { ApprovalActions } from "@/components/approval-actions";
import { useState } from "react";
import { Plus } from "lucide-react";
import { useStore } from "@/app/providers";
import type { SchoolRequest } from "@/lib/types";
import { Field, Modal, money, PageIntro, Status, useModal } from "@/components/ui";

export default function Requests() {
  const { requests, addRequest, evaluateRequest, role } = useStore();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [selected, setSelected] = useState<SchoolRequest | null>(null);
  const [evalId, setEvalId] = useState<string | null>(null);
  const create = useModal();
  function add(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); const d = new FormData(e.currentTarget);
    addRequest({ subject: String(d.get("subject")), details: String(d.get("details")), category: String(d.get("category")) }); create.hide();
  }
  function evaluate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); if (evalId) evaluateRequest(evalId, Number(new FormData(e.currentTarget).get("amount"))); setEvalId(null);
  }
  const visible = requests.filter(r => (!status || r.status === status) && (r.subject + " " + r.category + " " + r.details).toLowerCase().includes(query.toLowerCase()));
  return <><PageIntro title="Demandes de la Direction" text="Ouvrez une demande pour consulter son détail et son circuit de décision." action={role === "direction" && <button className="btn primary" onClick={create.show}><Plus/>Nouvelle demande</button>}/>
    <div className="workflow-steps"><span><i>1</i><b>Direction</b><small>Crée la demande</small></span><em>→</em><span><i>2</i><b>Finance</b><small>Évalue le montant</small></span><em>→</em><span><i>3</i><b>Admin principale</b><small>Valide ou refuse</small></span></div>
    <section className="app-card table-card"><div className="table-tools"><input aria-label="Rechercher une demande" placeholder="Objet, catégorie..." value={query} onChange={e => setQuery(e.target.value)}/><select aria-label="Statut" value={status} onChange={e => setStatus(e.target.value)}><option value="">Tous les statuts</option><option value="pending_finance">À évaluer</option><option value="pending_admin">À valider</option><option value="approved">Validées</option><option value="rejected">Refusées</option></select></div>
      <div className="responsive-table"><table><thead><tr><th>DEMANDE</th><th>CATÉGORIE</th><th>DEMANDEUR</th><th>MONTANT</th><th>STATUT</th><th>ACTION</th></tr></thead><tbody>{visible.map(r => <tr key={r.id}><td><b>{r.subject}</b><small className="cell-note">{r.details}</small></td><td>{r.category}</td><td>{r.requestedBy}<small className="cell-note">{r.createdAt}</small></td><td><b>{r.amount ? money.format(r.amount) : "À définir"}</b></td><td><Status value={r.status}/></td><td><div className="row-actions"><button className="btn small ghost" onClick={() => setSelected(r)}>Voir l’aperçu</button>{r.status === "pending_finance" && role === "finance" && <button className="btn small blue" onClick={() => setEvalId(r.id)}>Évaluer</button>}</div></td></tr>)}</tbody></table></div>
    </section>
    {selected && <Modal title="Aperçu de la demande" text="Vérifiez le détail, le montant évalué et le statut avant votre décision." onClose={() => setSelected(null)}><div className="request-preview"><h3>{selected.subject}</h3><p>{selected.details}</p><dl><div><dt>Catégorie</dt><dd>{selected.category || "—"}</dd></div><div><dt>Auteur</dt><dd>{selected.requestedBy}</dd></div><div><dt>Montant</dt><dd>{selected.amount ? money.format(selected.amount) : "En attente de l’évaluation Finance"}</dd></div><div><dt>État</dt><dd><Status value={selected.status}/></dd></div><div><dt>Créée le</dt><dd>{selected.createdAt}</dd></div></dl>{selected.status === "pending_admin" && role === "principal_admin" ? <><p>Votre décision sera enregistrée et une notification sera remise à l’auteur.</p><ApprovalActions id={selected.id} type="request" label={selected.subject}/></> : selected.status === "pending_finance" ? <p>La Finance doit d’abord évaluer le montant.</p> : <p>Cette demande a déjà été traitée.</p>}</div></Modal>}
    {create.open && <Modal title="Nouvelle demande" text="La demande sera envoyée à la Finance." onClose={create.hide}><form className="app-form" onSubmit={add}><Field label="Objet"><input name="subject" required/></Field><Field label="Catégorie"><select name="category"><option>Pédagogie</option><option>Matériel</option><option>Entretien</option><option>Événement</option><option>Autre</option></select></Field><Field label="Description"><textarea name="details" rows={4} required/></Field><div className="form-actions"><button type="button" className="btn ghost" onClick={create.hide}>Annuler</button><button className="btn primary">Envoyer à la Finance</button></div></form></Modal>}
    {evalId && <Modal title="Évaluer la demande" text="Ajoutez le montant nécessaire avant transmission à l’Admin." onClose={() => setEvalId(null)}><form className="app-form" onSubmit={evaluate}><Field label="Montant évalué (CDF)"><input name="amount" type="number" min="1" required autoFocus/></Field><div className="form-actions"><button type="button" className="btn ghost" onClick={() => setEvalId(null)}>Annuler</button><button className="btn primary">Envoyer à l’Admin</button></div></form></Modal>}
  </>;
}
