import { z } from 'zod';

const emailSchema = z.string().trim().max(254).email();
const passwordSchema = z.string().min(12).max(128);

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(128),
});

export const registrationSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: emailSchema,
  password: passwordSchema,
});

export const adminUserSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: emailSchema,
  password: passwordSchema,
  role: z.enum(['STUDENT', 'EXAMINER']),
});

export const adminQuestionSchema = z.object({
  skill: z.enum(['READING', 'LISTENING', 'GRAMMAR', 'VOCABULARY']),
  level: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']),
  prompt: z.string().trim().min(1).max(4000),
  answer: z.string().trim().min(1).max(1000),
  options: z.array(z.string().trim().min(1).max(500)).min(2).max(8),
  passage: z.string().trim().max(6000).nullable().optional(),
}).superRefine((question, context) => {
  if (!question.options.includes(question.answer)) {
    context.addIssue({
      code: 'custom',
      path: ['answer'],
      message: 'The correct answer must match one of the options.',
    });
  }

  if (question.skill === 'READING' && !question.passage?.trim()) {
    context.addIssue({
      code: 'custom',
      path: ['passage'],
      message: 'Reading questions must include a passage.',
    });
  }

  if (question.skill !== 'READING' && question.passage?.trim()) {
    context.addIssue({
      code: 'custom',
      path: ['passage'],
      message: 'Only reading questions may include a passage.',
    });
  }
});

export const passwordResetSchema = z.string().min(12).max(128);

export const aiGenerationSchema = z.object({
  skill: z.enum(['READING', 'LISTENING', 'GRAMMAR', 'VOCABULARY']),
  level: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']),
});

export const generatedQuestionContentSchema = z.object({
  passage: z.string().trim().min(1).max(6000).nullable(),
  prompt: z.string().trim().min(1).max(4000),
  options: z.array(z.string().trim().min(1).max(500)).min(2).max(8),
  correctAnswer: z.string().trim().min(1).max(1000),
  explanation: z.string().trim().min(1).max(2000),
}).superRefine((question, context) => {
  if (!question.options.includes(question.correctAnswer)) {
    context.addIssue({
      code: 'custom',
      path: ['correctAnswer'],
      message: 'The correct answer must match one of the options.',
    });
  }
});
