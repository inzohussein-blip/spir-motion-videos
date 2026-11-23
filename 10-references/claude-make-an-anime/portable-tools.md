# أدوات قابلة للنقل (من claude-make-an-anime، ترخيص MIT)

| الأداة الأصلية | ماذا تفعل | الحالة عندنا |
|---|---|---|
| `tools/p5/lib/particles.js` | جسيمات وانفجارات وشرر حتمية: كل جسيم دالة لعمره وبصمة (id, k)، فأي إطار يُرسم منفرداً يطابق الرسم الكامل | ✅ نُقلت: `05-video-templates/reels-shorts/remotion-arabic-reel/src/fx/particles.ts` |
| `tools/vfx/Sources/mvfx/Effects.swift` | مؤثرات كاميرا مقادة بإشارات زمنية: punch وshake وwhip وflash وgrain | ✅ أُعيدت كتابتها لـ Remotion: `src/fx/camera.tsx` |
| `tools/python/sfx_mix.py` | مزج المؤثرات نسبةً للموسيقى، مع خفضها تحت الصوت البشري ومنع تجاوز الحد | ✅ نُقلت: `04-audio/tools/sfx_mix.py` |
| `tools/python/beats.py` | الإيقاع (BPM) وبدايات النغمات وحدود المقاطع (downbeats) | ✅ نُقلت: `04-audio/tools/beats.py` |
| `tools/python/score_tool.py` | تعديل الموسيقى بدون توليد: تمديد آخر نغمة، قص، دمج انتقال مفاجئ | ✅ نُقلت: `04-audio/tools/score_tool.py` |
| `lib/fal/client.rb` (الإيصالات) | استئناف الطلب المدفوع بدل تكراره | 📋 مبدأ موثّق في `CLAUDE.md` |
| `lib/workflow/approval.rb` | بوابة الموافقة بالبصمة | 📋 مبدأ موثّق في `CLAUDE.md` |
| `ffmpeg.rb#duck_mix` | خفض الموسيقى تحت الكلام | 📋 مستقبلاً |
| `ffmpeg.rb#twitter_1080/youtube_4k` | تصدير مع تصحيح الألوان BT.601→BT.709 | 📋 مستقبلاً |
| `tools/python/camera_motion.py` | قياس حركة الكاميرا بين إطارين | 📋 مستقبلاً (مراجعة لقطات الذكاء الاصطناعي) |

نسخة الأصل المرجعية: commit `adc1a76`، 2026-11-08، © makevoid، ترخيص MIT.
