// مؤثرات كاميرا وصورة مقادة بإشارات زمنية (cues) بالإطارات.
// أُعيدت كتابتها لـ Remotion (CSS/SVG بدل Core Image) من tools/vfx/Sources/mvfx في makevoid/claude-make-an-anime (MIT © makevoid).
//
//   fx      الشكل  الإعدادات (الافتراضي)
//   punch   hit    amt 0.06 (نسبة الزوم)، blur 2 (بكسل)، x/y نقطة الارتكاز 0..1 — ضربة على الإيقاع أو الاصطدام
//   zoom    ramp   amt 0.08 زوم يتصاعد حتى f+dur ثم يعود فجأة — أنهِه على قطع
//   shake   hit    amt 14 (بكسل) اهتزاز يخمد
//   whip    -      انزلاق سريع حول قطع عند f: pre إطارات للخروج و dur للدخول، amt 0.12 (من العرض)، angle 0 (درجات)
//   flash   hit    amt 1، color #fffaf0 — وميض أبيض (أو أي لون)
//   dark    hit    amt 0.94، hold 2 — إظلام خاطف (smash to black)
//   grain   span   amt 0.25، fade 6 — حبيبات فيلم
//   rgb     hit    amt 0.006 انفصال ألوان خفيف (لا تتجاوز 0.05 أبداً: 6 بدل 0.006 أفسد الصورة)
//
// الأشكال: hit = كامل عند f ثم يخمد خلال dur؛ span = يظهر خلال fade ويثبت ويختفي قبل f+dur؛ pre = تمهيد قبل f.
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { rand } from "./particles";

export type FxCue = {
  fx: "punch" | "zoom" | "shake" | "whip" | "flash" | "dark" | "grain" | "rgb";
  f: number;
  dur: number;
  pre?: number;
  shape?: "hit" | "span";
  fade?: number;
  amt?: number;
  blur?: number;
  x?: number;
  y?: number;
  angle?: number;
  color?: string;
  hold?: number;
};

const active = (c: FxCue, frame: number) => frame >= c.f - (c.pre ?? 0) && frame < c.f + c.dur;

/** قوة الإشارة 0..1 عند الإطار (مطابقة لـ Cue.env في الأصل). */
export const env = (c: FxCue, frame: number, defaultShape: "hit" | "span" = "hit", curve = 2.2): number => {
  if (!active(c, frame)) return 0;
  const pre = c.pre ?? 0;
  if (frame < c.f) {
    const q = (frame - (c.f - pre) + 1) / (pre + 1);
    return q * q;
  }
  const t = frame - c.f;
  if ((c.shape ?? defaultShape) === "span") {
    const fd = Math.max(c.fade ?? 4, 1);
    return Math.min(1, (t + 1) / fd, (c.dur - t) / fd);
  }
  return Math.pow(1 - t / Math.max(c.dur, 1), curve);
};

type State = {
  scale: number; ax: number; ay: number; dx: number; dy: number; rot: number;
  blur: number; flash: number; flashColor: string; dark: number; grain: number; rgb: number;
};

