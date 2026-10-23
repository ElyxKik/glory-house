import nextEnv from "@next/env";
import { createClient } from "@supabase/supabase-js";

nextEnv.loadEnvConfig(process.cwd());
const email = process.argv[2];
if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error("Usage: node scripts/send-password-reset.mjs adresse@example.com");
  process.exit(1);
}
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_ANON_KEY;
if (!url || !key) throw new Error("Configuration Supabase manquante.");
const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const { error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: "https://admin.glory-house.online/nouveau-mot-de-passe"
});
if (error) { console.error(error.message); process.exit(1); }
console.log("Demande d’envoi acceptée par Supabase.");
