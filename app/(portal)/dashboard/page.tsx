"use client";
import Link from "next/link";
import { ArrowDownLeft,ArrowUpRight,BookOpen,ClipboardCheck,FileText,School,Users,WalletCards } from "lucide-react";
import { useStore } from "@/app/providers";
import { money,PageIntro,Status } from "@/components/ui";

export default function Dashboard(){
  const store=useStore();
  if(store.role==="direction") return <DirectionDashboard/>;
  if(store.role==="finance") return <FinanceDashboard/>;
  return <AdminDashboard/>;
}

function AdminDashboard(){
  const{students,classes,requests,transactions}=useStore();
  const income=sum(transactions,"income"),expense=sum(transactions,"expense");
  const pending=requests.filter(x=>x.status==="pending_admin").length+transactions.filter(x=>x.status==="pending").length;
  return <><PageIntro title="Vue générale de l’école" text="Pilotage consolidé de Glory House et éléments nécessitant votre validation." action={<Link className="btn primary" href="/validations"><ClipboardCheck/>Ouvrir les validations</Link>}/><Stats items={[["Encaissements validés",money.format(income),"Vue financière","blue","in"],["Dépenses validées",money.format(expense),"Vue financière","red","out"],["Effectif total",String(students.length),`${classes.length} classes actives`,"blue","users"],["À valider",String(pending),"Demandes et opérations","red","check"]]}/><div className="dashboard-grid"><RequestsCard title="Demandes à valider" filter="pending_admin"/><TransactionsCard title="Opérations à valider" onlyPending/></div></>;
}

function DirectionDashboard(){
  const{students,classes,requests}=useStore();
  const active=students.filter(x=>x.status==="Actif").length;
  const capacity=classes.reduce((s,c)=>s+c.capacity,0),enrolled=classes.reduce((s,c)=>s+c.students,0);
  const processing=requests.filter(x=>x.status==="pending_finance"||x.status==="pending_admin").length;
  return <><PageIntro title="Tableau de bord de la Direction" text="Suivi administratif, pédagogique et organisationnel de l’école." action={<Link className="btn primary" href="/direction/demandes"><FileText/>Faire une demande</Link>}/><Stats items={[["Élèves actifs",String(active),`${students.length-active} dossier(s) inactif(s)`,"blue","users"],["Classes actives",String(classes.length),`${capacity} places disponibles`,"red","school"],["Taux d’occupation",`${capacity?Math.round(enrolled/capacity*100):0}%`,`${enrolled} élèves affectés`,"blue","book"],["Demandes en cours",String(processing),"Finance ou Admin","red","check"]]}/><div className="dashboard-grid"><section className="app-card"><div className="card-head"><div><h3>Occupation des classes</h3><p>Effectifs et capacité par classe</p></div><Link href="/direction/classes">Gérer →</Link></div><div className="direction-classes">{classes.slice(0,5).map(c=><div key={c.id}><span><b>{c.name}</b><small>{c.teacher}</small></span><i><em style={{width:`${c.students/c.capacity*100}%`}}/></i><strong>{c.students}/{c.capacity}</strong></div>)}</div></section><RequestsCard title="Mes demandes récentes"/></div></>;
}

function FinanceDashboard(){
  const{requests,transactions}=useStore();
  const income=sum(transactions,"income"),expense=sum(transactions,"expense");
  const toEvaluate=requests.filter(x=>x.status==="pending_finance").length;
  const waiting=transactions.filter(x=>x.status==="pending").length;
  return <><PageIntro title="Tableau de bord Finance" text="Suivi des entrées, sorties et demandes transmises par la Direction." action={<Link className="btn primary" href="/finance/operations"><WalletCards/>Nouvelle opération</Link>}/><Stats items={[["Total des entrées",money.format(income),"Opérations validées","blue","in"],["Total des sorties",money.format(expense),"Opérations validées","red","out"],["Solde actuel",money.format(income-expense),"Entrées moins sorties","blue","wallet"],["Demandes à évaluer",String(toEvaluate),`${waiting} opération(s) en attente`,"red","check"]]}/><div className="dashboard-grid"><RequestsCard title="Demandes à chiffrer" filter="pending_finance"/><TransactionsCard title="Activité financière récente"/></div></>;
}

type StatItem=[string,string,string,"blue"|"red","in"|"out"|"users"|"check"|"school"|"book"|"wallet"];
function Stats({items}:{items:StatItem[]}){const icons={in:ArrowDownLeft,out:ArrowUpRight,users:Users,check:ClipboardCheck,school:School,book:BookOpen,wallet:WalletCards};return <section className="app-stats">{items.map(([label,value,note,color,icon])=>{const Icon=icons[icon];return <article key={label}><i className={color}><Icon/></i><div><p>{label}</p><h3>{value}</h3><small>{note}</small></div></article>})}</section>}
function RequestsCard({title,filter}:{title:string;filter?:"pending_admin"|"pending_finance"}){const{requests}=useStore();const list=filter?requests.filter(x=>x.status===filter):requests;return <section className="app-card"><div className="card-head"><div><h3>{title}</h3><p>Circuit Direction → Finance → Admin</p></div><Link href="/direction/demandes">Voir tout →</Link></div><div className="simple-list">{list.slice(0,5).map(r=><div key={r.id}><i><BookOpen/></i><div><b>{r.subject}</b><small>{r.category} · {r.createdAt}</small></div><strong>{r.amount?money.format(r.amount):"—"}</strong><Status value={r.status}/></div>)}{!list.length&&<p className="empty-state">Aucune demande dans cette catégorie.</p>}</div></section>}
function TransactionsCard({title,onlyPending=false}:{title:string;onlyPending?:boolean}){const{transactions}=useStore();const list=onlyPending?transactions.filter(x=>x.status==="pending"):transactions;return <section className="app-card"><div className="card-head"><div><h3>{title}</h3><p>Mouvements financiers</p></div><Link href="/finance/operations">Voir tout →</Link></div><div className="compact-list">{list.slice(0,5).map(t=><div key={t.id}><span className={t.kind}>{t.kind==="income"?"+":"−"}</span><div><b>{t.label}</b><small>{t.date}</small></div><strong>{money.format(t.amount)}</strong></div>)}{!list.length&&<p className="empty-state">Aucune opération à afficher.</p>}</div></section>}
function sum(items:ReturnType<typeof useStore>["transactions"],kind:"income"|"expense"){return items.filter(x=>x.kind===kind&&x.status==="approved").reduce((total,x)=>total+x.amount,0)}
