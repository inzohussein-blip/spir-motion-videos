// تحويل توقيتات الكلمات (من ElevenLabs Speech-to-Text) إلى "صفحات" ترجمة قصيرة.

export type CaptionWord = { text: string; start: number; end: number };
export type CaptionPage = { words: CaptionWord[]; start: number; end: number };

/** يقبل صيغة ElevenLabs كما هي: {"words":[...]} أو مصفوفة مباشرة، ويتجاهل المسافات والأصوات غير الكلامية */
export const parseWords = (raw: unknown): CaptionWord[] => {
  const list = Array.isArray(raw) ? raw : (raw as { words?: unknown[] })?.words ?? [];
  return (list as Array<CaptionWord & { type?: string }>)
    .filter((w) => (w.type ?? "word") === "word" && w.text.trim() !== "")
    .map((w) => ({ text: w.text.trim(), start: w.start, end: w.end }));
};

const ENDS_PHRASE = /[.,،؛;:!?؟]$/;

/**
 * يقسّم الكلمات إلى صفحات:
 * - حد أقصى maxWords كلمات في الصفحة
 * - صفحة جديدة بعد علامة ترقيم، أو عند صمت أطول من maxGap ثانية
 */
export const toPages = (words: CaptionWord[], maxWords = 3, maxGap = 0.45): CaptionPage[] => {
  const pages: CaptionPage[] = [];
  let current: CaptionWord[] = [];
  words.forEach((w, i) => {
    current.push(w);
    const next = words[i + 1];
    const brk =
      !next ||
      current.length >= maxWords ||
      ENDS_PHRASE.test(w.text) ||
      next.start - w.end > maxGap;
    if (brk) {
      pages.push({ words: current, start: current[0].start, end: w.end });
      current = [];
    }
  });
  // كل صفحة تبقى ظاهرة حتى بداية التالية (بدون فراغ وميض بين الصفحات)
  return pages.map((p, i) => ({ ...p, end: pages[i + 1]?.start ?? p.end + 0.6 }));
};