export const fxState = (frame: number, cues: FxCue[], width: number, height: number): State => {
  const s: State = { scale: 1, ax: 0.5, ay: 0.5, dx: 0, dy: 0, rot: 0, blur: 0, flash: 0, flashColor: "#fffaf0", dark: 0, grain: 0, rgb: 0 };
  let anchorWeight = 0;
  const anchor = (c: FxCue, e: number) => {
    if (e <= anchorWeight) return;
    anchorWeight = e;
    s.ax = c.x ?? 0.5;
    s.ay = c.y ?? 0.5;
  };
  for (const c of cues) {
    if (!active(c, frame)) continue;
    const r = (salt: number) => rand(`${frame}:${c.f}`, salt, 3);
    switch (c.fx) {
      case "punch": {
        const e = env(c, frame, "hit", 2.5);
        s.scale *= 1 + (c.amt ?? 0.06) * e;
        s.blur += (c.blur ?? 2) * e * e * e;
        s.rgb += 0.002 * e;
        anchor(c, e);
        break;
      }
      case "zoom": {
        const p = (frame - c.f + 1) / Math.max(c.dur, 1);
        const e = Math.max(0, p * p * (3 - 2 * p));
        s.scale *= 1 + (c.amt ?? 0.08) * e;
        anchor(c, 0.01);
        break;
      }
      case "shake": {
        const e = env(c, frame, "hit", 2);
        const a = (c.amt ?? 14) * e;
        s.dx += (r(1) * 2 - 1) * a;
        s.dy += (r(2) * 2 - 1) * a;
        s.rot += (r(3) * 2 - 1) * 0.006 * e;
        s.scale *= 1 + (2 * a) / height;
        break;
      }
      case "whip": {
        const rad = ((c.angle ?? 0) * Math.PI) / 180;
        const dist = (c.amt ?? 0.12) * width;
        let slide: number, e: number;
        if (frame < c.f) {
          const q = (frame - (c.f - (c.pre ?? 1)) + 1) / ((c.pre ?? 1) + 1);
          slide = dist * q * q * q;
          e = q * q;
        } else {
          const q = 1 - (frame - c.f) / Math.max(c.dur, 1);
          slide = -dist * q * q * q;
          e = q * q;
        }
        s.dx += Math.cos(rad) * slide;
        s.dy += Math.sin(rad) * slide;
        s.blur += (c.blur ?? 10) * e;
        s.scale *= 1 + 0.03 * e;
        break;
      }
      case "flash":
        s.flash += (c.amt ?? 1) * env(c, frame, "hit", 2.8);
        if (c.color) s.flashColor = c.color;
        break;
      case "dark": {
        const hold = c.hold ?? 2;
        const t = frame - c.f;
        const e = t < 0 ? env(c, frame) : t < hold ? 1 : Math.pow(1 - (t - hold) / Math.max(c.dur - hold, 1), 2);
        s.dark = Math.max(s.dark, (c.amt ?? 0.94) * e);
        break;
      }
      case "grain":
        s.grain = Math.max(s.grain, (c.amt ?? 0.25) * env(c, frame, "span"));
        break;
      case "rgb":
        s.rgb += Math.min(c.amt ?? 0.006, 0.05) * env(c, frame, "hit", 2);
        break;
    }
  }
  return s;
};

/**
 * يلف المحتوى ويطبق عليه مؤثرات الكاميرا، ثم يضيف فوقه الوميض والإظلام والحبيبات.
 * الحواف: المحتوى يُكبَّر قليلاً مع الاهتزاز والانزلاق، فلا تظهر حواف فارغة.
 */
export const CameraFx: React.FC<{ cues: FxCue[]; children: React.ReactNode }> = ({ cues, children }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const s = fxState(frame, cues, width, height);
  const overscan = 1 + (Math.abs(s.dx) * 2) / width + (Math.abs(s.dy) * 2) / height;
  const split = s.rgb * width;

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          transformOrigin: `${s.ax * 100}% ${s.ay * 100}%`,
          transform: `translate(${s.dx}px, ${s.dy}px) rotate(${s.rot}rad) scale(${s.scale * overscan})`,
          filter: [
            s.blur > 0.3 ? `blur(${s.blur.toFixed(2)}px)` : "",
            split > 0.5 ? `drop-shadow(${split}px 0 0 rgba(255,0,60,0.35)) drop-shadow(${-split}px 0 0 rgba(0,200,255,0.35))` : "",
          ].join(" ") || undefined,
        }}
      >
        {children}
      </AbsoluteFill>
      {s.flash > 0.01 && (
        <AbsoluteFill style={{ background: s.flashColor, opacity: Math.min(0.85, 0.45 * s.flash), mixBlendMode: "screen" }} />
      )}
      {s.dark > 0.01 && <AbsoluteFill style={{ background: "#05050d", opacity: s.dark }} />}
      {s.grain > 0.005 && <Grain amount={s.grain} seed={frame} />}
    </AbsoluteFill>
  );
};

/** حبيبات فيلم: ضجيج SVG بذرة مختلفة لكل إطار، يُمزج بـ overlay فيظهر في الدرجات المتوسطة أكثر. */
export const Grain: React.FC<{ amount: number; seed: number }> = ({ amount, seed }) => (
  <AbsoluteFill style={{ opacity: Math.min(1, amount * 2.2), mixBlendMode: "overlay", pointerEvents: "none" }}>
    <svg width="100%" height="100%">
      <filter id={`grain-${seed}`}>
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={seed % 997} stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter={`url(#grain-${seed})`} />
    </svg>
  </AbsoluteFill>
);
