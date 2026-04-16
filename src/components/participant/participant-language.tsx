"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type ParticipantLocale = "en" | "fr" | "ar";

type TranslationDictionary = {
  shellTitle: string;
  shellSubtitle: string;
  navDashboard: string;
  navTutorial: string;
  navEnterCode: string;
  navLearning: string;
  navChat: string;
  signOut: string;
  language: string;
  dashboardTitle: (name: string) => string;
  dashboardDescription: string;
  enterExamCode: string;
  recentSessions: string;
  learningPicks: string;
  includesVideo: string;
  textSummary: string;
  tutorialTitle: string;
  tutorialDescription: string;
  tutorialCaption: string;
  enterCodeTitle: string;
  enterCodeDescription: string;
  examAccessCode: string;
  examAccessCodePlaceholder: string;
  validating: string;
  openExamSession: string;
  learningTitle: string;
  learningDescription: string;
  generalLearningSummary: string;
  chatTitle: string;
  chatDescription: string;
  chatPanelTitle: string;
  chatHint: string;
  chatPlaceholder: string;
  sending: string;
  sendMessage: string;
  resultsTitle: string;
  resultsDescription: string;
  scoreLabel: string;
  noFeedback: string;
  notSubmitted: string;
  examInstructions: string;
  timeLeft: string;
  submitExam: string;
  submitting: string;
  wordBank: string;
  chooseCorrectMatch: string;
  resetMatches: string;
  connectTerms: string;
  buildSequence: string;
  availableBlocks: string;
  sequenceHint: string;
};

