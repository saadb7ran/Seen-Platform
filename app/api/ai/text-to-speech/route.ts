import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json(
      { success: false, error: 'يلزم تسجيل الدخول.' },
      { status: 401 },
    );
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { success: false, error: 'مفتاح خدمة الصوت غير معرف' },
      { status: 500 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: 'صيغة الطلب غير صالحة' },
      { status: 400 }
    );
  }

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json(
      { success: false, error: 'بيانات الصوت غير صالحة' },
      { status: 400 }
    );
  }

  const { text, voiceGender } = body as Record<string, unknown>;
  if (
    typeof text !== 'string' ||
    text.trim().length === 0 ||
    text.length > 4096 ||
    (voiceGender !== undefined && voiceGender !== 'female' && voiceGender !== 'male')
  ) {
    return NextResponse.json(
      { success: false, error: 'النص أو نوع الصوت غير صالح' },
      { status: 400 }
    );
  }

  try {
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: text,
        voice: voiceGender === 'female' ? 'alloy' : 'onyx',
      }),
      signal: AbortSignal.timeout(30_000),
    });

    if (!response.ok) {
      console.error('OpenAI TTS request failed with status:', response.status);
      return NextResponse.json(
        { success: false, error: 'تعذر على خدمة الصوت توليد المقطع' },
        { status: 502 }
      );
    }

    if (!response.body) {
      throw new Error('OpenAI TTS response did not include an audio stream');
    }
    const audio = await response.arrayBuffer();

    return new NextResponse(audio, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': 'inline; filename="listening-sample.mp3"',
      },
    });
  } catch (error) {
    console.error('TTS Error:', error);
    if (error instanceof Error && error.name === 'TimeoutError') {
      return NextResponse.json(
        { success: false, error: 'انتهت مهلة توليد المقطع الصوتي. أعد المحاولة.' },
        { status: 504 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'فشل في توليد المقطع الصوتي' },
      { status: 502 }
    );
  }
}