#!/usr/bin/env node
/**
 * Génère les visuels du site avec Gemini (photo réaliste, charte bleu/blanc Netquoo).
 * Usage : node scripts/generate-images.mjs [nom...]   (sans argument : toutes les images manquantes)
 * Sortie : public/images/<nom>.webp
 * La clé est injectée par le proxy de l'environnement Claude Code, ou lue dans GEMINI_API_KEY.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import sharp from 'sharp';

if (process.env.HTTPS_PROXY && !process.env.NODE_USE_ENV_PROXY) {
  const r = spawnSync(process.execPath, ['--no-warnings', ...process.argv.slice(1)], {
    stdio: 'inherit',
    env: { ...process.env, NODE_USE_ENV_PROXY: '1' },
  });
  process.exit(r.status ?? 1);
}

const MODELS = ['gemini-3.1-flash-image', 'gemini-2.5-flash-image'];
const OUT_DIR = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../public/images');

const CHARTE = `Charte : les agents d'entretien de l'entreprise portent une tenue de travail bleu marine avec des détails blancs, sans logo lisible.
Ambiance professionnelle, lumineuse et premium, dominante de blancs et de bleus, lumière naturelle du sud de la France.
Interdits : aucun texte ni logo lisible, pas de visage en très gros plan, pas de mains déformées, pas d'aspect dessin ou 3D, pas de filigrane.`;

const IMAGES = {
  hero: { ratio: '16:9', w: 1920, h: 1080, scene: "Grand open space moderne et lumineux, baies vitrées donnant sur la garrigue et les collines de l'Hérault, bureaux blancs impeccables, une agente d'entretien en tenue bleu marine nettoie un plan de travail avec une microfibre bleue, chariot de nettoyage professionnel discret au second plan." },
  bureaux: { ratio: '4:3', w: 1200, h: 900, scene: "Agent d'entretien en tenue bleu marine qui désinfecte des bureaux et des écrans dans un espace de travail contemporain, chaises ergonomiques, plantes vertes, lumière du matin." },
  commerces: { ratio: '4:3', w: 1200, h: 900, scene: "Agente d'entretien en tenue bleu marine qui nettoie le sol brillant d'une boutique moderne avant l'ouverture, vitrine lumineuse, présentoirs épurés." },
  medical: { ratio: '4:3', w: 1200, h: 900, scene: "Salle d'attente d'un cabinet médical moderne, blanche et bleu clair, un agent en tenue bleu marine et gants désinfecte les accoudoirs des fauteuils, ambiance hygiène irréprochable." },
  vitres: { ratio: '4:3', w: 1200, h: 900, scene: "Laveur de vitres en tenue bleu marine qui nettoie une grande façade vitrée de bureaux avec une raclette et une perche, ciel bleu méditerranéen, reflets nets." },
  chantier: { ratio: '4:3', w: 1200, h: 900, scene: "Nettoyage de fin de chantier dans un local professionnel neuf aux murs blancs, un agent en tenue bleu marine passe un aspirateur industriel, protections de chantier retirées, lumière naturelle." },
  entrepots: { ratio: '4:3', w: 1200, h: 900, scene: "Agent en tenue bleu marine qui conduit une autolaveuse dans un entrepôt logistique propre et lumineux, racks bien rangés, sol béton gris clair brillant." },
  equipe: { ratio: '4:3', w: 1200, h: 900, scene: "Petite équipe de trois agents d'entretien souriants en tenue bleu marine, debout devant l'entrée vitrée d'un immeuble de bureaux moderne dans un parc d'activités de l'Hérault, plan américain, chariot de nettoyage professionnel." },
  village: { ratio: '16:9', w: 1600, h: 900, scene: "Vue d'un village typique de l'Hérault au pied des collines de garrigue, maisons en pierre claire et toits de tuiles, petite zone d'activités moderne en périphérie, ciel bleu, aucune personne. Aucun agent d'entretien dans cette image." },
};

async function generate(model, img) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  const headers = { 'Content-Type': 'application/json' };
  if (process.env.GEMINI_API_KEY) headers['x-goog-api-key'] = process.env.GEMINI_API_KEY;
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      contents: [{ parts: [{ text: `Photographie réaliste haut de gamme pour le site d'une société de nettoyage professionnel pour entreprises.\nScène : ${img.scene}\n${CHARTE}` }] }],
      generationConfig: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio: img.ratio } },
    }),
  });
  if (!res.ok) throw new Error(`${model}: HTTP ${res.status} ${(await res.text()).slice(0, 300)}`);
  const json = await res.json();
  const part = json.candidates?.[0]?.content?.parts?.find((p) => p.inlineData || p.inline_data);
  const data = part?.inlineData?.data ?? part?.inline_data?.data;
  if (!data) throw new Error(`${model}: aucune image dans la réponse`);
  return Buffer.from(data, 'base64');
}

async function run(name) {
  const img = IMAGES[name];
  const errors = [];
  for (const model of MODELS) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const buf = await generate(model, img);
        await sharp(buf).resize(img.w, img.h, { fit: 'cover' }).webp({ quality: 78 }).toFile(path.join(OUT_DIR, `${name}.webp`));
        console.log(`ok ${name} (${model})`);
        return;
      } catch (e) {
        errors.push(e.message);
      }
    }
  }
  console.error(`échec ${name}:\n  ${errors.join('\n  ')}`);
}

fs.mkdirSync(OUT_DIR, { recursive: true });
const args = process.argv.slice(2);
const names = args.length ? args : Object.keys(IMAGES).filter((n) => !fs.existsSync(path.join(OUT_DIR, `${n}.webp`)));
await Promise.all(names.map(run));