const translations: Record<ParticipantLocale, TranslationDictionary> = {
  en: {
    shellTitle: "Participant Learning Lab",
    shellSubtitle: "Join exams, learn from summaries, and ask for help when you need it.",
    navDashboard: "Dashboard",
    navTutorial: "Tutorial",
    navEnterCode: "Enter Code",
    navLearning: "Learning",
    navChat: "Help Chat",
    signOut: "Sign out",
    language: "Language",
    dashboardTitle: (name) => `Welcome back, ${name}`,
    dashboardDescription:
      "Start an exam with a code, review available learning summaries, or continue a recent session.",
    enterExamCode: "Enter exam code",
    recentSessions: "Recent sessions",
    learningPicks: "Learning picks",
    includesVideo: "Includes video",
    textSummary: "Text summary",
    tutorialTitle: "Tutorial",
    tutorialDescription:
      "A simple orientation space so participants know how to enter a code, save answers, and submit.",
    tutorialCaption:
      "Watch the demo, then head to the exam code page. Your answers save automatically while the timer runs.",
    enterCodeTitle: "Enter exam code",
    enterCodeDescription:
      "Use the access code your teacher generated to open a secure exam session tied to your account.",
    examAccessCode: "Exam access code",
    examAccessCodePlaceholder: "CHEM-AB12-CD34",
    validating: "Validating...",
    openExamSession: "Open exam session",
    learningTitle: "Summary of what you learned",
    learningDescription: "Review concise notes and linked videos published by the admin team.",
    generalLearningSummary: "General learning summary",
    chatTitle: "Help chat",
    chatDescription:
      "Ask for help if you are stuck, need clarification, or want support while using the platform.",
    chatPanelTitle: "Message the admin team",
    chatHint: "Lightweight near-realtime chat with automatic polling for Vercel-friendly deployment.",
    chatPlaceholder: "Type a question or reply...",
    sending: "Sending...",
    sendMessage: "Send message",
    resultsTitle: "Results",
    resultsDescription:
      "Review your score, correction summary, and any answers that still need teacher feedback.",
    scoreLabel: "Score",
    noFeedback: "No feedback yet",
    notSubmitted: "Your exam has not been submitted yet.",
    examInstructions: "Read each question carefully and save your work as you go.",
    timeLeft: "Time left",
    submitExam: "Submit exam",
    submitting: "Submitting...",
    wordBank: "Word bank",
    chooseCorrectMatch: "Choose the correct match",
    resetMatches: "Reset matches",
    connectTerms: "Connect each term to the correct meaning",
    buildSequence: "Build the correct sequence",
    availableBlocks: "Available blocks",
    sequenceHint: "Tap the blocks below in the correct order.",
  },
  fr: {
    shellTitle: "Laboratoire d'apprentissage",
    shellSubtitle: "Rejoignez les examens, apprenez avec les résumés et demandez de l'aide si besoin.",
    navDashboard: "Tableau de bord",
    navTutorial: "Tutoriel",
    navEnterCode: "Entrer le code",
    navLearning: "Apprentissage",
    navChat: "Aide / Chat",
    signOut: "Se déconnecter",
    language: "Langue",
    dashboardTitle: (name) => `Bon retour, ${name}`,
    dashboardDescription:
      "Commencez un examen avec un code, consultez les résumés disponibles ou reprenez une session récente.",
    enterExamCode: "Entrer le code d'examen",
    recentSessions: "Sessions récentes",
    learningPicks: "Sélections d'apprentissage",
    includesVideo: "Avec vidéo",
    textSummary: "Résumé texte",
    tutorialTitle: "Tutoriel",
    tutorialDescription:
      "Un espace simple pour comprendre comment entrer un code, sauvegarder les réponses et soumettre l'examen.",
    tutorialCaption:
      "Regardez la démo, puis allez à la page du code d'examen. Vos réponses sont sauvegardées automatiquement.",
    enterCodeTitle: "Entrer le code d'examen",
    enterCodeDescription:
      "Utilisez le code fourni par votre enseignant pour ouvrir une session sécurisée liée à votre compte.",
    examAccessCode: "Code d'accès à l'examen",
    examAccessCodePlaceholder: "CHEM-AB12-CD34",
    validating: "Validation...",
    openExamSession: "Ouvrir la session",
    learningTitle: "Résumé de ce que vous avez appris",
    learningDescription: "Consultez les notes et vidéos publiées par l'équipe pédagogique.",
    generalLearningSummary: "Résumé général",
    chatTitle: "Chat d'aide",
    chatDescription:
      "Demandez de l'aide si vous êtes bloqué, si vous avez besoin d'une clarification ou d'un accompagnement.",
    chatPanelTitle: "Envoyer un message à l'administration",
    chatHint: "Chat léger quasi temps réel avec actualisation automatique, pratique pour Vercel.",
    chatPlaceholder: "Écrivez une question ou une réponse...",
    sending: "Envoi...",
    sendMessage: "Envoyer",
    resultsTitle: "Résultats",
    resultsDescription:
      "Consultez votre score, le résumé de correction et les réponses qui attendent encore un retour.",
    scoreLabel: "Score",
    noFeedback: "Pas encore de commentaire",
    notSubmitted: "Votre examen n'a pas encore été soumis.",
    examInstructions: "Lisez attentivement chaque question et sauvegardez votre travail.",
    timeLeft: "Temps restant",
    submitExam: "Soumettre l'examen",
    submitting: "Envoi en cours...",
    wordBank: "Banque de mots",
    chooseCorrectMatch: "Choisissez la bonne correspondance",
    resetMatches: "Réinitialiser",
    connectTerms: "Reliez chaque terme à la bonne signification",
    buildSequence: "Construisez la bonne séquence",
    availableBlocks: "Blocs disponibles",
    sequenceHint: "Touchez les blocs ci-dessous dans le bon ordre.",
  },
  ar: {
    shellTitle: "مختبر تعلم المشارك",
    shellSubtitle: "ادخل الامتحانات، تعلّم من الملخصات، واطلب المساعدة عندما تحتاجها.",
    navDashboard: "لوحة التحكم",
    navTutorial: "فيديو الشرح",
    navEnterCode: "إدخال الرمز",
    navLearning: "التعلّم",
    navChat: "محادثة المساعدة",
    signOut: "تسجيل الخروج",
    language: "اللغة",
    dashboardTitle: (name) => `مرحباً من جديد، ${name}`,
    dashboardDescription:
      "ابدأ امتحاناً باستخدام رمز، راجع الملخصات التعليمية، أو أكمل جلسة حديثة.",
    enterExamCode: "أدخل رمز الامتحان",
    recentSessions: "الجلسات الأخيرة",
    learningPicks: "اقتراحات التعلّم",
    includesVideo: "يتضمن فيديو",
    textSummary: "ملخص نصي",
    tutorialTitle: "فيديو الشرح",
    tutorialDescription: "مساحة بسيطة لشرح كيفية إدخال الرمز، حفظ الإجابات، وإرسال الامتحان.",
    tutorialCaption: "شاهد الفيديو ثم انتقل إلى صفحة رمز الامتحان. يتم حفظ إجاباتك تلقائياً أثناء العد التنازلي.",
    enterCodeTitle: "أدخل رمز الامتحان",
    enterCodeDescription: "استخدم الرمز الذي أنشأه المشرف لفتح جلسة امتحان خاصة بحسابك.",
    examAccessCode: "رمز الدخول للامتحان",
    examAccessCodePlaceholder: "CHEM-AB12-CD34",
    validating: "جارٍ التحقق...",
    openExamSession: "فتح جلسة الامتحان",
    learningTitle: "ملخص ما تعلمته",
    learningDescription: "راجع الملاحظات المختصرة وروابط الفيديو التي نشرها المشرف.",
    generalLearningSummary: "ملخص عام",
    chatTitle: "محادثة المساعدة",
    chatDescription: "اطلب المساعدة إذا واجهت صعوبة أو احتجت توضيحاً أثناء استخدام المنصة.",
    chatPanelTitle: "راسل فريق الإدارة",
    chatHint: "محادثة خفيفة مع تحديث تلقائي ومتوافقة مع نشر Vercel.",
    chatPlaceholder: "اكتب سؤالك أو ردك...",
    sending: "جارٍ الإرسال...",
    sendMessage: "إرسال الرسالة",
    resultsTitle: "النتائج",
    resultsDescription: "راجع درجتك وملخص التصحيح وأي إجابات ما زالت تنتظر مراجعة المعلم.",
    scoreLabel: "الدرجة",
    noFeedback: "لا توجد ملاحظات بعد",
    notSubmitted: "لم يتم إرسال امتحانك بعد.",
    examInstructions: "اقرأ كل سؤال جيداً واحفظ عملك أولاً بأول.",
    timeLeft: "الوقت المتبقي",
    submitExam: "إرسال الامتحان",
    submitting: "جارٍ الإرسال...",
    wordBank: "بنك الكلمات",
    chooseCorrectMatch: "اختر المطابقة الصحيحة",
    resetMatches: "إعادة التعيين",
    connectTerms: "صِل كل مصطلح بالمعنى الصحيح",
    buildSequence: "كوّن الترتيب الصحيح",
    availableBlocks: "العناصر المتاحة",
    sequenceHint: "اضغط على العناصر بالترتيب الصحيح.",
  },
};

