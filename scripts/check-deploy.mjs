const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "CRON_SECRET"
];

const missing = required.filter((name) => !process.env[name]);
if (missing.length) {
  console.error(`Variables manquantes : ${missing.join(", ")}`);
  console.error("Ajoutez-les dans Vercel avant la mise en production.");
  process.exit(1);
}

if ((process.env.CRON_SECRET ?? "").length < 32) {
  console.error("CRON_SECRET doit contenir au moins 32 caractères.");
  process.exit(1);
}

console.log("Configuration de déploiement valide.");
