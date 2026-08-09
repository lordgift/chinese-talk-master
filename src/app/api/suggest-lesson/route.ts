import { NextResponse } from 'next/server';

const TARGET_EMAIL = 'jarupath.jdp@gmail.com';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { topic, details, userEmail, userName } = body;

    if (!topic || typeof topic !== 'string' || !topic.trim()) {
      return NextResponse.json({ error: 'กรุณากรอกหัวข้อบทเรียนที่ต้องการเสนอ' }, { status: 400 });
    }

    const topicClean = topic.trim();
    const detailsClean = details ? details.trim() : 'ไม่มีรายละเอียดเพิ่มเติม';
    const senderEmailClean = userEmail || 'ไม่ระบุ (ผู้ใช้ทั่วไป)';
    const senderNameClean = userName || 'ผู้เรียนทั่วไป';
    const timeString = new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' });

    console.log(`📩 [Suggest Lesson] Direct Email Request: "${topicClean}" from ${senderEmailClean}`);

    // Send email using FormSubmit API directly to target email (No database storage!)
    const formSubmitUrl = `https://formsubmit.co/ajax/${TARGET_EMAIL}`;

    const emailResponse = await fetch(formSubmitUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        'Referer': 'https://chinese-talk-master.web.app',
      },
      body: JSON.stringify({
        _subject: `[华语Talk Master] ข้อเสนอแนะบทเรียนใหม่: ${topicClean}`,
        _captcha: 'false',
        _template: 'table',
        "หัวข้อบทเรียนที่เสนอ": topicClean,
        "รายละเอียดประโยคเพิ่มเติม": detailsClean,
        "ชื่อผู้ส่ง": senderNameClean,
        "อีเมลผู้ส่ง": senderEmailClean,
        "เวลาที่ส่ง": timeString,
      }),
    });

    const emailResult = await emailResponse.json().catch(() => ({}));
    console.log('📬 FormSubmit Email Dispatch Status:', emailResponse.status, emailResult);

    return NextResponse.json({
      success: true,
      message: 'ส่งข้อเสนอแนะบทเรียนไปยังอีเมลเรียบร้อยแล้ว',
      emailResult,
    });
  } catch (error) {
    console.error('Suggest lesson API error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาลองใหม่อีกครั้ง' },
      { status: 500 }
    );
  }
}
