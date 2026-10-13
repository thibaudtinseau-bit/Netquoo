// Carte SVG de la zone d'intervention (composant serveur, sans dépendance).
// Projection équirectangulaire centrée sur Montarnaud : x = Δlon · cos(lat₀), y = Δlat (en km).
// Les libellés sont placés automatiquement (algorithme glouton anti-chevauchement).

import { site } from '@/config/site';
import { aCommune, communePath, communes, getCommune, type Commune } from '@/data/communes';

const PX_PER_KM = 10;
const RADIUS_KM = site.radiusKm;
const R = RADIUS_KM * PX_PER_KM;
const KM_PER_DEG_LAT = 110.574;
const KM_PER_DEG_LON = 111.32 * Math.cos((site.geo.lat * Math.PI) / 180);
const RINGS_KM = [5, 10, 15, 20].filter((k) => k <= RADIUS_KM);

const COLORS = {
  ink: '#0A1633',
  slate: '#334155',
  muted: '#64748B',
  brand100: '#DCE8FF',
  brand200: '#B9D1FF',
  brand300: '#8AB2FF',
  brand500: '#3366FF',
  brand600: '#1F4FEA',
  brand700: '#183EC2',
  brand900: '#162E79',
  aqua: '#38BDF8',
};

type Anchor = 'start' | 'middle' | 'end';
interface Box {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}
interface Point {
  c: Commune;
  x: number;
  y: number;
  r: number;
}
interface PlacedLabel {
  key: string;
  text: string;
  x: number;
  y: number;
  anchor: Anchor;
  fontSize: number;
  weight: number;
  fill: string;
}

function project(c: Pick<Commune, 'lat' | 'lon'>): { x: number; y: number } {
  return {
    x: (c.lon - site.geo.lon) * KM_PER_DEG_LON * PX_PER_KM,
    y: -(c.lat - site.geo.lat) * KM_PER_DEG_LAT * PX_PER_KM,
  };
}

function dotRadius(population: number): number {
  return 2.4 + 1.5 * Math.log10(Math.max(population, 100) / 100);
}

function fmtKm(n: number): string {
  return `${n.toFixed(1).replace(/\.0$/, '').replace('.', ',')} km`;
}

/** Largeur approximative d'un texte (Plus Jakarta Sans, graisse 600). */
function textWidth(s: string, fontSize: number): number {
  let w = 0;
  for (const ch of s) {
    if ("il'’.,;:!|".includes(ch)) w += 0.28;
    else if ('fjrt- '.includes(ch)) w += 0.38;
    else if ('mwMW'.includes(ch)) w += 0.9;
    else if (/[A-ZÀ-Ý]/.test(ch)) w += 0.7;
    else w += 0.58;
  }
  return w * fontSize;
}

const overlaps = (a: Box, b: Box) => a.x1 < b.x2 && a.x2 > b.x1 && a.y1 < b.y2 && a.y2 > b.y1;
const overlapArea = (a: Box, b: Box) =>
  overlaps(a, b) ? (Math.min(a.x2, b.x2) - Math.max(a.x1, b.x1)) * (Math.min(a.y2, b.y2) - Math.max(a.y1, b.y1)) : 0;
const inside = (a: Box, b: Box) => a.x1 >= b.x1 && a.x2 <= b.x2 && a.y1 >= b.y1 && a.y2 <= b.y2;
const pointBox = (p: { x: number; y: number; r: number }, pad = 1.5): Box => ({
  x1: p.x - p.r - pad,
  y1: p.y - p.r - pad,
  x2: p.x + p.r + pad,
  y2: p.y + p.r + pad,
});

function labelBox(x: number, y: number, anchor: Anchor, w: number, fontSize: number): Box {
  const x1 = anchor === 'start' ? x : anchor === 'end' ? x - w : x - w / 2;
  return { x1: x1 - 2, y1: y - fontSize * 0.74 - 1.5, x2: x1 + w + 2, y2: y + fontSize * 0.24 + 1.5 };
}

interface LabelRequest {
  key: string;
  text: string;
  /** Point auquel le libellé est rattaché */
  at: { x: number; y: number; r: number };
  fontSize: number;
  weight?: number;
  fill?: string;
  /** Toujours affiché (meilleure position possible même en cas de chevauchement) */
  force?: boolean;
  /** Ordre de préférence des positions */
  prefer?: ('right' | 'left' | 'above' | 'below')[];
}

