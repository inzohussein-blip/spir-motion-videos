import { CalculateMetadataFunction, Composition } from "remotion";
import { z } from "zod";
import { ArabicReel, reelSchema, SCENE_FRAMES, OUTRO_FRAMES } from "./ArabicReel";
import {
  CaptionedReel,
  CaptionedReelProps,
  captionedReelSchema,
  loadCaptions,
} from "./CaptionedReel";
import { FxShowcase, fxShowcaseSchema, FX_SHOWCASE_FRAMES } from "./FxShowcase";

type Props = z.infer<typeof reelSchema>;

const calculateMetadata: CalculateMetadataFunction<Props> = ({ props }) => ({
  durationInFrames: props.scenes.length * SCENE_FRAMES + OUTRO_FRAMES,
});

const defaultProps: Props = {
  scenes: [
    { text: "هل تعلم؟", accent: "٩٠٪" },
    { text: "من المشاهدين يقررون", accent: "في أول ٣ ثوانٍ" },
    { text: "ابدأ فيديوك بخطّاف", accent: "قوي" },
  ],
  brandId: "spir-default",
};

const captionedDefaults: CaptionedReelProps = {
  brandId: "spir-default",
  audio: "demo-voiceover.mp3",
  words: "demo-words.json",
  maxWordsPerPage: 3,
  autoFx: true,
};

const calculateCaptioned: CalculateMetadataFunction<CaptionedReelProps> = async ({ props }) => {
  const { pages, seconds } = await loadCaptions(props);
  return { durationInFrames: Math.ceil(seconds * 30), props: { ...props, pages } };
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ArabicReel"
        component={ArabicReel}
        schema={reelSchema}
        defaultProps={defaultProps}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={1}
        calculateMetadata={calculateMetadata}
      />
      <Composition
        id="CaptionedReel"
        component={CaptionedReel}
        schema={captionedReelSchema}
        defaultProps={captionedDefaults}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={1}
        calculateMetadata={calculateCaptioned}
      />
      <Composition
        id="FxShowcase"
        component={FxShowcase}
        schema={fxShowcaseSchema}
        defaultProps={{ brandId: "spir-default" as const, title: "بووم!" }}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={FX_SHOWCASE_FRAMES}
      />
    </>
  );
};
