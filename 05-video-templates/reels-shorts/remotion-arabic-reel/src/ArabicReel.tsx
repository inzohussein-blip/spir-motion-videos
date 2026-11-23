import { z } from "zod";
import { zColor } from "@remotion/zod-types";
import { loadFont } from "@remotion/google-fonts/Cairo";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const { fontFamily } = loadFont("normal", {
  weights: ["400", "800"],
  subsets: ["arabic", "latin"],
});

export const SCENE_FRAMES = 60; // ثانيتان لكل مشهد بمعدل 30fps
export const OUTRO_FRAMES = 60;

export const reelSchema = z.object({
  scenes: z.array(z.object({ text: z.string(), accent: z.string() })).min(1),
  cta: z.string(),
  brand: z.string(),
  colors: z.object({
    background: zColor(),
    primary: zColor(),
    accent: zColor(),
  }),
});

type Props = z.infer<typeof reelSchema>;
type Colors = Props["colors"];

/** خلفية بدوائر ضوئية تتحرك ببطء */
const Background: React.FC<{ colors: Colors }> = ({ colors }) => {
  const frame = useCurrentFrame();
  const x = 50 + Math.sin(frame / 40) * 20;
  const y = 40 + Math.cos(frame / 55) * 15;
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at ${x}% ${y}%, ${colors.accent}55 0%, transparent 45%),
                     radial-gradient(circle at ${100 - x}% ${100 - y}%, ${colors.accent}33 0%, transparent 40%),
                     ${colors.background}`,
      }}
    />
  );
};

/** مشهد: سطر رئيسي ينزلق للأعلى + كلمة مميزة تظهر بنبضة */
const Scene: React.FC<{ text: string; accent: string; colors: Colors }> = ({
  text,
  accent,
  colors,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({ frame, fps, config: { damping: 14 } });
  const accentPop = spring({ frame: frame - 8, fps, config: { damping: 9, stiffness: 160 } });
  const exit = interpolate(frame, [SCENE_FRAMES - 10, SCENE_FRAMES], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });
  const underline = interpolate(frame, [12, 30], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        direction: "rtl",
        fontFamily,
        opacity: exit,
        transform: `scale(${0.95 + exit * 0.05})`,
        padding: 80,
        textAlign: "center",
      }}
    >
      <div
        style={{
          color: colors.primary,
          fontSize: 96,
          fontWeight: 400,
          opacity: enter,
          transform: `translateY(${(1 - enter) * 80}px)`,
        }}
      >
        {text}
      </div>
      <div style={{ display: "inline-block", marginTop: 30, maxWidth: "100%" }}>
        <div
          style={{
            color: colors.accent,
            fontSize: 140,
            fontWeight: 800,
            lineHeight: 1.45,
            transform: `scale(${accentPop})`,
          }}
        >
          {accent}
        </div>
        <div
          style={{
            height: 14,
            marginTop: 16,
            borderRadius: 7,
            background: colors.accent,
            width: `${underline}%`,
            marginInlineStart: "auto",
            marginInlineEnd: 0,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

/** الخاتمة: الشعار + الدعوة للإجراء */
const Outro: React.FC<{ cta: string; brand: string; colors: Colors }> = ({
  cta,
  brand,
  colors,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logo = spring({ frame, fps, config: { damping: 12 } });
  const ctaIn = spring({ frame: frame - 12, fps, config: { damping: 15 } });

  return (
    <AbsoluteFill
      style={{ justifyContent: "center", alignItems: "center", fontFamily, direction: "rtl" }}
    >
      <div
        style={{
          fontSize: 170,
          fontWeight: 800,
          letterSpacing: 12,
          color: colors.primary,
          transform: `scale(${logo}) rotate(${(1 - logo) * -10}deg)`,
        }}
      >
        {brand}
      </div>
      <div
        style={{
          marginTop: 50,
          padding: "24px 64px",
          borderRadius: 999,
          background: colors.accent,
          color: colors.primary,
          fontSize: 64,
          fontWeight: 800,
          opacity: ctaIn,
          transform: `translateY(${(1 - ctaIn) * 60}px)`,
        }}
      >
        {cta}
      </div>
    </AbsoluteFill>
  );
};

export const ArabicReel: React.FC<Props> = ({ scenes, cta, brand, colors }) => {
  return (
    <AbsoluteFill>
      <Background colors={colors} />
      {scenes.map((s, i) => (
        <Sequence key={i} from={i * SCENE_FRAMES} durationInFrames={SCENE_FRAMES}>
          <Scene text={s.text} accent={s.accent} colors={colors} />
        </Sequence>
      ))}
      <Sequence from={scenes.length * SCENE_FRAMES} durationInFrames={OUTRO_FRAMES}>
        <Outro cta={cta} brand={brand} colors={colors} />
      </Sequence>
    </AbsoluteFill>
  );
};
