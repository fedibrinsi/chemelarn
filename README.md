# ChemLearn Exam Lab

ChemLearn Exam Lab is a production-oriented Next.js application for online exams and learning support aimed at students aged 12 to 16. It includes two roles only:

- `ADMIN` for exam management, analytics, learning content, and chat support
- `PARTICIPANT` for secure login, exam access by code, timed sessions, results, learning summaries, and help chat

## Stack

- Next.js 16 with App Router
- Prisma ORM with PostgreSQL on Neon
- NextAuth credentials authentication with JWT sessions
- Tailwind CSS v4
- Server Actions and Route Handlers
- Vercel-ready deployment model

## Core Features

- Secure login with RBAC and middleware-protected admin/participant areas
- Admin exam builder with mixed question types
- Unique exam sessions per participant with access code redemption
- Autosave and timer-aware exam runner
- Automatic grading for objective question types
- Manual review path for short-answer questions
- Participant result pages with score and correction summary
- Learning summaries with text and video links
- Admin-participant chat using lightweight polling for simple scalable deployment on Vercel
- Audit log entries for important admin actions

## Project Structure

```text
src/
  app/
    (auth)/login
    admin/
      chat
      exams
      learning
      participants
      settings
    participant/
      chat
      enter-code
      learning
      results
      sessions
      tutorial
    api/
      auth/[...nextauth]
      chat/[conversationId]/messages
      sessions/[sessionId]/{autosave,submit}
  components/
    auth
    chat
    exam
    forms
    layout
    shared
    ui
  lib/
    actions
    auth
    data
    constants.ts
    db.ts
    exam.ts
    utils.ts
    validations.ts
  types/
prisma/
  schema.prisma
  seed.mjs
middleware.ts
```

## Database Models

The Prisma schema includes:

- `User`
- `ParticipantProfile`
- `Exam`
- `ExamSection`
- `Question`
- `ChoiceOption`
- `MatchingPair`
- `ExamAccessCode`
- `ExamSession`
- `Submission`
- `SubmissionAnswer`
- `LearningSummary`
- `ChatConversation`
- `ChatMessage`
- `AuditLog`

Enums cover:

- `Role`
- `QuestionType`
- `ExamStatus`
- `SessionStatus`
- `SubmissionStatus`
- `SenderRole`

## Environment Variables

Copy `.env.example` to `.env` and fill in real values:

```bash
cp .env.example .env
```

Required variables:

- `DATABASE_URL`: Neon PostgreSQL connection string
- `NEXTAUTH_URL`: local URL in development, production URL on Vercel
- `NEXTAUTH_SECRET`: random secret for session signing

Generate a strong secret with:

```bash
openssl rand -base64 32
```

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Generate Prisma client:

```bash
npm run prisma:generate
```

3. Run migrations:

```bash
npm run prisma:migrate
```

4. Seed sample data:

```bash
npm run prisma:seed
```

5. Start the app:

```bash
npm run dev
```

The local dev server runs on `http://localhost:5555`.

## Demo Seed Accounts

- Admin: `admin@chemlearn.test` / `Admin123!`
- Participant: `student1@chemlearn.test` / `Student123!`
- Participant: `student2@chemlearn.test` / `Student123!`
- Sample exam code: `CHEM-DEMO-2026`

## Deployment on Vercel with Neon

1. Create a Neon project and copy the pooled `DATABASE_URL`.
2. Push this repository to GitHub.
3. Import the project into Vercel.
4. Add environment variables in Vercel:
   - `DATABASE_URL`
   - `NEXTAUTH_URL`
   - `NEXTAUTH_SECRET`
5. Configure the build command if needed:

```bash
npm run prisma:generate && next build
```

6. Run migrations against the production Neon database before first launch:

```bash
npx prisma migrate deploy
```

## Notes on Architecture

- Authentication uses NextAuth credentials backed by Prisma user records.
- Authorization is enforced in both middleware and server-side helpers.
- Exam sessions store an `examSnapshot` so grading and review preserve the version seen by the participant.
- Chat uses polling through route handlers to avoid extra infrastructure while remaining deployable on Vercel.
- Autosave and chat endpoints include lightweight in-memory rate limiting suitable for a single deployment instance. For larger scale, move this to Redis or Upstash.

## Suggested Next Improvements

- Add richer ordering and matching drag-and-drop UIs
- Add CSV import/export for participants
- Add stronger distributed rate limiting with Upstash Redis
- Add file uploads for learning materials through Vercel Blob or S3
