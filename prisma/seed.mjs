import bcrypt from "bcryptjs";
import { PrismaClient, Role, ExamStatus, QuestionType, SenderRole, SessionStatus, SubmissionStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.chatMessage.deleteMany();
  await prisma.chatConversation.deleteMany();
  await prisma.submissionAnswer.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.examSession.deleteMany();
  await prisma.examAccessCode.deleteMany();
  await prisma.matchingPair.deleteMany();
  await prisma.choiceOption.deleteMany();
  await prisma.question.deleteMany();
  await prisma.examSection.deleteMany();
  await prisma.learningSummary.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.exam.deleteMany();
  await prisma.participantProfile.deleteMany();
  await prisma.user.deleteMany();

  const adminPassword = await bcrypt.hash("Admin123!", 10);
  const studentPassword = await bcrypt.hash("Student123!", 10);

  const admin = await prisma.user.create({
    data: {
      name: "Dr. Salma Ben Ali",
      email: "admin@chemlearn.test",
      passwordHash: adminPassword,
      role: Role.ADMIN,
    },
  });

  const participantOne = await prisma.user.create({
    data: {
      name: "Lina Haddad",
      email: "student1@chemlearn.test",
      passwordHash: studentPassword,
      role: Role.PARTICIPANT,
      participantProfile: {
        create: {
          gradeLevel: "8th Grade",
          schoolName: "Future Science School",
          studentNumber: "CH-001",
        },
      },
    },
    include: { participantProfile: true },
  });

  const participantTwo = await prisma.user.create({
    data: {
      name: "Youssef Trabelsi",
      email: "student2@chemlearn.test",
      passwordHash: studentPassword,
      role: Role.PARTICIPANT,
      participantProfile: {
        create: {
          gradeLevel: "10th Grade",
          schoolName: "Future Science School",
          studentNumber: "CH-002",
        },
      },
    },
    include: { participantProfile: true },
  });

  const exam = await prisma.exam.create({
    data: {
      title: "Chemical Reactions and Matter",
      description: "Mixed-format chemistry exam for middle and high school learners.",
      status: ExamStatus.PUBLISHED,
      durationMinutes: 50,
      instructions: "Read carefully, save often, and explain your thinking when needed.",
      allowResultReview: true,
      allowPastSubmissions: true,
      createdById: admin.id,
      sections: {
        create: [
          {
            title: "Core knowledge",
            description: "Multiple formats on reaction signs and particle behavior.",
            position: 0,
            questions: {
              create: [
                {
                  type: QuestionType.MULTIPLE_CHOICE,
                  prompt: "Which sign usually shows that a chemical reaction happened?",
                  points: 2,
                  position: 0,
                  answerKey: ["gas"],
                  choiceOptions: {
                    create: [
                      { label: "The shape of the beaker changes", value: "beaker", isCorrect: false, position: 0 },
                      { label: "A gas forms", value: "gas", isCorrect: true, position: 1 },
                      { label: "The ruler gets longer", value: "ruler", isCorrect: false, position: 2 },
                    ],
                  },
                },
                {
                  type: QuestionType.TRUE_FALSE,
                  prompt: "Atoms are destroyed during an ordinary chemical reaction.",
                  points: 1,
                  position: 1,
                  answerKey: false,
                },
                {
                  type: QuestionType.FILL_BLANK,
                  prompt: "The smallest unit of an element is an [[blank]].",
                  points: 1,
                  position: 2,
                  answerKey: ["atom"],
                  choiceOptions: {
                    create: [
                      { label: "atom", value: "atom", isCorrect: true, position: 0 },
                      { label: "molecule", value: "molecule", isCorrect: false, position: 1 },
                      { label: "reaction", value: "reaction", isCorrect: false, position: 2 },
                    ],
                  },
                },
              ],
            },
          },
          {
            title: "Reasoning and structure",
            description: "Ordering, matching, and short response work.",
            position: 1,
            questions: {
              create: [
                {
                  type: QuestionType.ORDERING,
                  prompt: "Put these stages in the correct lab workflow order.",
                  points: 2,
                  position: 0,
                  answerKey: ["observe", "hypothesis", "experiment", "conclusion"],
                  choiceOptions: {
                    create: [
                      { label: "Observe", value: "observe", position: 0 },
                      { label: "Hypothesis", value: "hypothesis", position: 1 },
                      { label: "Experiment", value: "experiment", position: 2 },
                      { label: "Conclusion", value: "conclusion", position: 3 },
                    ],
                  },
                },
                {
                  type: QuestionType.MATCHING,
                  prompt: "Match each term to the correct idea.",
                  points: 2,
                  position: 1,
                  answerKey: ["pH->acidity", "catalyst->speeds reaction"],
                  matchingPairs: {
                    create: [
                      {
                        leftLabel: "pH",
                        rightLabel: "acidity",
                        correctMatch: "pH->acidity",
                        position: 0,
                      },
                      {
                        leftLabel: "catalyst",
                        rightLabel: "speeds reaction",
                        correctMatch: "catalyst->speeds reaction",
                        position: 1,
                      },
                    ],
                  },
                },
                {
                  type: QuestionType.SHORT_ANSWER,
                  prompt: "Explain why increasing temperature can speed up a reaction.",
                  explanation: "Mention particle movement and collision frequency.",
                  points: 3,
                  position: 2,
                },
              ],
            },
          },
        ],
      },
    },
    include: {
      sections: {
        include: {
          questions: {
            include: { choiceOptions: true, matchingPairs: true },
            orderBy: { position: "asc" },
          },
        },
        orderBy: { position: "asc" },
      },
    },
  });

  const accessCode = await prisma.examAccessCode.create({
    data: {
      examId: exam.id,
      code: "CHEM-DEMO-2026",
      generatedById: admin.id,
      isActive: true,
    },
  });

  await prisma.learningSummary.createMany({
    data: [
      {
        title: "Reaction Rates Recap",
        content: "Reaction rates increase when particles collide more often and with enough energy.",
        videoUrl: "https://www.youtube.com/watch?v=7iQ5fd0H9n0",
        examId: exam.id,
      },
      {
        title: "Conservation of Matter",
        content: "Atoms rearrange during reactions, but the total amount of matter stays the same.",
      },
    ],
  });

  const conversation = await prisma.chatConversation.create({
    data: {
      participantId: participantOne.participantProfile.id,
      messages: {
        create: [
          {
            senderId: participantOne.id,
            senderRole: SenderRole.PARTICIPANT,
            body: "Hi, if the timer ends, will my answers still be submitted?",
          },
          {
            senderId: admin.id,
            senderRole: SenderRole.ADMIN,
            body: "Yes, the platform auto-submits the latest saved answers when time runs out.",
          },
        ],
      },
    },
  });

  await prisma.chatConversation.create({
    data: {
      participantId: participantTwo.participantProfile.id,
    },
  });

  const snapshot = {
    id: exam.id,
    title: exam.title,
    description: exam.description,
    instructions: exam.instructions,
    durationMinutes: exam.durationMinutes,
    allowResultReview: true,
    sections: exam.sections.map((section) => ({
      id: section.id,
      title: section.title,
      questions: section.questions.map((question) => ({
        id: question.id,
        type: question.type,
        prompt: question.prompt,
        explanation: question.explanation,
        points: question.points,
        isCaseSensitive: question.isCaseSensitive,
        answerKey: question.answerKey,
        options: question.choiceOptions,
        matchingPairs: question.matchingPairs,
      })),
    })),
  };

  const sampleSession = await prisma.examSession.create({
    data: {
      participantId: participantOne.participantProfile.id,
      examId: exam.id,
      accessCodeId: accessCode.id,
      status: SessionStatus.SUBMITTED,
      startedAt: new Date(Date.now() - 45 * 60_000),
      submittedAt: new Date(Date.now() - 20 * 60_000),
      expiresAt: new Date(Date.now() - 10 * 60_000),
      examSnapshot: snapshot,
      draftAnswers: {
        [exam.sections[0].questions[0].id]: "gas",
        [exam.sections[0].questions[1].id]: false,
        [exam.sections[0].questions[2].id]: "atom",
      },
    },
  });

  const submission = await prisma.submission.create({
    data: {
      sessionId: sampleSession.id,
      participantId: participantOne.participantProfile.id,
      status: SubmissionStatus.NEEDS_REVIEW,
      score: 4,
      maxScore: 11,
      percentage: 36,
      autoGradedAt: new Date(Date.now() - 19 * 60_000),
      submittedAt: new Date(Date.now() - 20 * 60_000),
      correctionsVisible: true,
      sectionBreakdown: [
        { sectionId: exam.sections[0].id, title: exam.sections[0].title, score: 4, maxScore: 4 },
        { sectionId: exam.sections[1].id, title: exam.sections[1].title, score: 0, maxScore: 7 },
      ],
    },
  });

  await prisma.submissionAnswer.createMany({
    data: [
      {
        submissionId: submission.id,
        questionId: exam.sections[0].questions[0].id,
        response: "gas",
        autoScore: 2,
        finalScore: 2,
        maxScore: 2,
        isCorrect: true,
        feedback: "Correct choice.",
      },
      {
        submissionId: submission.id,
        questionId: exam.sections[0].questions[1].id,
        response: false,
        autoScore: 1,
        finalScore: 1,
        maxScore: 1,
        isCorrect: true,
        feedback: "Correct.",
      },
      {
        submissionId: submission.id,
        questionId: exam.sections[0].questions[2].id,
        response: "atom",
        autoScore: 1,
        finalScore: 1,
        maxScore: 1,
        isCorrect: true,
        feedback: "Exact answer matched.",
      },
      {
        submissionId: submission.id,
        questionId: exam.sections[1].questions[2].id,
        response: "Particles move faster and collide more.",
        autoScore: 0,
        finalScore: 0,
        maxScore: 3,
        requiresManualReview: true,
        feedback: "Awaiting teacher review.",
      },
    ],
  });

  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: "seed.created",
      entityType: "Workspace",
      entityId: conversation.id,
      metadata: { createdExamId: exam.id, createdConversationId: conversation.id },
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
