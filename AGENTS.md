<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# User Guidelines

- Do NOT run automated browser subagents or automated UI tests (e.g. browser verification), as it takes too long. Rely on building/typechecking and direct user inspection instead.

# Lesson Difficulty Standards (เกณฑ์ตรวจสอบระดับความยากบทเรียน)

ทุกครั้งที่มีการ**เพิ่มหรือแก้ไขบทเรียน**ใน `src/data/scenarios.ts` ต้องประเมินและกำหนด `level` และ `levelTitle` ให้ถูกต้องตามเกณฑ์มาตรฐานเสมอ:

1. **🟢 Easy (`easy` - ง่าย / ระดับเริ่มต้น 🌱)**:
   - **ลักษณะ**: แบบฝึกออกเสียงเดี่ยว, คำศัพท์/คำทักทายโดดๆ, นับเลข, ประโยคสั้นตรงไปตรงมา (1–6 คำ)
   - **จำนวนบทสนทนา**: สั้น (2–4 ตาโต้ตอบ)
   - **ตัวอย่าง**: "你好", "买一张票", "入口在哪里？", "这是我的护照"
   - **รูปแบบ `levelTitle`**: `ง่าย 🌱 (คำอธิบายสั้น)` หรือ `ง่ายมาก 🌱 (คำอธิบายสั้น)`

2. **🟡 Medium (`medium` - ปานกลาง 🌿)**:
   - **ลักษณะ**: ประโยคความรวม, กริยาช่วย (会, 要, 可以, 听不懂), ประโยคถามแบบมีตัวเลือก (还是), การขอปรับแต่ง/ต่อรอง/บริการ (少糖, 便宜一点, 寄存行李, 输入手机号)
   - **จำนวนบทสนทนา**: ปานกลาง (4–8 ตาโต้ตอบ) หรือประโยคยาว 6–15 ตัวอักษร
   - **รูปแบบ `levelTitle`**: `ปานกลาง 🌿 (คำอธิบายสั้น)`

3. **🔴 Hard (`hard` - ท้าทาย 🔥)**:
   - **ลักษณะ**: บทสนทนายาวมาก (10–16 ตาขึ้นไป), มีการเปรียบเทียบหรือสลับหัวข้อหลายเรื่องพร้อมกัน (เช่น คำตรงข้าม 8 คู่, สภาพอากาศ+ฤดูกาล), คำศัพท์เฉพาะทางหนาแน่น
   - **รูปแบบ `levelTitle`**: `ท้าทาย 🔥 (คำอธิบายสั้น)`

### Checklist เมื่อมีการเพิ่ม/แก้ไขบทเรียน:
- [ ] ตรวจสอบว่า `level` สอดคล้องกับความยาวและไวยากรณ์ ไม่ตั้งเป็น `easy` พร่ำเพรื่อหากมีประโยคซับซ้อนหรือบทสนทนายาว
- [ ] ตั้งค่า `levelTitle` ให้มี Emoji สัญลักษณ์ระดับ (`🌱`, `🌿`, `🔥`) และข้อความกระชับ
- [ ] อัปเดต `scenariosCount` ใน `src/data/categories.ts` ให้ตรงกับจำนวนบทเรียนจริงในหมวดนั้นๆ เสมอ
- [ ] ตั้ง `estimatedMinutes` ตามความยาวจริง (≈ 2 + จำนวนตา × 0.5 เช่น 4 ตา → 4 นาที, 8 ตา → 6 นาที)
- [ ] ประโยคของผู้เรียน (`speaker: 'user'`) สั้นไม่เกิน ~10 ตัวอักษรจีน และ `words` ต้องเรียงต่อกันได้ตรงกับ `hanzi` ทุกตัว (ระบบให้คะแนนการพูดตามลำดับคำ)
- [ ] ประโยคของคู่สนทนา (`speaker: 'ai'`) ต้องเป็นข้อความที่อ่านออกเสียงได้เท่านั้น ห้ามมีวงเล็บอธิบายปน (TTS จะอ่านออกมาด้วย) และควรมี `variants` 1–2 แบบ = วิธีที่คนจีนจริงตอบได้ในความหมายเดียวกัน (ประโยคถัดไปของผู้เรียนต้องยังต่อได้)
- [ ] ทุกบท (ยกเว้นบทฝึกตัวอักษรพินอินล้วน) ต้องมี `expansions` แบบไล่ขั้น (คำ → วลี → ประโยค) ที่ `scrambledWords` รวมกันได้ตรงกับ `targetHanzi` และมี `coreKeywords` 4–6 คำ
- [ ] พินอินเขียนตามเสียงที่ออกจริงของ 不/一 (bú yào, yí gè, yì bēi) ส่วนเสียง 3 ติดกัน (你好) เขียนตามปกติแต่ใส่ 💡 อธิบาย
- [ ] บรรทัดฝึกตัวอักษรพินอิน (เช่น `b p m f`) ต้องมี `words` คำละ 1 พยางค์ และพยางค์นั้นต้องอยู่ในตาราง `SYLLABLE_CHARS` ใน `src/lib/pinyinUtils.ts` (ถ้าไม่มีให้เพิ่มอักษรจีนที่ออกเสียงนั้นลงตาราง)
- [ ] เนื้อหาต้องตรงกับจีนปัจจุบัน (เช่น สแกนจ่าย/乘车码/จองด้วยพาสปอร์ต) และใช้ศัพท์ที่คนจีนใช้จริง

# Cultural and Language Context (บริบททางภาษาและวัฒนธรรมจีน 🇨🇳)
- โปรเจกต์นี้คือ **เว็บแอปพลิเคชันสำหรับฝึกพูดภาษาจีน (Chinese Talk Master)**
- ทุกเนื้อหา, ตัวละคร, สถาปัตยกรรม, บทสนทนา, คำศัพท์, ป้ายบอกทาง, เมนูอาหาร, และภาพประกอบทั้งหมด **ต้องเป็นภาษาจีน (อักษรจีน Hanzi/Pinyin) และบริบทวัฒนธรรมจีนเท่านั้น** (เช่น ปักกิ่ง, เซี่ยงไฮ้, เฉิงตู, เมืองจีน)
- **ห้าม** มีตัวอักษรภาษาญี่ปุ่น (Hiragana, Katakana, ไวยากรณ์ญี่ปุ่น) หรือบรรยากาศ/วัฒนธรรมที่ไม่เกี่ยวข้องปะปนในสื่อการเรียนรู้หรือภาพประกอบโดยเด็ดขาด

