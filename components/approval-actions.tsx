"use client";
import { useRef, useState } from "react";
import { Check, X } from "lucide-react";
import { useStore } from "@/app/providers";

export function ApprovalActions({ id, type, label }: { id: string; type: "request" | "transaction"; label: string }) {
  const { role, decideRequest, decideTransaction } = useStore();
  const locked = useRef(false);
  const [busy, setBusy] = useState(false);
  const [decision, setDecision] = useState<boolean | null>(null);
  if (role !== "principal_admin") return null;
  async function decide(approved: boolean) {
    if (locked.current) return;
    locked.current = true; setBusy(true);
    try {
      const success = await (type === "request" ? decideRequest(id, approved) : decideTransaction(id, approved));
      if (success) setDecision(approved);
    } finally { locked.current = false; setBusy(false); }
  }
  return <div className="row-actions" aria-busy={busy}><button type="button" className="btn small primary" disabled={busy || decision !== null} aria-label={`Valider : ${label}`} onClick={() => void decide(true)}><Check/>{decision === true ? "Validée" : busy ? "Traitement…" : "Valider"}</button><button type="button" className="btn small ghost" disabled={busy || decision !== null} aria-label={`Refuser : ${label}`} onClick={() => void decide(false)}><X/>{decision === false ? "Refusée" : "Refuser"}</button></div>;
}
