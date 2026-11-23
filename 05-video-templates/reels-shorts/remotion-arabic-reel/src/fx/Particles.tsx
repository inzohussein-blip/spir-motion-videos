import { useLayoutEffect, useRef } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { drawParticles, Mode, ParticleEvent } from "./particles";

/**
 * طبقة جسيمات حتمية فوق الفيديو. الأحداث بالثواني (at) والإحداثيات ببكسلات التكوين.
 * mode="light" يرسم الأجزاء المضيئة فقط، ويُستخدم مع blur لعمل توهج لا يغطي الصورة كلها.
 */
export const Particles: React.FC<{ events: ParticleEvent[]; mode?: Mode; glowPx?: number }> = ({
  events,
  mode = "color",
  glowPx = 0,
}) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  useLayoutEffect(() => {
    const g = ref.current?.getContext("2d");
    if (!g) return;
    g.clearRect(0, 0, width, height);
    drawParticles(g, events, frame / fps, mode);
  }, [frame, fps, width, height, events, mode]);

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <canvas
        ref={ref}
        width={width}
        height={height}
        style={{
          width,
          height,
          filter: glowPx ? `blur(${glowPx}px)` : undefined,
          mixBlendMode: glowPx ? "screen" : undefined,
        }}
      />
    </AbsoluteFill>
  );
};

/** الجسيمات مع توهج: طبقة ضوء مموّهة تحت الطبقة الحادة، فيتوهج الضوء وحده لا الصورة كلها. */
export const GlowingParticles: React.FC<{ events: ParticleEvent[]; glowPx?: number }> = ({ events, glowPx = 14 }) => (
  <>
    <Particles events={events} mode="light" glowPx={glowPx} />
    <Particles events={events} />
  </>
);
