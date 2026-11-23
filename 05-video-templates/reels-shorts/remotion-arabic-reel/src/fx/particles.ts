// جسيمات حتمية: شرر، وميض فوهة، حلقات صدمة، ليزر، رصاص مضيء، انفجارات، آثار احتراق.
// منقولة إلى TypeScript من tools/p5/lib/particles.js في makevoid/claude-make-an-anime (MIT © makevoid).
//
// قاعدة الحتمية (وهي شرط Remotion أيضاً): أي إطار يُرسم منفرداً وبأي ترتيب يجب أن يطابق الرسم الكامل.
// لذلك لا يحتفظ أي مُطلِق بحالة بين الإطارات: كل جسيم يُشتق من id المُطلِق ورقمه (rand(id, k, salt))،
// وموضعه وحجمه ولونه دوال مغلقة لعمره (t - لحظة ولادته). لا تستخدم Math.random() هنا أبداً.
//
// الأزمنة بالثواني (نفس ساعة t الممرّرة لـ draw)، والإحداثيات بكسلات الـ canvas.
// mode "color" يرسم كل شيء، و"light" يرسم الأجزاء المضيئة فقط (للتوهج المنفصل).

export type Vec = [number, number];
export type Color = string | [number, number, number];
export type Mode = "color" | "light";
type Range = number | [number, number];

type Base = { id: string | number; at?: number };
export type SparksEvent = Base & {
  type: "sparks"; x: number; y: number; count?: number; speed?: Range; life?: Range; angle?: number; spread?: number;
  drag?: number; gravity?: number; color?: Color; hot?: Color; width?: number; len?: number; alpha?: number;
};
export type MuzzleEvent = Base & { type: "muzzle"; x: number; y: number; angle?: number; size?: number; color?: Color; dur?: number };
export type RingEvent = Base & {
  type: "ring"; x: number; y: number; radius?: number; dur?: number; color?: Color; weight?: number; squash?: number; alpha?: number;
};
export type LaserEvent = Base & {
  type: "laser"; from: Vec; to: Vec; dur?: number; grow?: number; color?: Color; width?: number; flicker?: number; hit?: boolean; muzzle?: boolean;
};
export type TracersEvent = Base & {
  type: "tracers"; from: Vec; to: Vec; dur?: number; rate?: number; speed?: number; color?: Color; len?: number; spread?: number;
  jitter?: number; muzzle?: boolean; hit?: boolean; width?: number;
};
export type ExplosionEvent = Base & {
  type: "explosion"; x: number; y: number; size?: number; debris?: number; smokeCount?: number; ring?: boolean; dur?: number;
  flash?: Color; fire?: [Color, Color, Color]; smoke?: Color;
};
export type ScorchEvent = Base & { type: "scorch"; x: number; y: number; radius?: number; alpha?: number };
export type ParticleEvent = SparksEvent | MuzzleEvent | RingEvent | LaserEvent | TracersEvent | ExplosionEvent | ScorchEvent;

type Ctx = CanvasRenderingContext2D;
const TAU = Math.PI * 2;

// بصمة ثابتة لـ (id, k, salt) ← [0, 1): FNV-1a على نص id ثم خلط 32-بت.
const hashStr = (s: string | number): number => {
  let h = 2166136261 >>> 0;
  const str = String(s);
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h;
};
export const rand = (id: string | number, k = 0, salt = 0): number => {
  let h = (hashStr(id) ^ Math.imul(k + 1, 0x9e3779b1) ^ Math.imul(salt + 7, 0x85ebca77)) >>> 0;
  h ^= h >>> 16; h = Math.imul(h, 0x7feb352d) >>> 0;
  h ^= h >>> 15; h = Math.imul(h, 0x846ca68b) >>> 0;
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
};
export const range = (id: string | number, k: number, salt: number, lo: number, hi: number) => lo + (hi - lo) * rand(id, k, salt);
const pick = (v: Range, id: string | number, k: number, salt: number) => (Array.isArray(v) ? range(id, k, salt, v[0], v[1]) : v);