/** Place les libellés sans chevauchement (points, libellés déjà placés, zones réservées). */
function placeLabels(requests: LabelRequest[], obstacles: Box[], bounds: Box): { placed: PlacedLabel[]; boxes: Box[] } {
  const taken = [...obstacles];
  const placed: PlacedLabel[] = [];
  for (const req of requests) {
    const { at, fontSize, text } = req;
    const w = textWidth(text, fontSize);
    const gap = at.r + 3.5;
    const asc = fontSize * 0.36;
    const d = gap * 0.72;
    const positions: Record<string, { x: number; y: number; anchor: Anchor }> = {
      right: { x: at.x + gap, y: at.y + asc, anchor: 'start' },
      left: { x: at.x - gap, y: at.y + asc, anchor: 'end' },
      above: { x: at.x, y: at.y - gap - fontSize * 0.2, anchor: 'middle' },
      below: { x: at.x, y: at.y + gap + fontSize * 0.78, anchor: 'middle' },
      upRight: { x: at.x + d, y: at.y - d, anchor: 'start' },
      downRight: { x: at.x + d, y: at.y + d + fontSize * 0.7, anchor: 'start' },
      upLeft: { x: at.x - d, y: at.y - d, anchor: 'end' },
      downLeft: { x: at.x - d, y: at.y + d + fontSize * 0.7, anchor: 'end' },
    };
    const order = [
      ...(req.prefer ?? []),
      ...['right', 'left', 'above', 'below', 'upRight', 'downRight', 'upLeft', 'downLeft'].filter(
        (k) => !(req.prefer ?? []).includes(k as never),
      ),
    ];
    const own = pointBox(at, 0.5);
    let best: { pos: { x: number; y: number; anchor: Anchor }; box: Box; cost: number } | null = null;
    for (const k of order) {
      const pos = positions[k];
      const box = labelBox(pos.x, pos.y, pos.anchor, w, fontSize);
      if (!inside(box, bounds)) continue;
      const cost = taken.reduce((sum, o) => (o === own ? sum : sum + overlapArea(box, o)), 0);
      if (cost === 0) {
        best = { pos, box, cost };
        break;
      }
      if (req.force && (!best || cost < best.cost)) best = { pos, box, cost };
    }
    if (!best || (best.cost > 0 && !req.force)) continue;
    taken.push(best.box);
    placed.push({
      key: req.key,
      text,
      x: best.pos.x,
      y: best.pos.y,
      anchor: best.pos.anchor,
      fontSize,
      weight: req.weight ?? 600,
      fill: req.fill ?? COLORS.slate,
    });
  }
  return { placed, boxes: taken };
}

/** Choisit un angle libre pour les étiquettes « 5 km / 10 km… » des anneaux. */
function ringLabelPositions(points: Point[], fontSize: number): { km: number; x: number; y: number }[] {
  const boxes = points.map((p) => pointBox(p, 3));
  const angles = [315, 300, 330, 285, 345, 225, 240, 210, 135, 150, 120, 45, 60, 30];
  const at = (km: number, deg: number) => {
    const a = (deg * Math.PI) / 180;
    return { km, x: Math.sin(a) * km * PX_PER_KM, y: -Math.cos(a) * km * PX_PER_KM };
  };
  const fits = (p: { km: number; x: number; y: number }) => {
    const w = textWidth(`${p.km} km`, fontSize) + 10;
    const box = { x1: p.x - w / 2, y1: p.y - fontSize * 0.8, x2: p.x + w / 2, y2: p.y + fontSize * 0.8 };
    return !boxes.some((b) => overlaps(box, b));
  };
  let bestAngle = angles[0];
  let bestScore = -1;
  for (const deg of angles) {
    const score = RINGS_KM.filter((km) => fits(at(km, deg))).length;
    if (score > bestScore) {
      bestScore = score;
      bestAngle = deg;
    }
    if (score === RINGS_KM.length) break;
  }
  return RINGS_KM.map((km) => at(km, bestAngle));
}

const allPoints: Point[] = communes
  .filter((c) => c.slug !== 'montarnaud')
  .map((c) => ({ c, ...project(c), r: dotRadius(c.population) }));

const base = getCommune('montarnaud');

/* -------------------------------------------------------------------------- */

