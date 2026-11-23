import { z } from "zod";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BRANDS, BRAND_IDS, Brand } from "./brands";
import { getFont } from "./fonts";
import { Background } from "./ArabicReel";
import { CameraFx, FxCue } from "./fx/camera";
import { GlowingParticles } from "./fx/Particles";
import { ParticleEvent } from "./fx/particles";

// عرض توضيحي لمكتبة المؤثرات (4 ثوانٍ، 9:16): ليزر يضرب نقطة ← انفجار + شرر + أثر احتراق،
// ومعه ضربة زوم واهتزاز ووميض على نفس اللحظة، ثم عنوان يرتطم. كل شيء مشتق من نفس التوقيت HIT.
export const FX_SHOWCASE_FRAMES = 120;
const HIT = 1.0; // ثانية الاصطدام

export const fxShowcaseSchema = z.object({
  brandId: z.enum(BRAND_IDS),
  title: z.string(),
});

const events = (w: number, h: number): ParticleEvent[] => {
  const x = w / 2, y = h * 0.42;
  return [
    { type: "scorch", id: "mark", at: HIT, x, y: y + 40, radius: 90 },
    { type: "laser", id: "beam", at: HIT - 0.25, dur: 0.3, from: [w * 0.1, h * 0.8], to: [x, y], width: 9 },
    { type: "explosion", id: "boom", at: HIT, x, y, size: 3.4, debris: 40 },
    { type: "sparks", id: "sparks", at: HIT, x, y, count: 60, speed: [400, 1500], gravity: 900, width: 3 },
    { type: "ring", id: "ring2", at: HIT + 0.05, x, y, radius: 380, dur: 0.5, weight: 8 },
  ];
};

export const FxShowcase: React.FC<z.infer<typeof fxShowcaseSchema>> = ({ brandId, title }) => {
  const brand: Brand = BRANDS[brandId];
  const font = getFont(brand.typography.fontFamily);
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const hitF = Math.round(HIT * fps);

  const cues: FxCue[] = [
    { fx: "grain", f: 0, dur: FX_SHOWCASE_FRAMES, amt: 0.04, fade: 1 },
    { fx: "punch", f: hitF, dur: 8, amt: 0.08, blur: 4, x: 0.5, y: 0.42 },
    { fx: "shake", f: hitF, dur: 12, amt: 22 },
    { fx: "flash", f: hitF, dur: 5, amt: 1, color: brand.colors.accent },
    { fx: "rgb", f: hitF, dur: 6, amt: 0.004 },
    { fx: "punch", f: hitF + 30, dur: 6, amt: 0.03 },
  ];

  const slam = spring({ frame: frame - (hitF + 30), fps, config: { damping: 11, stiffness: 200 } });
  const titleScale = interpolate(slam, [0, 1], [2.2, 1]);

  return (
    <CameraFx cues={cues}>
      <Background colors={brand.colors} />
      <GlowingParticles events={events(width, height)} glowPx={16} />
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 620, direction: "rtl" }}>
        <div
          style={{
            fontFamily: font.fontFamily,
            fontWeight: font.heading,
            fontSize: 150,
            color: brand.colors.primary,
            opacity: frame >= hitF + 30 ? Math.min(1, slam * 2) : 0,
            transform: `scale(${titleScale})`,
            textShadow: `0 0 40px ${brand.colors.accent}`,
          }}
        >
          {title}
        </div>
      </AbsoluteFill>
    </CameraFx>
  );
};
