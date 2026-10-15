import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { aiGenerationSchema, generatedQuestionContentSchema } from '@/lib/validation';

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
  "passage": ${skill === 'READING' ? '"A short original passage relevant to the question."' : 'null'},
  "prompt": "The question or prompt text",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": "Exact string matching one of the options",
  "explanation": "Brief explanation of why this answer is correct"
}
Do not include any fields other than passage, prompt, options, correctAnswer, and explanation.
${skill === 'READING' ? 'The passage must be non-empty and the question must assess comprehension of it.' : 'The passage value must be null.'}`;

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
      const message = response.status === 401 || response.status === 403
        ? 'رفضت خدمة Gemini مفتاح API. تحقق من صلاحيته ومن تفعيل Gemini API للمشروع.'
        : response.status === 429
          ? 'تم تجاوز حصة Gemini أو حد الطلبات. تحقق من الحصة ثم أعد المحاولة.'
          : response.status === 404
            ? 'نموذج Gemini المطلوب غير متاح لهذا المفتاح أو لهذا الإصدار من الخدمة.'
          : response.status >= 500
            ? 'خدمة Gemini غير متاحة مؤقتًا. أعد المحاولة لاحقًا.'
            : 'رفضت خدمة Gemini الطلب. تحقق من إعداد المفتاح وإعدادات النموذج.';
      return NextResponse.json(
        { success: false, error: message },
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
      if ('promptFeedback' in data) {
        console.error('Gemini blocked the question-generation prompt.');
        return NextResponse.json(
          { success: false, error: 'رفضت خدمة Gemini إنشاء السؤال. عدّل المهارة أو حاول مجددًا.' },
          { status: 502 }
        );
      }
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

    let generatedJson: unknown;
    try {
      generatedJson = JSON.parse(part.text);
    } catch {
      throw new Error('Gemini returned malformed JSON');
    }
    const generatedContent = generatedQuestionContentSchema.safeParse(generatedJson);
    if (
      !generatedContent.success ||
      (skill === 'READING' && !generatedContent.data.passage) ||
      (skill !== 'READING' && generatedContent.data.passage !== null)
    ) {
      console.error(
        'Gemini generated an invalid question:',
        generatedContent.success ? 'passage did not match the requested skill' : generatedContent.error.issues,
      );
      return NextResponse.json(
        {
          success: false,
          error: skill === 'READING'
            ? 'لم يُنشئ Gemini سؤال قراءة مطابقًا للمطلوب. أعد التوليد أو تحقق من إعداد المفتاح والحصة.'
            : 'لم يُنشئ Gemini سؤالًا مطابقًا للمطلوب. أعد التوليد أو تحقق من إعداد المفتاح والحصة.',
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      question: { skill, cefrLevel: level, ...generatedContent.data },
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