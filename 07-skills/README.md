# 07-skills

سكلز (Skills) لـ Claude وأدوات الذكاء الاصطناعي لأتمتة إنتاج الفيديو.

كل سكل في مجلد مستقل يحتوي على `SKILL.md` (انسخ `_templates/skill-template/`).

## السكلز المتوفرة
| السكل | الوظيفة |
|---|---|
| [`video-producer`](video-producer/SKILL.md) | **المنسّق**: من فكرة واحدة إلى فيديو منشور، مروراً بكل المراحل والسكلز الأخرى |
| [`video-script-writer`](video-script-writer/SKILL.md) | سكربت فيديو بالمشاهد والتوقيت والتعليق الصوتي |
| [`storyboard-to-prompts`](storyboard-to-prompts/SKILL.md) | تحويل المشاهد إلى برومبتات صور وفيديو بأسلوب موحّد |

## طريقة الاستخدام مع Claude Code
انسخ مجلد السكل إلى `.claude/skills/` في مشروعك، أو إلى `~/.claude/skills/` لتعمل في كل المشاريع.

## أفكار سكلز قادمة
- `remotion-scene-builder`: توليد مشاهد Remotion من وصف نصي.
- `voiceover-generator`: تجهيز نص التعليق الصوتي وإعدادات ElevenLabs.
- `subtitle-styler`: تنسيق الترجمة والنصوص المتحركة.