function Disc({ id, rings = true }: { id: string; rings?: boolean }) {
  return (
    <>
      <defs>
        <radialGradient id={`${id}-disc`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#E3ECFF" />
          <stop offset="55%" stopColor="#F2F7FF" />
          <stop offset="100%" stopColor="#FFFFFF" />
        </radialGradient>
        <radialGradient id={`${id}-core`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={COLORS.brand500} stopOpacity="0.22" />
          <stop offset="100%" stopColor={COLORS.brand500} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle r={R} fill={`url(#${id}-disc)`} stroke={COLORS.brand200} strokeWidth="1.5" />
      <circle r={R * 0.32} fill={`url(#${id}-core)`} />
      <line x1={-R} x2={R} y1="0" y2="0" stroke={COLORS.brand100} strokeWidth="1" />
      <line y1={-R} y2={R} x1="0" x2="0" stroke={COLORS.brand100} strokeWidth="1" />
      {rings &&
        RINGS_KM.filter((km) => km < RADIUS_KM).map((km) => (
          <circle
            key={km}
            r={km * PX_PER_KM}
            fill="none"
            stroke={COLORS.brand200}
            strokeWidth="1"
            strokeDasharray="2 5"
            strokeLinecap="round"
          />
        ))}
    </>
  );
}

function BaseMarker({ size = 1, href }: { size?: number; href?: string }) {
  const marker = (
    <g>
      <circle
        r={13 * size}
        fill={COLORS.brand500}
        opacity="0.25"
        className="motion-safe:animate-ping"
        style={{ transformBox: 'fill-box', transformOrigin: 'center', animationDuration: '2.4s' }}
      />
      <circle r={9 * size} fill={COLORS.brand900} stroke="#fff" strokeWidth={2.5 * size} />
      <circle r={3 * size} fill="#fff" />
    </g>
  );
  if (!href) return marker;
  return (
    <a href={href} aria-label="Montarnaud — notre base">
      <title>Montarnaud (34570) — notre base</title>
      {marker}
    </a>
  );
}

function Labels({ labels, className }: { labels: PlacedLabel[]; className?: string }) {
  return (
    <g className={className} pointerEvents="none" aria-hidden="true">
      {labels.map((l) => (
        <text
          key={l.key}
          x={l.x}
          y={l.y}
          textAnchor={l.anchor}
          fontSize={l.fontSize}
          fontWeight={l.weight}
          fill={l.fill}
          stroke="#fff"
          strokeWidth={l.fontSize * 0.28}
          strokeLinejoin="round"
          style={{ paintOrder: 'stroke' }}
        >
          {l.text}
        </text>
      ))}
    </g>
  );
}

/* -------------------------------------------------------------------------- */
/*                        Carte complète (page zones)                          */
/* -------------------------------------------------------------------------- */

function labelCandidates(maxTop: number, perDirection: number): Point[] {
  const byPop = [...allPoints].sort((p1, p2) => p2.c.population - p1.c.population);
  const chosen = new Set(byPop.slice(0, maxTop));
  const dirs = new Map<string, number>();
  for (const p of byPop) {
    const d = p.c.direction ?? '';
    const n = dirs.get(d) ?? 0;
    if (n < perDirection) {
      chosen.add(p);
      dirs.set(d, n + 1);
    }
  }
  return byPop.filter((p) => chosen.has(p));
}

function fullLabels(fontSize: number, maxTop: number, perDirection: number, bounds: Box) {
  const reserved: Box[] = allPoints.map((p) => pointBox(p));
  // Montarnaud au centre, libellé en dessous
  const center = placeLabels(
    [{ key: 'montarnaud', text: 'Montarnaud', at: { x: 0, y: 0, r: 10 }, fontSize: fontSize + 1, weight: 800, fill: COLORS.ink, force: true, prefer: ['below'] }],
    reserved,
    bounds,
  );
  const ringFont = fontSize * 0.82;
  const ringLabels = ringLabelPositions(allPoints, ringFont);
  const ringBoxes = ringLabels.map((p) => {
    const w = textWidth(`${p.km} km`, ringFont) + 10;
    return { x1: p.x - w / 2, y1: p.y - ringFont * 0.8, x2: p.x + w / 2, y2: p.y + ringFont * 0.8 };
  });
  const cardinal = cardinalPositions(fontSize);
  const cardinalBoxes = cardinal.map((c) => ({ x1: c.x - fontSize * 0.6, y1: c.y - fontSize, x2: c.x + fontSize * 0.6, y2: c.y + fontSize * 0.3 }));
  const requests: LabelRequest[] = labelCandidates(maxTop, perDirection).map((p) => ({
    key: p.c.slug,
    text: p.c.name,
    at: p,
    fontSize,
    weight: p.c.population >= 10000 ? 700 : 600,
    fill: p.c.population >= 10000 ? COLORS.ink : COLORS.slate,
  }));
  const rest = placeLabels(requests, [...center.boxes, ...ringBoxes, ...cardinalBoxes], bounds);
  return { labels: [...center.placed, ...rest.placed], ringLabels, ringFont, cardinal };
}

function cardinalPositions(fontSize: number) {
  const off = R + fontSize * 0.9;
  return [
    { t: 'N', x: 0, y: -off + fontSize * 0.3 },
    { t: 'S', x: 0, y: off + fontSize * 0.3 },
    { t: 'E', x: off, y: fontSize * 0.35 },
    { t: 'O', x: -off, y: fontSize * 0.35 },
  ];
}

function FullMap({ className = '' }: { className?: string }) {
  const vb = { x: -262, y: -228, w: 524, h: 456 };
  const bounds: Box = { x1: vb.x + 2, y1: vb.y + 2, x2: vb.x + vb.w - 2, y2: vb.y + vb.h - 2 };
  const desktop = fullLabels(11, 20, 2, bounds);
  const mobile = fullLabels(17, 7, 1, bounds);
  return (
    <svg
      viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
      className={`h-auto w-full select-none ${className}`}
      aria-labelledby="area-map-title area-map-desc"
      role="group"
    >
      <title id="area-map-title">{`Carte des ${communes.length} communes desservies autour de Montarnaud`}</title>
      <desc id="area-map-desc">
        {`Montarnaud au centre ; cercles à 5, 10, 15 et ${RADIUS_KM} km ; chaque point est une commune desservie, sa taille dépend de la population. Survolez ou sélectionnez un point pour accéder à la page de la commune.`}
      </desc>
      <Disc id="am-full" />

      {/* Repères cardinaux */}
      <g aria-hidden="true" fontWeight={700} fill={COLORS.brand300}>
        {desktop.cardinal.map((c) => (
          <text key={c.t} x={c.x} y={c.y} textAnchor="middle" fontSize={11} className="hidden sm:inline">
            {c.t}
          </text>
        ))}
        {mobile.cardinal.map((c) => (
          <text key={c.t} x={c.x} y={c.y} textAnchor="middle" fontSize={16} className="sm:hidden">
            {c.t}
          </text>
        ))}
      </g>

      {/* Étiquettes des anneaux */}
      {[
        { set: desktop, cls: 'hidden sm:inline' },
        { set: mobile, cls: 'sm:hidden' },
      ].map(({ set, cls }) => (
        <g key={cls} className={cls} aria-hidden="true">
          {set.ringLabels.map((p) => {
            const label = `${p.km} km`;
            const w = textWidth(label, set.ringFont) + 10;
            return (
              <g key={p.km}>
                <rect
                  x={p.x - w / 2}
                  y={p.y - set.ringFont * 0.78}
                  width={w}
                  height={set.ringFont * 1.56}
                  rx={set.ringFont * 0.78}
                  fill="#fff"
                  stroke={COLORS.brand200}
                />
                <text
                  x={p.x}
                  y={p.y + set.ringFont * 0.34}
                  textAnchor="middle"
                  fontSize={set.ringFont}
                  fontWeight={600}
                  fill={COLORS.brand700}
                >
                  {label}
                </text>
              </g>
            );
          })}
        </g>
      ))}

      {/* Communes */}
      <g>
        {allPoints.map((p) => (
          <a
            key={p.c.slug}
            href={communePath(p.c)}
            className="group outline-none"
            aria-label={`Nettoyage d'entreprise ${aCommune(p.c.name)} — ${fmtKm(p.c.distanceKm)} de Montarnaud`}
          >
            <title>{`${p.c.name} (${p.c.postalCodes[0]}) · ${fmtKm(p.c.distanceKm)} de Montarnaud`}</title>
            <circle
              cx={p.x}
              cy={p.y}
              r={p.r + 7}
              fill={COLORS.brand500}
              opacity={0}
              className="opacity-0 transition-opacity duration-200 group-hover:opacity-20 group-focus-visible:opacity-30"
            />
            <circle
              cx={p.x}
              cy={p.y}
              r={p.r}
              fill={COLORS.brand600}
              stroke="#fff"
              strokeWidth="1.5"
              className="transition-colors duration-200 group-hover:fill-brand-800 group-focus-visible:fill-brand-800"
            />
          </a>
        ))}
      </g>

      <Labels labels={desktop.labels} className="hidden sm:inline" />
      <Labels labels={mobile.labels} className="sm:hidden" />

      {base && <BaseMarker href={communePath(base)} />}
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/*                Mini-carte de situation (pages communes)                     */
/* -------------------------------------------------------------------------- */

function FocusMap({ slug, className = '' }: { slug: string; className?: string }) {
  const focus = getCommune(slug);
  if (!focus) return null;
  const isBase = focus.slug === 'montarnaud';
  const vb = { x: -218, y: -218, w: 436, h: 436 };
  const bounds: Box = { x1: vb.x + 2, y1: vb.y + 2, x2: vb.x + vb.w - 2, y2: vb.y + vb.h - 2 };
  const neighborSlugs = new Set(focus.neighbors);
  const neighbors = allPoints.filter((p) => neighborSlugs.has(p.c.slug));
  const others = allPoints.filter((p) => !neighborSlugs.has(p.c.slug) && p.c.slug !== focus.slug);
  const f = isBase ? { x: 0, y: 0 } : project(focus);
  const focusR = 7.5;

  const obstacles: Box[] = [
    ...neighbors.map((p) => pointBox({ ...p, r: 5 })),
    pointBox({ x: 0, y: 0, r: 10 }),
    ...(isBase ? [] : [pointBox({ ...f, r: focusR + 4 })]),
  ];
  const requests: LabelRequest[] = [];
  if (!isBase) {
    requests.push({ key: 'focus', text: focus.name, at: { ...f, r: focusR + 2 }, fontSize: 16, weight: 800, fill: COLORS.ink, force: true });
  }
  requests.push({
    key: 'montarnaud',
    text: 'Montarnaud',
    at: { x: 0, y: 0, r: 10 },
    fontSize: isBase ? 16 : 13.5,
    weight: isBase ? 800 : 700,
    fill: isBase ? COLORS.ink : COLORS.brand900,
    force: true,
    prefer: ['below', 'above'],
  });
  for (const p of neighbors) {
    if (p.c.slug === 'montarnaud') continue;
    requests.push({ key: p.c.slug, text: p.c.name, at: { ...p, r: 5 }, fontSize: 12.5, weight: 600, fill: COLORS.slate });
  }
  const { placed } = placeLabels(requests, obstacles, bounds);

  return (
    <svg
      viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
      className={`h-auto w-full select-none ${className}`}
      role="group"
      aria-labelledby={`focus-map-title-${focus.slug}`}
    >
      <title id={`focus-map-title-${focus.slug}`}>
        {isBase
          ? `Montarnaud, base de Netquoo, et les communes voisines dans un rayon de ${RADIUS_KM} km`
          : `Situation de ${focus.name} par rapport à Montarnaud (${fmtKm(focus.distanceKm)} à vol d'oiseau)`}
      </title>
      <Disc id={`am-focus-${focus.slug}`} />
      <text x={0} y={-R + 16} textAnchor="middle" fontSize={11.5} fontWeight={600} fill={COLORS.brand700} aria-hidden="true">
        Rayon de {RADIUS_KM} km
      </text>

      {/* Autres communes (repères discrets) */}
      <g aria-hidden="true">
        {others.map((p) => (
          <circle key={p.c.slug} cx={p.x} cy={p.y} r={2.4} fill={COLORS.brand300} opacity="0.65" />
        ))}
      </g>

      {/* Trajet indicatif */}
      {!isBase && (
        <line
          x1={0}
          y1={0}
          x2={f.x}
          y2={f.y}
          stroke={COLORS.brand600}
          strokeWidth="2"
          strokeDasharray="5 5"
          strokeLinecap="round"
          aria-hidden="true"
        />
      )}

      {/* Communes voisines */}
      {neighbors
        .filter((p) => p.c.slug !== focus.slug)
        .map((p) => (
          <a key={p.c.slug} href={communePath(p.c)} className="group outline-none" aria-label={`${p.c.name} — commune voisine`}>
            <title>{`${p.c.name} (${p.c.postalCodes[0]}) · ${fmtKm(p.c.distanceKm)} de Montarnaud`}</title>
            <circle cx={p.x} cy={p.y} r={11} fill={COLORS.aqua} opacity={0} className="opacity-0 transition-opacity group-hover:opacity-25 group-focus-visible:opacity-40" />
            <circle cx={p.x} cy={p.y} r={5} fill={COLORS.aqua} stroke="#fff" strokeWidth="1.8" />
          </a>
        ))}

      {/* Commune mise en avant */}
      {!isBase && (
        <g aria-hidden="true">
          <circle cx={f.x} cy={f.y} r={focusR + 7} fill={COLORS.brand500} opacity="0.18" />
          <circle cx={f.x} cy={f.y} r={focusR} fill={COLORS.brand600} stroke="#fff" strokeWidth="2.5" />
        </g>
      )}

      <BaseMarker size={isBase ? 1.15 : 0.85} />
      <Labels labels={placed} />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */

type AreaMapProps = { variant: 'full'; className?: string } | { variant: 'focus'; slug: string; className?: string };

export function AreaMap(props: AreaMapProps) {
  if (props.variant === 'focus') return <FocusMap slug={props.slug} className={props.className} />;
  return <FullMap className={props.className} />;
}
