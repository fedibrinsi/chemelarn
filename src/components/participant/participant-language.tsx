"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type ParticipantLocale = "en" | "fr" | "ar";

type TranslationDictionary = {
  shellTitle: string;
  shellSubtitle: string;
  navDashboard: string;
  navEnterCode: string;
  signOut: string;
  language: string;
  dashboardTitle: (name: string) => string;
  dashboardDescription: string;
  enterExamCode: string;
  recentSessions: string;
  enterCodeTitle: string;
  enterCodeDescription: string;
  examAccessCode: string;
  examAccessCodePlaceholder: string;
  validating: string;
  openExamSession: string;
  resultsTitle: string;
  resultsDescription: string;
  examOverMessage: string;
  scoreLabel: string;
  noFeedback: string;
  notSubmitted: string;
  examInstructions: string;
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
    shellSubtitle: "Join exams, track recent sessions, and review results.",
    navDashboard: "Dashboard",
    navEnterCode: "Enter Code",
    signOut: "Sign out",
    language: "Language",
    dashboardTitle: (name) => `Welcome back, ${name}`,
    dashboardDescription: "Start an exam with a code or continue a recent session.",
    enterExamCode: "Enter exam code",
    recentSessions: "Recent sessions",
    enterCodeTitle: "Enter exam code",
    enterCodeDescription:
      "Use the access code your teacher generated to open a secure exam session tied to your account.",
    examAccessCode: "Exam access code",
    examAccessCodePlaceholder: "CHEM-AB12-CD34",
    validating: "Validating...",
    openExamSession: "Open exam session",
    resultsTitle: "Results",
    resultsDescription:
      "Review your score, correction summary, and any answers that still need teacher feedback.",
    examOverMessage: "This exam is over. Your answers were saved and submitted.",
    scoreLabel: "Score",
    noFeedback: "No feedback yet",
    notSubmitted: "Your exam has not been submitted yet.",
    examInstructions: "Read each question carefully and save your work as you go.",
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
    shellSubtitle: "Rejoignez les examens, suivez vos sessions récentes et consultez vos résultats.",
    navDashboard: "Tableau de bord",
    navEnterCode: "Entrer le code",
    signOut: "Se déconnecter",
    language: "Langue",
    dashboardTitle: (name) => `Bon retour, ${name}`,
    dashboardDescription: "Commencez un examen avec un code ou reprenez une session récente.",
    enterExamCode: "Entrer le code d'examen",
    recentSessions: "Sessions récentes",
    enterCodeTitle: "Entrer le code d'examen",
    enterCodeDescription:
      "Utilisez le code fourni par votre enseignant pour ouvrir une session sécurisée liée à votre compte.",
    examAccessCode: "Code d'accès à l'examen",
    examAccessCodePlaceholder: "CHEM-AB12-CD34",
    validating: "Validation...",
    openExamSession: "Ouvrir la session",
    resultsTitle: "Résultats",
    resultsDescription:
      "Consultez votre score, le résumé de correction et les réponses qui attendent encore un retour.",
    examOverMessage: "Cet examen est terminé. Vos réponses ont été enregistrées et soumises.",
    scoreLabel: "Score",
    noFeedback: "Pas encore de commentaire",
    notSubmitted: "Votre examen n'a pas encore été soumis.",
    examInstructions: "Lisez attentivement chaque question et sauvegardez votre travail.",
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
    shellSubtitle: "ادخل الامتحانات، تابع الجلسات الأخيرة، وراجع النتائج.",
    navDashboard: "لوحة التحكم",
    navEnterCode: "إدخال الرمز",
    signOut: "تسجيل الخروج",
    language: "اللغة",
    dashboardTitle: (name) => `مرحباً من جديد، ${name}`,
    dashboardDescription: "ابدأ امتحاناً باستخدام رمز أو أكمل جلسة حديثة.",
    enterExamCode: "أدخل رمز الامتحان",
    recentSessions: "الجلسات الأخيرة",
    enterCodeTitle: "أدخل رمز الامتحان",
    enterCodeDescription: "استخدم الرمز الذي أنشأه المشرف لفتح جلسة امتحان خاصة بحسابك.",
    examAccessCode: "رمز الدخول للامتحان",
    examAccessCodePlaceholder: "CHEM-AB12-CD34",
    validating: "جارٍ التحقق...",
    openExamSession: "فتح جلسة الامتحان",
    resultsTitle: "النتائج",
    resultsDescription: "راجع درجتك وملخص التصحيح وأي إجابات ما زالت تنتظر مراجعة المعلم.",
    examOverMessage: "انتهى هذا الامتحان. تم حفظ إجاباتك وإرسالها.",
    scoreLabel: "الدرجة",
    noFeedback: "لا توجد ملاحظات بعد",
    notSubmitted: "لم يتم إرسال امتحانك بعد.",
    examInstructions: "اقرأ كل سؤال جيداً واحفظ عملك أولاً بأول.",
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
  const [locale, setLocale] = useState<ParticipantLocale>("en");

  useEffect(() => {
    const stored = window.localStorage.getItem("participant-locale") as ParticipantLocale | null;
    if (stored && stored in translations) {
      setLocale(stored);
    }
  }, []);

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
