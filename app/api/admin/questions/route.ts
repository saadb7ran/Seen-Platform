import { CefrLevel, Prisma, QuestionType, SkillType, UserRole } from "@prisma/client";
import { getCurrentUser, hasRole } from "@/lib/auth";
import { jsonError, readJson } from "@/lib/http";
import { prisma } from "@/lib/prisma";

type QuestionInput = {
  skill?: SkillType;
  questionType?: QuestionType;
  contentText?: string;
  mediaUrl?: string;
  optionsJson?: unknown;
  correctAnswer?: string;
  difficultyLevel?: CefrLevel;
  points?: number;
  rubricJson?: unknown;
};

function isQuestionInput(input: QuestionInput): input is QuestionInput & Required<Pick<QuestionInput, "skill" | "questionType" | "contentText" | "difficultyLevel">> {
  return Object.values(SkillType).includes(input.skill as SkillType) &&
    Object.values(QuestionType).includes(input.questionType as QuestionType) &&
    Object.values(CefrLevel).includes(input.difficultyLevel as CefrLevel) &&
    typeof input.contentText === "string" &&
    input.contentText.trim().length > 0 &&
    input.contentText.length <= 10000 &&
    (input.points === undefined || (Number.isFinite(input.points) && input.points > 0 && input.points <= 100));
}

export async function GET() {
  const user = await getCurrentUser();
  if (!hasRole(user, UserRole.ADMIN, UserRole.TEACHER)) return jsonError("غير مصرح.", 403);
  const questions = await prisma.questionBank.findMany({ orderBy: { createdAt: "desc" } });
  return Response.json({ questions });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!hasRole(user, UserRole.ADMIN, UserRole.TEACHER)) return jsonError("غير مصرح.", 403);
  let body: QuestionInput;
  try {
    body = await readJson<QuestionInput>(request);
  } catch {
    return jsonError("بيانات السؤال غير صالحة.");
  }
  if (!isQuestionInput(body)) return jsonError("يرجى تعبئة بيانات السؤال بقيم صحيحة.");
  if (body.mediaUrl && (body.mediaUrl.length > 512 || !/^https:\/\//i.test(body.mediaUrl))) {
    return jsonError("رابط الوسائط يجب أن يكون HTTPS وبحد أقصى 512 حرفًا.");
  }
  if (body.questionType === QuestionType.MCQ && (
    !Array.isArray(body.optionsJson) ||
    body.optionsJson.length < 2 ||
    !body.optionsJson.every((option) => typeof option === "string") ||
    new Set(body.optionsJson).size !== body.optionsJson.length ||
    !body.correctAnswer ||
    !body.optionsJson.includes(body.correctAnswer)
  )) {
    return jsonError("أسئلة الاختيار من متعدد تتطلب خيارات وإجابة صحيحة.");
  }
  const question = await prisma.questionBank.create({
    data: {
      skill: body.skill,
      questionType: body.questionType,
      contentText: body.contentText.trim(),
      mediaUrl: body.mediaUrl?.trim() || null,
      optionsJson: body.optionsJson as Prisma.InputJsonValue | undefined,
      correctAnswer: body.correctAnswer || null,
      difficultyLevel: body.difficultyLevel,
      points: body.points ?? 1,
      rubricJson: body.rubricJson as Prisma.InputJsonValue | undefined,
    },
  });
  return Response.json({ question }, { status: 201 });
}
