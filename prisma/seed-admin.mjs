import { createHash } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function hashPassword(password) {
  const prehash = createHash('sha256').update(password, 'utf8').digest('hex');
  return `bcrypt-sha256$${await bcrypt.hash(prehash, 12)}`;
}

async function seed() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME?.trim();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Set ADMIN_EMAIL to a valid administrator email address.');
  }
  if (!password || password.length < 12 || password.length > 128) {
    throw new Error('Set ADMIN_PASSWORD to a password between 12 and 128 characters.');
  }
  if (!name || name.length < 2 || name.length > 120) {
    throw new Error('Set ADMIN_NAME to the administrator display name.');
  }

  const passwordHash = await hashPassword(password);
  await prisma.user.upsert({
    where: { email },
    create: { email, name, passwordHash, role: 'ADMIN' },
    update: {
      name,
      passwordHash,
      role: 'ADMIN',
      sessionVersion: { increment: 1 },
    },
  });

  await prisma.exam.upsert({
    where: { id: 'sample' },
    create: {
      id: 'sample',
      title: 'اختبار تحديد المستوى التجريبي',
      description: 'اختبار تجريبي للقراءة والاستماع والقواعد.',
      durationMin: 45,
      isPublished: true,
    },
    update: {},
  });

  const sampleQuestions = [
    {
      id: 'sample-reading',
      skill: 'READING',
      cefrLevel: 'B2',
      prompt: 'What is the primary focus of the passage?',
      passageText:
        'Renewable energy sources such as solar and wind power are becoming increasingly vital for global sustainability.',
      options: [
        'The high cost of fossil fuels',
        'The importance of renewable energy and sustainability',
        'How solar panels are manufactured',
        'The history of global governments',
      ],
      correctAnswer: 'The importance of renewable energy and sustainability',
      order: 1,
    },
    {
      id: 'sample-listening',
      skill: 'LISTENING',
      cefrLevel: 'C1',
      prompt: 'What does the speaker suggest doing?',
      options: [
        'Postponing the meeting until next week',
        'Submitting the report before Friday morning',
        'Canceling the project entirely',
        'Calling the technical support team',
      ],
      correctAnswer: 'Submitting the report before Friday morning',
      order: 2,
    },
    {
      id: 'sample-grammar',
      skill: 'GRAMMAR',
      cefrLevel: 'B1',
      prompt:
        "Choose the correct grammatical form: 'If I _____ about the traffic, I would have taken a different route.'",
      options: ['know', 'had known', 'have known', 'knowing'],
      correctAnswer: 'had known',
      order: 3,
    },
  ];

  for (const { order, ...question } of sampleQuestions) {
    await prisma.questionBank.upsert({
      where: { id: question.id },
      create: { ...question, options: question.options },
      update: {},
    });

    const existingLink = await prisma.testQuestion.findFirst({
      where: { examId: 'sample', questionId: question.id },
    });
    if (!existingLink) {
      await prisma.testQuestion.create({
        data: { examId: 'sample', questionId: question.id, order },
      });
    }
  }
}

seed()
  .catch((error) => {
    console.error('Admin/sample seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
