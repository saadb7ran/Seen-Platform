-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('STUDENT', 'TEACHER', 'ADMIN');

-- CreateEnum
CREATE TYPE "CefrLevel" AS ENUM ('A1', 'A2', 'B1', 'B2');

-- CreateEnum
CREATE TYPE "SkillType" AS ENUM ('LISTENING', 'SPEAKING', 'READING', 'WRITING');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('MCQ', 'AUDIO_PROMPT', 'ESSAY', 'READING_PASSAGE');

-- CreateEnum
CREATE TYPE "TestStatus" AS ENUM ('DRAFT', 'ACTIVE', 'COMPLETED');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('IN_PROGRESS', 'SUBMITTED', 'GRADED');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "username" VARCHAR(100) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "full_name" VARCHAR(255) NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'STUDENT',
    "grade_level" INTEGER,
    "school_id" VARCHAR(64),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_bank" (
    "id" UUID NOT NULL,
    "skill" "SkillType" NOT NULL,
    "question_type" "QuestionType" NOT NULL,
    "content_text" TEXT NOT NULL,
    "media_url" VARCHAR(512),
    "options_json" JSONB,
    "correct_answer" VARCHAR(255),
    "difficulty_level" "CefrLevel" NOT NULL,
    "points" DECIMAL(5,2) NOT NULL DEFAULT 1.0,
    "rubric_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "question_bank_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tests" (
    "id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "created_by" UUID NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "duration_minutes" INTEGER NOT NULL,
    "access_code" VARCHAR(50) NOT NULL,
    "qr_code_url" VARCHAR(512),
    "is_randomized" BOOLEAN NOT NULL DEFAULT true,
    "status" "TestStatus" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test_questions" (
    "id" UUID NOT NULL,
    "test_id" UUID NOT NULL,
    "question_id" UUID NOT NULL,
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "weight" DECIMAL(5,2) NOT NULL DEFAULT 1.0,

    CONSTRAINT "test_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_test_sessions" (
    "id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "test_id" UUID NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "status" "SessionStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "question_order" JSONB,
    "total_score" DECIMAL(5,2),
    "cefr_level" "CefrLevel",
    "listening_score" DECIMAL(5,2),
    "speaking_score" DECIMAL(5,2),
    "reading_score" DECIMAL(5,2),
    "writing_score" DECIMAL(5,2),
    "ai_summary_notes" TEXT,
    "certificate_id" VARCHAR(64),

    CONSTRAINT "student_test_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_answers" (
    "id" UUID NOT NULL,
    "session_id" UUID NOT NULL,
    "question_id" UUID NOT NULL,
    "selected_option" VARCHAR(255),
    "text_answer" TEXT,
    "audio_recording_url" VARCHAR(512),
    "audio_transcript" TEXT,
    "is_correct" BOOLEAN,
    "score" DECIMAL(5,2) NOT NULL DEFAULT 0.0,
    "ai_grading_metadata" JSONB,
    "feedback" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_answers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_school_id_idx" ON "users"("school_id");

-- CreateIndex
CREATE INDEX "question_bank_skill_difficulty_level_idx" ON "question_bank"("skill", "difficulty_level");

-- CreateIndex
CREATE UNIQUE INDEX "tests_access_code_key" ON "tests"("access_code");

-- CreateIndex
CREATE INDEX "tests_created_by_idx" ON "tests"("created_by");

-- CreateIndex
CREATE INDEX "tests_access_code_idx" ON "tests"("access_code");

-- CreateIndex
CREATE INDEX "tests_status_idx" ON "tests"("status");

-- CreateIndex
CREATE INDEX "test_questions_test_id_idx" ON "test_questions"("test_id");

-- CreateIndex
CREATE INDEX "test_questions_question_id_idx" ON "test_questions"("question_id");

-- CreateIndex
CREATE UNIQUE INDEX "test_questions_test_id_question_id_key" ON "test_questions"("test_id", "question_id");

-- CreateIndex
CREATE UNIQUE INDEX "student_test_sessions_certificate_id_key" ON "student_test_sessions"("certificate_id");

-- CreateIndex
CREATE INDEX "student_test_sessions_student_id_idx" ON "student_test_sessions"("student_id");

-- CreateIndex
CREATE INDEX "student_test_sessions_test_id_idx" ON "student_test_sessions"("test_id");

-- CreateIndex
CREATE INDEX "student_test_sessions_status_idx" ON "student_test_sessions"("status");

-- CreateIndex
CREATE INDEX "student_test_sessions_cefr_level_idx" ON "student_test_sessions"("cefr_level");

-- CreateIndex
CREATE INDEX "student_answers_session_id_idx" ON "student_answers"("session_id");

-- CreateIndex
CREATE INDEX "student_answers_question_id_idx" ON "student_answers"("question_id");

-- CreateIndex
CREATE UNIQUE INDEX "student_answers_session_id_question_id_key" ON "student_answers"("session_id", "question_id");

-- AddForeignKey
ALTER TABLE "tests" ADD CONSTRAINT "tests_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_questions" ADD CONSTRAINT "test_questions_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "tests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_questions" ADD CONSTRAINT "test_questions_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "question_bank"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_test_sessions" ADD CONSTRAINT "student_test_sessions_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_test_sessions" ADD CONSTRAINT "student_test_sessions_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "tests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_answers" ADD CONSTRAINT "student_answers_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "student_test_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_answers" ADD CONSTRAINT "student_answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "question_bank"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