type ParticipantLanguageContextValue = {
  locale: ParticipantLocale;
  setLocale: (locale: ParticipantLocale) => void;
  dictionary: TranslationDictionary;
  dir: "ltr" | "rtl";
};

const ParticipantLanguageContext = createContext<ParticipantLanguageContextValue | null>(null);

export function ParticipantLanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<ParticipantLocale>(() => {
    if (typeof window === "undefined") return "en";
    const stored = window.localStorage.getItem("participant-locale") as ParticipantLocale | null;
    return stored && stored in translations ? stored : "en";
  });

  useEffect(() => {
    window.localStorage.setItem("participant-locale", locale);
  }, [locale]);

  const value = useMemo<ParticipantLanguageContextValue>(
    () => ({
      locale,
      setLocale: (nextLocale) => setLocale(nextLocale),
      dictionary: translations[locale],
      dir: locale === "ar" ? "rtl" : "ltr",
    }),
    [locale],
  );

  return (
    <ParticipantLanguageContext.Provider value={value}>
      <div dir={value.dir} className="min-h-full">
        {children}
      </div>
    </ParticipantLanguageContext.Provider>
  );
}

export function useParticipantLanguage() {
  const context = useContext(ParticipantLanguageContext);
  if (!context) {
    throw new Error("useParticipantLanguage must be used inside ParticipantLanguageProvider");
  }
  return context;
}
