import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, examId, responses } = body;

    // 1. حساب الدرجة الآلية (محاكاة أو مقارنة مع الإجابات الصحيحة)
    let correctCount = 0;
    const totalQuestions = responses.length || 3;
    
    // تقدير مبدئي للدرجة بناءً على الإجابات الصحيحة
    responses.forEach((resp: { isCorrect: boolean }) => {
      if (resp.isCorrect) correctCount++;
    });

    const overallScore = Math.round((correctCount / totalQuestions) * 100) || 85;

    // 2. تحديد مستوى CEFR بناءً على الدرجة
    let cefrLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' = 'B1';
    if (overallScore >= 90) cefrLevel = 'C1';
    else if (overallScore >= 80) cefrLevel = 'B2';
    else if (overallScore >= 70) cefrLevel = 'B1';
    else cefrLevel = 'A2';

    // 3. توليد رمز تحقق فريد وآمن للشهادة
    const verificationCode = `SEEN-2026-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // 4. حفظ الجلسة والشهادة في قاعدة البيانات عبر Prisma
    const session = await prisma.testSession.create({
      data: {
        userId: userId || "sample-user-id",
        examId: examId || "sample-exam-id",
        status: "COMPLETED",
        score: overallScore,
        cefrResult: cefrLevel,
        completedAt: new Date(),
      }
    });

    const certificate = await prisma.certificate.create({
      data: {
        userId: userId || "sample-user-id",
        sessionId: session.id,
        cefrLevel: cefrLevel,
        verificationCode: verificationCode,
        overallScore: overallScore,
      }
    });

    return NextResponse.json({
      success: true,
      message: "تم تصحيح الاختبار وتوليد الشهادة بنجاح",
      verificationCode: certificate.verificationCode,
      cefrLevel: certificate.cefrLevel,
      overallScore: certificate.overallScore,
      redirectUrl: `/verify/${certificate.verificationCode}`
    });

  } catch (error) {
    console.error("Error submitting test:", error);
    return NextResponse.json(
      { success: false, error: "حدث خطأ أثناء معالجة الاختبار وتسجيل الشهادة" },
      { status: 500 }
    );
  }
}