"use client";
import { Search,X } from "lucide-react";import { useState } from "react";
export const money=new Intl.NumberFormat("fr-CD",{style:"currency",currency:"CDF",maximumFractionDigits:0});
export function PageIntro({title,text,action}:{title:string;text:string;action?:React.ReactNode}){return <div className="page-intro"><div><h2>{title}</h2><p>{text}</p></div>{action}</div>}
export function SearchBox({value,onChange,placeholder="Rechercher..."}:{value:string;onChange:(v:string)=>void;placeholder?:string}){return <label className="app-search"><Search/><input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}/></label>}
export function Modal({title,text,onClose,children}:{title:string;text?:string;onClose:()=>void;children:React.ReactNode}){return <div className="app-modal-backdrop" role="dialog" aria-modal="true"><div className="app-modal"><button className="app-modal-x" onClick={onClose}><X/></button><h2>{title}</h2>{text&&<p>{text}</p>}{children}</div></div>}
export function Field({label,children}:{label:string;children:React.ReactNode}){return <label className="app-field"><span>{label}</span>{children}</label>}
export function Status({value}:{value:string}){const names:Record<string,string>={pending:"En attente",approved:"Validée",rejected:"Refusée",pending_finance:"À évaluer",pending_admin:"À valider",Actif:"Actif",Inactif:"Inactif"};return <span className={`app-status ${value}`}>{names[value]??value}</span>}
export function useModal(){const[open,setOpen]=useState(false);return{open,show:()=>setOpen(true),hide:()=>setOpen(false)}}
