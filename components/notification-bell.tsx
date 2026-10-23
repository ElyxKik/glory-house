"use client";
import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
type Notification = { id: string; title: string; message: string; created_at: string; read_at: string | null };
export function NotificationBell() {
  const [items, setItems] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  useEffect(() => { fetch("/api/notifications", { cache: "no-store" }).then(r => r.ok ? r.json() : null).then(d => { if (d) setItems(d.notifications); }).catch(() => {}); }, []);
  async function markRead(item: Notification) {
    if (item.read_at) return;
    await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: item.id }) });
    setItems(a => a.map(n => n.id === item.id ? { ...n, read_at: new Date().toISOString() } : n));
  }
  const unread = items.filter(x => !x.read_at).length;
  return <div className="notification-menu"><button type="button" aria-label={`${unread} notification(s) non lue(s)`} onClick={() => setOpen(!open)}><Bell/>{unread > 0 && <i>{unread}</i>}</button>{open && <section className="notification-panel"><h3>Notifications</h3>{items.map(n => <button type="button" key={n.id} className={n.read_at ? "notification-read" : "notification-unread"} onClick={() => void markRead(n)}><b>{n.title}</b><span>{n.message}</span><small>{new Intl.DateTimeFormat("fr-CD", { dateStyle: "medium", timeStyle: "short" }).format(new Date(n.created_at))}</small></button>)}{!items.length && <p>Aucune notification.</p>}</section>}</div>;
}
