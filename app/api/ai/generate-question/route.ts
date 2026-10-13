import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { skill, level } = await request.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'مفتاح API الخاص بالذكاء الاصطناعي غير معرف' },
        { status: 500 }
      );
    }

    // صياغة الـ Prompt الهندسي لتوليد سؤال لغوي دقيق بصيغة JSON
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
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' }
        })
      }
    );

    const data = await response.json();
    const generatedContent = JSON.parse(data.candidates[0].content.parts[0].text);

    return NextResponse.json({
      success: true,
      question: generatedContent
    });
  } catch (error) {
    console.error('Error generating AI question:', error);
    return NextResponse.json(
      { success: false, error: 'فشل في توليد السؤال عبر الذكاء الاصطناعي' },
      { status: 500 }
    );
  }
}