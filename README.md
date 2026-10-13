# Netquoo — site vitrine

Site de **Netquoo**, société de nettoyage professionnel pour entreprises à Montarnaud (34570) et dans un rayon de 20 km.

- **Stack** : Next.js 15 (App Router, pages statiques), React 19, Tailwind CSS 3, TypeScript.
- **Hébergement** : Vercel (projet `netquoo`), déploiement automatique à chaque push sur `main`.

## Démarrer

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # build de production
```

## À compléter

- `src/config/site.ts` : téléphone, email, adresse, SIRET (les champs vides sont masqués sur le site), URL définitive.
- Variables d'environnement Vercel pour le formulaire de devis (voir `.env.example`) : `RESEND_API_KEY`, `DEVIS_TO_EMAIL`, `DEVIS_FROM_EMAIL`, `NEXT_PUBLIC_SITE_URL`.

## Contenu

| Élément | Fichier |
| --- | --- |
| Communes desservies (73, ≤ 20 km, données geo.api.gouv.fr) | `src/data/communes.ts` |
| Texte unique de chaque page commune | `src/content/communes/<slug>.json` |
| Services (données de base) | `src/data/services.ts` |
| Contenu détaillé des services | `src/content/services-content.ts` |

## Scripts

- `node scripts/check-duplicate-content.mjs` : vérifie que les pages communes ne se dupliquent pas (similarité 5-grammes, phrases identiques, balises meta).
- `npm run images` : régénère les visuels manquants de `public/images/` avec Gemini.
