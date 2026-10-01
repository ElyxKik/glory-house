# Glory House

Tableau d'administration Next.js pour Glory House, pensé pour Vercel et Supabase.

## Rôles

- **Admin principale** : crée les autres administrateurs, gère les utilisateurs et valide/refuse chaque opération financière.
- **Finance** : enregistre les paiements d'élèves, ventes de cantine, achats et dépenses. Toute nouvelle opération est créée avec le statut `pending`.
- **Direction** : gère les élèves, classes, organisation de l'école et rapports. Ce rôle n'accède pas à l'écriture des finances.

## Circuit des demandes

1. La Direction crée une demande avec son objet et sa description.
2. La Finance évalue le besoin, ajoute le montant en CDF et transmet la demande.
3. L'Admin principale valide ou refuse la demande évaluée.

Les règles RLS empêchent de sauter une étape ou de traiter une demande avec un rôle non autorisé.

## Pages disponibles

- `/dashboard` : vue d'ensemble et indicateurs ;
- `/direction/eleves`, `/direction/classes`, `/direction/demandes`, `/direction/rapports` ;
- `/finance/operations`, `/finance/paiements`, `/finance/depenses` ;
- `/validations`, `/utilisateurs` et `/parametres` ;
- `/connexion` : écran de connexion prêt pour Supabase Auth.

En l'absence de variables Supabase, le mode démonstration conserve les ajouts et validations dans le navigateur (`localStorage`). Le sélecteur de rôle situé en bas du menu permet de tester chaque étape du circuit.

Les règles RLS de Supabase appliquent ces permissions côté base de données, pas seulement dans l'interface.

## Démarrage local

1. Copiez `.env.example` vers `.env.local` et renseignez les variables Supabase.
2. Exécutez le contenu de `supabase/migrations/001_glory_house.sql` dans le SQL Editor de votre projet Supabase (ou utilisez la CLI Supabase).
3. Lancez `npm run dev`.

Pour attribuer le premier admin principal après la création de son compte dans Supabase Auth :

```sql
insert into public.profiles (id, full_name, role)
values ('ID_UTILISATEUR_AUTH', 'Anne-Marie', 'principal_admin');
```

## Déploiement Vercel et maintien Supabase

Le fichier `vercel.json` programme un appel à `04:00 UTC` tous les jours vers `/api/cron/supabase-keepalive`. Cette route sécurisée appelle la fonction SQL `keep_alive()` : cela crée une activité quotidienne côté base de données.

Dans les variables d'environnement Vercel, ajoutez celles de `.env.example`, notamment :

- `SUPABASE_ANON_KEY` et `SUPABASE_SERVICE_ROLE_KEY` (uniquement côté serveur, jamais dans une variable `NEXT_PUBLIC_*`) ;
- `CRON_SECRET`, une longue valeur aléatoire. Vercel la transmet automatiquement comme en-tête d'autorisation aux tâches Cron.

> Le maintien d'activité réduit le risque de mise en pause liée à l'inactivité, mais ne remplace pas les limites, quotas ou règles du plan Supabase/Vercel. Vérifiez les conditions de votre offre avant la mise en production.

## Contrôle avant publication

Dans Vercel, configurez les quatre variables obligatoires listées dans `.env.example`, puis exécutez :

```bash
npm run check:deploy
```

Le contrôle échoue volontairement si une variable manque ou si `CRON_SECRET` est trop court. Ne publiez jamais `SUPABASE_SERVICE_ROLE_KEY` dans une variable préfixée par `NEXT_PUBLIC_`.
