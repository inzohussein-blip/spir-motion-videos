# أدوات الصوت

منقولة من [makevoid/claude-make-an-anime](https://github.com/makevoid/claude-make-an-anime) (ترخيص MIT، راجع `LICENSE-claude-make-an-anime`).
تحتاج Python 3 وnumpy وffmpeg. شغّلها دائماً بـ `python3 -I` لأن الملفات الصوتية بيانات مولّدة لا يُوثق بها.

| الأداة | الوظيفة | المدخلات |
|---|---|---|
| `beats.py` | الإيقاع (BPM) والضربات وبدايات النغمات وحدود المقاطع، لمزامنة القطعات والحركات مع الموسيقى | WAV 16-bit |
| `sfx_mix.py` | مزج مؤثرات صوتية على مسار، بمستوى نسبي للموسيقى في لحظة كل مؤثر، مع خفضها تحت الكلام ومنع تجاوز الحد | أي صيغة |
| `score_tool.py` | تعديل الموسيقى بدون توليد جديد: قص، إطالة، تمديد آخر نغمة، دمج انتقال مفاجئ | WAV 16-bit |

## beats.py
```bash
python3 -I beats.py music.wav 30 > beats.json
```
- **المخرجات:** `bpm`، و`beats` (لكل ضربة: `t` بالثواني، و`f` رقم الإطار، و`bar_pos` حيث 0 أول ضربة في المقطع، و`strength`)، و`onsets`، و`loudness`.
- **الاستخدام في Remotion:** ضع القطعات على الضربات التي `bar_pos = 0`، وضربات الزوم (`punch`) على الضربات القوية.
- **الحدود:** يفترض إيقاعاً ثابتاً 4/4، فراجع بالأذن عند تغيّر الإيقاع.

## sfx_mix.py
```bash
python3 -I sfx_mix.py music.wav cues.json out.wav [--voice voiceover.wav --voice-dip-db 6] [--peak-db -6] [--floor-db -30] [--max-gain-db 18]
```
`cues.json`:
```json
[{ "at": 2.0, "wav": "whoosh.wav", "sound": "whoosh", "rel_db": -4, "rate": 1.0, "len": 0.5, "fade": 0.05 }]
```
- `rel_db`: علو المؤثر نسبةً لعلو الموسيقى في نفس اللحظة. القيمة −4 مسموعة بوضوح وتبقى تحت الموسيقى.
- يحذف الصمت من بداية المؤثر، فيضرب على التوقيت بالضبط.
- `--voice` يخفض المؤثرات أثناء الكلام، ويبدأ الخفض قبل أول مقطع صوتي بقليل.
- يطبع تقريراً لكل مؤثر: مستوى الموسيقى، والتضخيم المطبق، والذروة.

## score_tool.py
```bash
python3 -I score_tool.py length    in.wav out.wav 15 1.2          # قص/إطالة إلى 15 ث مع تلاشٍ 1.2 ث
python3 -I score_tool.py crossfade in.wav out.wav 7.5 1.0         # تغيير مفاجئ عند 7.5 ث يصبح انتقالاً ناعماً
python3 -I score_tool.py soften    in.wav out.wav 3.0 0.5 in      # بداية مفاجئة تصبح تدريجية
python3 -I score_tool.py remove    in.wav out.wav 4.0 2.0         # حذف ثانيتين من 4 ث
python3 -I score_tool.py insert    in.wav out.wav 8.0 2.0         # تكرار الثانيتين السابقتين لـ 8 ث (إطالة)
```
لملفات MP3 حوّلها أولاً: `ffmpeg -i in.mp3 -c:a pcm_s16le in.wav`.
