import type { Metadata } from "next";
import "./globals.css";
import "./palette.css";
import "./workflow.css";
import "./app.css";
import "./role-dashboard.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Glory House | Administration",
  description: "Portail d'administration de Glory House"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fr"><body><Providers>{children}</Providers></body></html>;
}
