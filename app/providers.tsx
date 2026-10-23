"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import type { Role, SchoolClass, SchoolRequest, StaffUser, Student, Transaction } from "@/lib/types";
type Store = { role: Role; name: string; setRole: (r: Role) => void; students: Student[]; classes: SchoolClass[]; requests: SchoolRequest[]; transactions: Transaction[]; users: StaffUser[]; addStudent: (v: Omit<Student,"id"|"status">) => void; addClass: (v: Omit<SchoolClass,"id"|"students">) => void; addRequest: (v: Pick<SchoolRequest,"subject"|"details"|"category"|"amount">) => void; decideRequest:(id:string,a:boolean)=>Promise<boolean>; addTransaction:(v:Omit<Transaction,"id"|"status"|"date">)=>void; decideTransaction:(id:string,a:boolean)=>Promise<boolean>; addUser:(v:Pick<StaffUser,"name"|"email"|"role">)=>void; toggleUser:(id:string)=>void };
const C = createContext<Store|null>(null);
export function Providers({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const [data, setData] = useState({ role: "direction" as Role, name: "", students: [] as Student[], classes: [] as SchoolClass[], requests: [] as SchoolRequest[], transactions: [] as Transaction[], users: [] as StaffUser[] });
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const publicPage = ["/connexion", "/nouveau-mot-de-passe", "/"].includes(path);
  async function load() {
    const response = await fetch("/api/store", { cache: "no-store" });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error);
    setData(result); setLoaded(true);
  }
  useEffect(() => { if (!publicPage) { setLoaded(false); setError(""); load().catch(e => setError(e.message)); } }, [path, publicPage]);
  async function mutate(action: string, payload: object): Promise<boolean> {
    setError("");
    try {
      const response = await fetch("/api/store", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, ...payload }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      if (action === "decideRequest" || action === "decideTransaction") {
        setData(current => ({ ...current,
          requests: action === "decideRequest" ? current.requests.map(item => item.id === (payload as { id: string }).id ? { ...item, status: (payload as { approved: boolean }).approved ? "approved" : "rejected" } : item) : current.requests,
          transactions: action === "decideTransaction" ? current.transactions.map(item => item.id === (payload as { id: string }).id ? { ...item, status: (payload as { approved: boolean }).approved ? "approved" : "rejected" } : item) : current.transactions
        }));
      }
      await load();
      return true;
    } catch(e) { setError(e instanceof Error ? e.message : "Opération impossible."); return false; }
  }
  const value: Store = { ...data, setRole: () => {}, addStudent: value => { void mutate("addStudent", { value }); }, addClass: value => { void mutate("addClass", { value }); }, addRequest: value => { void mutate("addRequest", { value }); }, decideRequest: (id,approved) => mutate("decideRequest", { id,approved }), addTransaction: value => { void mutate("addTransaction", { value }); }, decideTransaction: (id,approved) => mutate("decideTransaction", { id,approved }), addUser: () => setError("Utilisez la page Utilisateurs."), toggleUser: () => setError("Modification du statut indisponible.") };
  const denied = loaded && ((path.startsWith("/direction") && data.role === "finance") || (path.startsWith("/finance") && data.role === "direction") || (["/utilisateurs", "/validations"].includes(path) && data.role !== "principal_admin"));
  return <C.Provider value={value}>{error && <p role="alert">{error}</p>}{publicPage ? children : denied ? <p>Accès refusé pour votre rôle.</p> : loaded ? children : <p>Chargement des données…</p>}</C.Provider>;
}
export function useStore() { const value = useContext(C); if (!value) throw new Error("Store unavailable"); return value; }
