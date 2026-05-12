# Déploiement StudioRadar

## Stack
- **Web** → Vercel (Next.js 14)
- **Mobile** → Expo EAS (iOS + Android)
- **Backend** → Supabase (DB, Auth, Storage, Realtime, Edge Functions)
- **Paiements** → Stripe
- **Cartes** → Mapbox

---

## 1. Supabase (production)

1. Créer un projet sur [supabase.com](https://supabase.com)
2. Appliquer les migrations dans l'ordre :
   ```bash
   supabase db push
   # ou manuellement dans l'éditeur SQL :
   # 001_initial_schema.sql
   # 002_bookings_stripe.sql
   # 003_push_notifications.sql
   # 004_reviews.sql
   # 005_chat.sql
   ```
3. Activer Realtime sur les tables : `conversations`, `messages`, `studios`, `bookings`
4. Déployer l'Edge Function :
   ```bash
   supabase functions deploy send-notification --project-ref xxxxx
   ```
5. Récupérer les clés : Project Settings → API

---

## 2. Web — Vercel

### Setup

1. Push le code sur GitHub
2. Connecter le repo sur [vercel.com](https://vercel.com)
3. Configurer :
   - **Root Directory** : `apps/web`
   - **Framework** : Next.js (auto-détecté)

### Variables d'environnement

Dans Vercel Dashboard → Settings → Environment Variables :

```
NEXT_PUBLIC_SUPABASE_URL          = https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY     = eyJ...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY= pk_live_...
STRIPE_SECRET_KEY                 = sk_live_...
STRIPE_WEBHOOK_SECRET             = whsec_...
NEXT_PUBLIC_MAPBOX_TOKEN          = pk.eyJ1...
```

### Stripe Webhook

Dans Stripe Dashboard → Webhooks → Add endpoint :
- URL : `https://studioradar.vercel.app/api/payment/webhook`
- Events : `payment_intent.succeeded`

---

## 3. Mobile — Expo EAS

### Prérequis
```bash
npm install -g eas-cli
eas login
```

### Configuration
```bash
cd apps/mobile
# Créer le fichier .env avec les vraies clés :
cp .env.example .env
# Éditer .env avec les valeurs de production
```

### Build

```bash
# iOS (TestFlight / App Store)
eas build --platform ios --profile production

# Android (APK interne ou Play Store)
eas build --platform android --profile production

# Les deux en même temps
eas build --platform all --profile production
```

### Preview build (test interne)
```bash
eas build --platform android --profile preview
# Envoie un APK téléchargeable directement
```

### Submit aux stores
```bash
eas submit --platform ios     # App Store Connect
eas submit --platform android # Google Play
```

### Variables d'environnement EAS

Dans `eas.json` → ou via :
```bash
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "https://xxxxx.supabase.co"
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "eyJ..."
eas secret:create --scope project --name EXPO_PUBLIC_MAPBOX_TOKEN --value "pk.eyJ1..."
```

---

## 4. Domaine custom (optionnel)

Dans Vercel → Domains → Add `studioradar.fr`
Configurer les DNS chez ton registrar :
```
CNAME  www   cname.vercel-dns.com
A      @     76.76.21.21
```

---

## 5. Checklist avant mise en production

- [ ] Migrations Supabase appliquées
- [ ] RLS activé sur toutes les tables
- [ ] Edge Function `send-notification` déployée
- [ ] Variables d'environnement configurées sur Vercel
- [ ] Webhook Stripe pointant vers la prod
- [ ] App Store Connect configuré (Bundle ID: `com.studioradar.app`)
- [ ] Google Play Console configuré
- [ ] Build EAS production créé
