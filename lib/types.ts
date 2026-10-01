export type Role = "principal_admin" | "finance" | "direction";
export type RequestStatus = "pending_finance" | "pending_admin" | "approved" | "rejected";
export type Student = { id: string; name: string; gender: "F" | "M"; className: string; guardian: string; phone: string; status: "Actif" | "Inactif" };
export type SchoolClass = { id: string; name: string; level: string; teacher: string; students: number; capacity: number };
export type SchoolRequest = { id: string; subject: string; details: string; category: string; amount: number | null; status: RequestStatus; requestedBy: string; createdAt: string };
export type Transaction = { id: string; label: string; category: string; amount: number; kind: "income" | "expense"; status: "pending" | "approved" | "rejected"; date: string };
export type StaffUser = { id: string; name: string; email: string; role: Role; active: boolean };