// حركة مقذوف مغلقة الشكل مع مقاومة خطية drag (1/ث) وجاذبية g (بكسل/ث²، +y للأسفل): الموضع بعد age ثانية.
export const fly = (x: number, y: number, vx: number, vy: number, age: number, drag: number, g: number): Vec => {
  if (drag <= 1e-6) return [x + vx * age, y + vy * age + 0.5 * g * age * age];
  const e = (1 - Math.exp(-drag * age)) / drag;
  return [x + vx * e, y + vy * e + (g / drag) * (age - e)];
};
const velAt = (vx: number, vy: number, age: number, drag: number, g: number): Vec => {
  const k = Math.exp(-drag * age);
  return [vx * k, vy * k + (drag > 1e-6 ? (g / drag) * (1 - k) : g * age)];
};

const hex = (c: Color): [number, number, number] => {
  if (Array.isArray(c)) return c;
  const v = parseInt(String(c).replace("#", ""), 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
};
export const rgba = (c: Color, a: number) => {
  const [r, g, b] = hex(c);
  return `rgba(${r | 0},${g | 0},${b | 0},${Math.max(0, Math.min(1, a)).toFixed(4)})`;
};
const mix = (a: Color, b: Color, q: number): [number, number, number] => {
  const A = hex(a), B = hex(b);
  return [A[0] + (B[0] - A[0]) * q, A[1] + (B[1] - A[1]) * q, A[2] + (B[2] - A[2]) * q];
};
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

// توهج دائري ناعم، إضافي ("lighter") فيتراكم الضوء كما في الواقع.
export const glow = (g: Ctx, x: number, y: number, r: number, c: Color, a: number, core = 0.18) => {
  if (a <= 0.003 || r <= 0.5) return;
  const grad = g.createRadialGradient(x, y, 0, x, y, r);
  grad.addColorStop(0, rgba(c, a));
  grad.addColorStop(core, rgba(c, a * 0.7));
  grad.addColorStop(1, rgba(c, 0));
  g.fillStyle = grad;
  g.fillRect(x - r, y - r, 2 * r, 2 * r);
};

const withCtx = (g: Ctx, fn: (g: Ctx) => void, op: GlobalCompositeOperation = "source-over") => {
  g.save();
  g.globalCompositeOperation = op;
  try { fn(g); } finally { g.restore(); }
};

const sparks = (g: Ctx, ev: SparksEvent, t: number) => {
  const { id, at = 0, x, y, count = 18, speed = [180, 620], life = [0.18, 0.5], angle = 0, spread = TAU, drag = 3, gravity = 500,
    color = "#ffd27a", hot = "#ffffff", width = 2.2, len = 0.035, alpha = 1 } = ev;
  const age0 = t - at;
  if (age0 < 0 || age0 > (Array.isArray(life) ? life[1] : life) + 0.05) return;
  withCtx(g, (g) => {
    g.lineCap = "round";
    for (let k = 0; k < count; k++) {
      const L = pick(life, id, k, 1), age = age0 - range(id, k, 2, 0, 0.04);
      if (age < 0 || age > L) continue;
      const a = angle + (rand(id, k, 3) - 0.5) * spread, v = pick(speed, id, k, 4);
      const vx = Math.cos(a) * v, vy = Math.sin(a) * v;
      const [x1, y1] = fly(x, y, vx, vy, age, drag, gravity);
      const [x0, y0] = fly(x, y, vx, vy, Math.max(0, age - len), drag, gravity);
      const q = age / L, heat = 1 - q;
      g.strokeStyle = rgba(mix(color, hot, heat * heat), alpha * (1 - q * q));
      g.lineWidth = width * (0.6 + 0.8 * heat);
      g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
    }
  }, "lighter");
};

const muzzle = (g: Ctx, ev: MuzzleEvent, t: number) => {
  const { id, at = 0, x, y, angle = 0, size = 1, color = "#ffe7a0", dur = 0.08 } = ev;
  const age = t - at;
  if (age < 0 || age > dur) return;
  const q = 1 - age / dur, s = size * (0.7 + 0.5 * rand(id, Math.floor(age * 60), 9));
  withCtx(g, (g) => {
    glow(g, x, y, 26 * s, color, 0.9 * q);
    g.translate(x, y); g.rotate(angle);
    g.fillStyle = rgba("#ffffff", q);
    g.beginPath(); g.moveTo(0, -3 * s); g.lineTo(30 * s * q + 8, 0); g.lineTo(0, 3 * s); g.closePath(); g.fill();
    g.fillStyle = rgba(color, 0.8 * q);
    g.beginPath(); g.moveTo(-2, -7 * s); g.lineTo(14 * s, 0); g.lineTo(-2, 7 * s); g.closePath(); g.fill();
  }, "lighter");
};

const ring = (g: Ctx, ev: RingEvent, t: number) => {
  const { x, y, at = 0, radius = 60, dur = 0.35, color = "#bfe8ff", weight = 5, squash = 0.55, alpha = 0.9 } = ev;
  const age = t - at;
  if (age < 0 || age > dur) return;
  const q = age / dur, r = radius * (1 - Math.pow(1 - q, 3));
  withCtx(g, (g) => {
    g.strokeStyle = rgba(color, alpha * (1 - q));
    g.lineWidth = weight * (1 - q * 0.7);
    g.beginPath(); g.ellipse(x, y, r, r * squash, 0, 0, TAU); g.stroke();
  }, "lighter");
};

const laser = (g: Ctx, ev: LaserEvent, t: number, mode: Mode) => {
  const { id, at = 0, from, to, dur = 0.16, grow = 0.035, color = "#5fd0ff", width = 5, flicker = 0.25, hit = true, muzzle: mz = true } = ev;
  const age = t - at;
  if (age < 0) return;
  const [x0, y0] = from, [x1, y1] = to;
  if (hit && age < dur + 0.4) {
    sparks(g, { type: "sparks", id: `${id}:hit`, at: at + grow, x: x1, y: y1, count: 10, speed: [120, 420], life: [0.1, 0.3],
      color, hot: "#ffffff", width: 1.8, gravity: 300 }, t);
  }
  if (age > dur) return;
  const head = clamp01(age / grow), tail = clamp01((age - dur + grow) / grow);
  const hx = x0 + (x1 - x0) * head, hy = y0 + (y1 - y0) * head;
  const tx = x0 + (x1 - x0) * tail, ty = y0 + (y1 - y0) * tail;
  const fl = 1 - flicker * rand(id, Math.floor(age * 48), 5);
  withCtx(g, (g) => {
    g.lineCap = "round";
    g.strokeStyle = rgba(color, 0.35 * fl); g.lineWidth = width * 3.2;
    g.beginPath(); g.moveTo(tx, ty); g.lineTo(hx, hy); g.stroke();
    g.strokeStyle = rgba(color, 0.9 * fl); g.lineWidth = width;
    g.beginPath(); g.moveTo(tx, ty); g.lineTo(hx, hy); g.stroke();
    g.strokeStyle = rgba("#ffffff", 0.95 * fl); g.lineWidth = Math.max(1, width * 0.35);
    g.beginPath(); g.moveTo(tx, ty); g.lineTo(hx, hy); g.stroke();
    if (head >= 1) glow(g, x1, y1, width * 7, color, 0.8 * fl);
  }, "lighter");
  if (mz) muzzle(g, { type: "muzzle", id: `${id}:mz`, at, x: x0, y: y0, angle: Math.atan2(y1 - y0, x1 - x0), size: width / 5, color }, t);
  void mode;
};

const tracers = (g: Ctx, ev: TracersEvent, t: number) => {
  const { id, at = 0, dur = 1, rate = 12, from, to, speed = 2200, color = "#ffd36b", len = 34, spread = 14, jitter = 0.3,
    muzzle: mz = true, hit = true, width = 2.4 } = ev;
  if (t < at) return;
  const n = Math.ceil(dur * rate);
  for (let k = 0; k < n; k++) {
    const fire = at + (k + (rand(id, k, 1) - 0.5) * jitter) / rate;
    const age = t - fire;
    if (age < 0) continue;
    const tx = to[0] + (rand(id, k, 2) - 0.5) * spread * 2, ty = to[1] + (rand(id, k, 3) - 0.5) * spread;
    const dist = Math.hypot(tx - from[0], ty - from[1]), flight = dist / speed;
    if (mz) muzzle(g, { type: "muzzle", id: `${id}:m${k}`, at: fire, x: from[0], y: from[1], angle: Math.atan2(ty - from[1], tx - from[0]), size: 0.55, color, dur: 0.05 }, t);
    if (age <= flight) {
      const q = age / flight, ux = (tx - from[0]) / dist, uy = (ty - from[1]) / dist;
      const hx = from[0] + (tx - from[0]) * q, hy = from[1] + (ty - from[1]) * q;
      withCtx(g, (g) => {
        g.lineCap = "round";
        g.strokeStyle = rgba(color, 0.9); g.lineWidth = width;
        g.beginPath(); g.moveTo(hx - ux * len, hy - uy * len); g.lineTo(hx, hy); g.stroke();
        g.fillStyle = rgba("#ffffff", 1); g.beginPath(); g.arc(hx, hy, width * 0.7, 0, TAU); g.fill();
      }, "lighter");
    } else if (hit && age < flight + 0.2) {
      sparks(g, { type: "sparks", id: `${id}:h${k}`, at: fire + flight, x: tx, y: ty, count: 4, speed: [80, 260], life: [0.06, 0.16], color, width: 1.4, gravity: 200 }, t);
    }
  }
};

const explosion = (g: Ctx, ev: ExplosionEvent, t: number, mode: Mode) => {
  const { id, at = 0, x, y, size = 1, debris = 22, smokeCount = 9, ring: withRing = true, dur = 1.6,
    flash = "#fff6d8", fire = ["#ffe08a", "#ff8a2a", "#c0381c"], smoke = "#2c2a2a" } = ev;
  const age = t - at;
  if (age < 0 || age > dur) return;
  const s = size;
  // الدخان: نفثات رمادية تصعد وتكبر وتخف. داكنة، فلا تدخل طبقة الضوء.
  if (mode !== "light") {
    withCtx(g, (g) => {
      for (let k = 0; k < smokeCount; k++) {
        const born = 0.08 + rand(id, k, 11) * 0.25, a = age - born;
        if (a < 0) continue;
        const L = dur - born, q = clamp01(a / L);
        const ang = rand(id, k, 12) * TAU, d = (20 + 40 * rand(id, k, 13)) * s * (1 - Math.exp(-3 * a));
        const px = x + Math.cos(ang) * d + 18 * s * a, py = y + Math.sin(ang) * d * 0.55 - 55 * s * a;
        const r = (22 + 30 * rand(id, k, 14)) * s * (0.5 + 0.9 * Math.sqrt(q));
        const grad = g.createRadialGradient(px, py, 0, px, py, r);
        const al = 0.55 * Math.sin(Math.PI * Math.min(1, q * 1.15)) * (0.6 + 0.4 * rand(id, k, 15));
        grad.addColorStop(0, rgba(smoke, al)); grad.addColorStop(0.6, rgba(smoke, al * 0.6)); grad.addColorStop(1, rgba(smoke, 0));
        g.fillStyle = grad; g.fillRect(px - r, py - r, 2 * r, 2 * r);
      }
    });
  }
  // الوميض ثم كرة النار التي تبرد من الأصفر إلى الأحمر.
  withCtx(g, (g) => {
    const fq = clamp01(1 - age / 0.12);
    glow(g, x, y, 170 * s, flash, 0.85 * fq * fq, 0.1);
    const fb = clamp01(age / 0.55);
    for (let k = 0; k < 7; k++) {
      const ang = rand(id, k, 21) * TAU, d = 28 * s * rand(id, k, 22) * Math.sqrt(fb);
      const px = x + Math.cos(ang) * d, py = y + Math.sin(ang) * d * 0.6 - 10 * s * fb;
      const r = (34 + 26 * rand(id, k, 23)) * s * (0.35 + 0.9 * Math.sqrt(fb));
      const heat = 1 - fb;
      const c = heat > 0.5 ? mix(fire[1], fire[0], (heat - 0.5) * 2) : mix(fire[2], fire[1], heat * 2);
      glow(g, px, py, r, c, 0.9 * heat * (mode === "light" ? 0.9 : 1), 0.3);
    }
  }, "lighter");
  if (withRing) ring(g, { type: "ring", id: `${id}:ring`, x, y: y + 6 * s, at, radius: 120 * s, dur: 0.32, color: "#ffe2b0", weight: 6 * s, alpha: 0.75 }, t);
  // الشظايا: ساخنة تتوهج ثم قطع داكنة (في وضع الألوان فقط).
  for (let k = 0; k < debris; k++) {
    const L = range(id, k, 31, 0.35, 0.9), a = age - range(id, k, 32, 0, 0.03);
    if (a < 0 || a > L) continue;
    const ang = -Math.PI / 2 + (rand(id, k, 33) - 0.5) * Math.PI * 1.7, v = range(id, k, 34, 160, 520) * s;
    const vx = Math.cos(ang) * v, vy = Math.sin(ang) * v * 0.8;
    const [px, py] = fly(x, y, vx, vy, a, 1.6, 900 * s);
    const q = a / L, hot = clamp01(1 - q * 2.2);
    if (hot > 0) {
      const [ux, uy] = velAt(vx, vy, a, 1.6, 900 * s), sp = Math.hypot(ux, uy) || 1;
      withCtx(g, (g) => {
        g.strokeStyle = rgba(mix(fire[1], "#ffffff", hot * 0.6), hot); g.lineWidth = 2.2 * s; g.lineCap = "round";
        g.beginPath(); g.moveTo(px - (ux / sp) * 9 * s, py - (uy / sp) * 9 * s); g.lineTo(px, py); g.stroke();
      }, "lighter");
    } else if (mode !== "light") {
      withCtx(g, (g) => { g.fillStyle = rgba("#1b1714", 1 - q); g.fillRect(px - 2 * s, py - 2 * s, 4 * s, 3 * s); });
    }
  }
};

const scorch = (g: Ctx, ev: ScorchEvent, t: number, mode: Mode) => {
  const { x, y, at = 0, radius = 46, alpha = 0.6 } = ev;
  if (t < at || mode === "light") return;
  const a = alpha * clamp01((t - at) / 0.2);
  withCtx(g, (g) => {
    g.translate(x, y); g.scale(1, 0.55);
    const grad = g.createRadialGradient(0, 0, 0, 0, 0, radius);
    grad.addColorStop(0, `rgba(10,8,6,${a})`); grad.addColorStop(0.7, `rgba(20,14,10,${a * 0.5})`); grad.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = grad; g.fillRect(-radius, -radius, 2 * radius, 2 * radius);
  });
};

/** يرسم كل الأحداث عند الزمن t: آثار الاحتراق أولاً (على الأرض)، ثم الباقي بترتيب القائمة. */
export const drawParticles = (g: Ctx, events: ParticleEvent[], t: number, mode: Mode = "color") => {
  for (const ev of events) if (ev.type === "scorch") scorch(g, ev, t, mode);
  for (const ev of events) {
    switch (ev.type) {
      case "scorch": break;
      case "sparks": sparks(g, ev, t); break;
      case "muzzle": muzzle(g, ev, t); break;
      case "ring": ring(g, ev, t); break;
      case "laser": laser(g, ev, t, mode); break;
      case "tracers": tracers(g, ev, t); break;
      case "explosion": explosion(g, ev, t, mode); break;
    }
  }
};

/** شدة الضوء عند t (0..1+): لاشتقاق وميض الشاشة أو الاهتزاز أو المؤثر الصوتي من نفس قائمة الأحداث. */
export const intensity = (events: ParticleEvent[], t: number) =>
  events.reduce((sum, ev) => {
    const age = t - (ev.at ?? 0);
    if (ev.type === "explosion" && age >= 0) return sum + (ev.size ?? 1) * Math.exp(-age / 0.12);
    return sum;
  }, 0);
