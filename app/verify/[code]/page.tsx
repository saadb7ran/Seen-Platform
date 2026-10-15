import { Suspense } from 'react';
import CertificateVerification from './certificate-verification';
import { prisma } from '@/lib/prisma';

interface VerifyPageProps {
  params: Promise<{ code: string }>;
}

async function CertificateData({ params }: VerifyPageProps) {
  const { code } = await params;
  const certificate = await prisma.certificate.findUnique({
    where: { verificationCode: code },
    select: {
      verificationCode: true,
      cefrLevel: true,
      overallScore: true,
      issuedAt: true,
      user: { select: { name: true } },
      session: { select: { status: true } },
    },
  });

  return (
    <CertificateVerification
      certificate={certificate?.session.status === 'COMPLETED'
        ? {
            verificationCode: certificate.verificationCode,
            cefrLevel: certificate.cefrLevel,
            overallScore: certificate.overallScore,
            issuedAt: certificate.issuedAt.toLocaleDateString('en-GB', { timeZone: 'UTC' }),
            user: certificate.user,
          }
        : null}
      requestedCode={code}
    />
  );
}

export default function VerifyPage({ params }: VerifyPageProps) {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center">
          <p className="text-center p-6" aria-live="polite">جارٍ التحقق من الشهادة...</p>
          <footer className="mt-auto w-full text-center py-4 border-t border-slate-900 text-xs text-slate-500">
            <p>جميع الحقوق محفوظة © 2026 - منصة سين لتحديد مستوى اللغة الإنجليزية (CEFR)</p>
            <p className="text-holst-sage font-semibold mt-1">تصميم وتطوير: الأستاذ سعد القرني</p>
          </footer>
        </main>
      }
    >
      <CertificateData params={params} />
    </Suspense>
  );
}
