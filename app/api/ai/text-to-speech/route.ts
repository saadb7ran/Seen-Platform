import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { text, voiceGender } = await request.json();

    // يمكن استخدام OpenAI TTS API أو ElevenLabs لإنشاء مقطع صوتي عالي النقاء
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: text,
        voice: voiceGender === 'female' ? 'alloy' : 'onyx',
      }),
    });

    if (!response.ok) {
      throw new Error('TTS API failed');
    }

    const audioBuffer = await response.arrayBuffer();

    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': 'inline; filename="listening-sample.mp3"',
      },
    });
  } catch (error) {
    console.error('TTS Error:', error);
    return NextResponse.json(
      { success: false, error: 'فشل في توليد المقطع الصوتي' },
      { status: 500 }
    );
  }
}