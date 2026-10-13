#!/usr/bin/env node
/**
 * Détecte le contenu dupliqué entre les pages communes (src/content/communes/*.json).
 * - similarité de Jaccard sur des 5-grammes de mots, pour chaque paire de pages
 * - phrases strictement identiques présentes sur plusieurs pages
 * Usage : node scripts/check-duplicate-content.mjs [seuil=0.12]
 */
import fs from 'node:fs';
import path from 'node:path';

const DIR = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../src/content/communes');
const threshold = Number(process.argv[2] ?? 0.12);

const pages = fs
  .readdirSync(DIR)
  .filter((f) => f.endsWith('.json'))
  .map((f) => {
    const j = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));
    const parts = [j.h1, ...j.intro, ...j.sections.flatMap((s) => [s.title, ...s.paragraphs]), ...j.faq.flatMap((q) => [q.q, q.a])];
    return { slug: j.slug, name: j.h1, text: parts.join(' '), meta: [j.metaTitle, j.metaDescription] };
  });

// Neutralise le nom de la commune pour ne pas masquer une duplication « à trous »
const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
const shingles = (text, n = 5) => {
  const w = norm(text).split(' ');
  const set = new Set();
  for (let i = 0; i + n <= w.length; i++) set.add(w.slice(i, i + n).join(' '));
  return set;
};
for (const p of pages) {
  p.words = norm(p.text).split(' ').length;
  p.sh = shingles(p.text);
}

const pairs = [];
for (let i = 0; i < pages.length; i++) {
  for (let j = i + 1; j < pages.length; j++) {
    const a = pages[i].sh, b = pages[j].sh;
    let inter = 0;
    for (const s of a) if (b.has(s)) inter++;
    pairs.push({ a: pages[i].slug, b: pages[j].slug, sim: inter / (a.size + b.size - inter) });
  }
}
pairs.sort((x, y) => y.sim - x.sim);

// Phrases identiques
const sentenceMap = new Map();
for (const p of pages) {
  for (const s of p.text.split(/(?<=[.!?])\s+/)) {
    const k = norm(s);
    if (k.split(' ').length < 8) continue;
    if (!sentenceMap.has(k)) sentenceMap.set(k, new Set());
    sentenceMap.get(k).add(p.slug);
  }
}
const dupSentences = [...sentenceMap.entries()].filter(([, v]) => v.size > 1);

// Méta en double
const metaDup = new Map();
for (const p of pages) for (const m of p.meta) metaDup.set(m, [...(metaDup.get(m) || []), p.slug]);

const words = pages.map((p) => p.words);
console.log(`${pages.length} pages · ${Math.min(...words)}–${Math.max(...words)} mots (moyenne ${Math.round(words.reduce((a, b) => a + b, 0) / words.length)})`);
console.log(`Similarité max : ${(pairs[0]?.sim * 100).toFixed(1)} % · moyenne : ${((pairs.reduce((a, p) => a + p.sim, 0) / pairs.length) * 100).toFixed(2)} %`);
console.log('Top 10 paires :');
for (const p of pairs.slice(0, 10)) console.log(`  ${(p.sim * 100).toFixed(1)} %  ${p.a} ↔ ${p.b}`);
const over = pairs.filter((p) => p.sim >= threshold);
console.log(`Paires ≥ ${threshold * 100} % : ${over.length}`);
console.log(`Phrases identiques sur plusieurs pages : ${dupSentences.length}`);
for (const [s, v] of dupSentences.slice(0, 15)) console.log(`  [${[...v].join(', ')}] ${s.slice(0, 110)}`);
const md = [...metaDup.entries()].filter(([, v]) => v.length > 1);
console.log(`Balises meta en double : ${md.length}`);
const short = pages.filter((p) => p.words < 450).map((p) => `${p.slug} (${p.words})`);
if (short.length) console.log(`Pages courtes (< 450 mots) : ${short.join(', ')}`);
process.exit(over.length || dupSentences.length || md.length ? 1 : 0);
