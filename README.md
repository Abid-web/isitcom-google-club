# ISITCOM Google Club

Site vitrine et plateforme d'adhésion officielle de l'**ISITCOM Google Club** (Hammam Sousse, Tunisie), propulsée par React 18, Vite 5, GSAP 3.12, Supabase et du CSS Vanilla.

---

## 🚀 Démarrage Rapide

### Prérequis
* Node.js v18+
* `pnpm` (ou `npm`)

### Installation & Développement
```bash
# Installation des dépendances
pnpm install # ou npm install

# Lancement du serveur de développement
pnpm dev # ou npm run dev
```
Le site est accessible sur `http://localhost:5173`.

### Build de Production
```bash
pnpm build # ou npm run build
pnpm preview # ou npm run preview
```

---

## 🛡️ Espace Administration (`/admin` ou `#/admin`)

Le club dispose d'un **Dashboard d'administration complet** accessible sur `http://localhost:5173/#/admin` (ou `/admin`).

### Fonctionnalités de l'Admin :
1. **Authentification sécurisée** : Connexion via Supabase Auth avec vérification du rôle dans `public.admin_users`. Protection anti-brute force intégrée.
2. **Vue d'ensemble (KPIs & Graphiques)** : Compteurs en direct (total candidatures, acceptées, taux d'admission, événements à venir, membres du bureau), graphique d'activité SVG interactif sur 30 jours, répartition par département.
3. **Candidatures** : Recherche multi-critères, filtres par statut et pôle, détail en tiroir latéral, changement de statut (`new`, `reviewing`, `accepted`, `rejected`), notes internes partagées, copie groupée des emails et **export CSV** UTF-8.
4. **Événements** : Planification des ateliers/conférences, calcul automatique des événements à venir et passés, téléversement d'affiches vers Supabase Storage.
5. **Bureau & Équipe** : Gestion des cartes membres avec leurs rôles, photos, liens LinkedIn/email, boutons de réordonnancement immédiat (monter / descendre).
6. **Contenu & Chiffres Clés** : Mise à jour en direct de la mission du club, des 3 actes/départements et des compteurs d'impact (membres, ateliers, certificats, partenariats).
7. **Galerie Média** : Téléversement par glisser-déposer vers le bucket `club-media` et gestion des légendes du carrousel.
8. **Paramètres Club** : Interrupteur d'ouverture/fermeture des candidatures publiques avec message personnalisé, coordonnées et liens officiels (Instagram, LinkedIn, etc.).
9. **Sécurité & Monitoring** : Tableau de bord de surveillance anti-spam, consultation des tentatives enregistrées par le rate-limiter roulant (avec masquage respectueux des adresses IP).

---

## 🗄️ Configuration Supabase & Base de Données

### 1. Variables d'environnement
Copiez `.env.example` en `.env` à la racine :
```bash
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=votre-cle-anon-publique
```

### 2. Exécution des migrations SQL
Dans le tableau de bord Supabase (*SQL Editor*), exécutez dans l'ordre les scripts du dossier `supabase/migrations/` :
1. `20261027_rate_limit_club_applications.sql` : Protection du formulaire de candidature (honeypot, rate-limit, verrous transactionnels).
2. `20261027_make_motivation_optional.sql` : Assouplissement de la contrainte sur la motivation.
3. `20261028_admin_schema_and_tables.sql` : Schéma d'administration, politiques RLS, bucket de stockage et RPCs.
4. `20261028_seed_initial_club_data.sql` : Seed initial pré-remplissant départements, bureau, événements et réglages du club.

### 3. Création du Premier Administrateur
1. Dans Supabase, allez dans **Authentication > Users** et créez un nouvel utilisateur avec votre email et un mot de passe fort (ex: `admin@isitcomgoogleclub.tn`).
2. Récupérez son `User UID`.
3. Dans **SQL Editor**, attribuez-lui le rôle administrateur :
```sql
insert into public.admin_users (id, email, role, full_name)
values (
  'VOTRE_USER_UID_ICI',
  'admin@isitcomgoogleclub.tn',
  'admin',
  'Mohamed Khalil Ayadhi'
);
```
4. Connectez-vous sur `http://localhost:5173/#/admin` !

---

## 📁 Architecture du Projet

```plaintext
src/
├── admin/                     # Dashboard d'administration (Lazy Loaded)
│   ├── admin.css              # Styles Vanilla CSS dédiés à l'admin (thème dark/light)
│   ├── AdminApp.jsx           # Routeur et point d'entrée de l'espace admin
│   ├── components/            # Layout, StatCard, TrendChart SVG, Modal, Toast, ImageUploader
│   ├── hooks/                 # useAuth, useTable, useToast
│   ├── lib/                   # adminApi.js, authClient.js (GoTrue REST), csvExport.js
│   └── pages/                 # Overview, Applications, Events, Team, Content, Gallery, Settings, Security
├── components/
│   ├── Layout.jsx             # Loader (chéchia), Header, Nav latérale, Curseur
│   ├── Sections.jsx           # Hero, Marquee, About, Departments, Events, Gallery, Footer
│   ├── TeamSection.jsx        # Cartes 3D interactives de l'équipe
│   └── JoinForm.jsx           # Formulaire de candidature sécurisé (respecte l'état d'ouverture)
├── lib/
│   ├── publicData.js          # Chargement dynamique des données avec fallback automatique sur data.js
│   └── supabaseRest.js        # Client fetch natif pour PostgREST, Auth et Storage
├── data.js                    # Données statiques de secours (résilience hors-ligne)
├── styles.css                 # Système de design tokens et styles du site public
└── vite.config.js             # Configuration Vite avec support des préfixes VITE_ et NEXT_PUBLIC_
```

---

## 🔒 Checklist de Sécurité Respectée
* ✅ **Aucune clé `service_role` côté client** : uniquement la clé publishable / anonyme.
* ✅ **Contrôle d'accès RLS strict** : les tables sensibles et l'écriture sont verrouillées par `public.is_admin()`.
* ✅ **Isolation totale du site public** : l'admin est chargé via `React.lazy`, sans impact sur le chargement public.
* ✅ **Résilience maximale** : si Supabase est hors ligne, le site public continue de fonctionner normalement avec les données de secours de `data.js`.
* ✅ **Protection anti-spam** : champ honeypot, verrous PostgreSQL anti-rafale, limitations de débit IP/Email.
