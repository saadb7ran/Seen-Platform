import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { aiGenerationSchema, generatedQuestionSchema } from '@/lib/validation';

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json(
      { success: false, error: 'يلزم تسجيل الدخول.' },
      { status: 401 },
    );
  }
  if (user.role !== 'ADMIN') {
    return NextResponse.json(
      { success: false, error: 'ليس لديك صلاحية تنفيذ هذا الإجراء.' },
      { status: 403 },
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

  const input = aiGenerationSchema.safeParse(body);
  if (!input.success) {
    return NextResponse.json(
      { success: false, error: 'المهارة أو المستوى غير صالح' },
      { status: 400 }
    );
  }
  const { skill, level } = input.data;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { success: false, error: 'مفتاح API الخاص بالذكاء الاصطناعي غير معرف' },
      { status: 500 }
    );
  }

  try {
    const prompt = `You are an expert CEFR English Language Test Designer for Seen Platform.
Generate a high-quality ${level} level multiple-choice question for the ${skill} skill.

Return ONLY a valid JSON object matching this exact structure:
{
  "skill": "${skill}",
  "cefrLevel": "${level}",
  "passage": "Provide a reading text snippet if skill is READING, otherwise null",
  "prompt": "The question or prompt text",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": "Exact string matching one of the options",
  "explanation": "Brief explanation of why this answer is correct"
}`;

    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' }
        }),
        signal: AbortSignal.timeout(30_000),
      }
    );

    if (!response.ok) {
      console.error('Gemini request failed with status:', response.status);
      return NextResponse.json(
        { success: false, error: 'تعذر على خدمة الذكاء الاصطناعي توليد السؤال' },
        { status: 502 }
      );
    }

    const data: unknown = await response.json();
    if (
      !data ||
      typeof data !== 'object' ||
      !('candidates' in data) ||
      !Array.isArray(data.candidates)
    ) {
      throw new Error('Gemini response has an invalid shape');
    }

    const candidate: unknown = data.candidates[0];
    if (!candidate || typeof candidate !== 'object' || !('content' in candidate)) {
      throw new Error('Gemini response did not include a candidate');
    }

    const content: unknown = candidate.content;
    if (
      !content ||
      typeof content !== 'object' ||
      !('parts' in content) ||
      !Array.isArray(content.parts)
    ) {
      throw new Error('Gemini response did not include candidate content');
    }

    const part: unknown = content.parts[0];
    if (!part || typeof part !== 'object' || !('text' in part) || typeof part.text !== 'string') {
      throw new Error('Gemini response did not include generated text');
    }

    const generatedContent = generatedQuestionSchema.safeParse(JSON.parse(part.text));
    if (
      !generatedContent.success ||
      generatedContent.data.skill !== skill ||
      generatedContent.data.cefrLevel !== level
    ) {
      throw new Error('Gemini generated an invalid question');
    }

    return NextResponse.json({
      success: true,
      question: generatedContent.data,
    });
  } catch (error) {
    console.error('Error generating AI question:', error);
    if (error instanceof Error && error.name === 'TimeoutError') {
      return NextResponse.json(
        { success: false, error: 'انتهت مهلة توليد السؤال. أعد المحاولة.' },
        { status: 504 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'فشل في توليد السؤال عبر الذكاء الاصطناعي' },
      { status: 502 }
    );
  }
}