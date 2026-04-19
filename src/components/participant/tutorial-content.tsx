"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { useParticipantLanguage, type ParticipantLocale } from "@/components/participant/participant-language";

type Option = { key: "A" | "B" | "C"; text: string };
type Question = {
  id: number;
  points: number;
  prompt: string;
  options: Option[];
  correct: Option["key"];
  justification: string;
};

type VisualLink = {
  id: string;
  label: string;
  valid: boolean;
};

type Copy = {
  headerTitle: string;
  headerDescription: string;
  target: string;
  duration: string;
  format: string;
  objective: string;
  openingTitle: string;
  openingScenario: string;
  openingKeyMessage: string;
  flashTitle: string;
  flashPrompt: string;
  flashCorrect: string;
  quizTitle: string;
  challenge1Title: string;
  challenge1Instruction: string;
  challenge2Title: string;
  challenge2Instruction: string;
  challenge2Question: string;
  summaryTitle: string;
  calculate: string;
  reset: string;
  pointsLabel: string;
  bonusLabel: string;
  tieBreakLabel: string;
  tieBreak1: string;
  tieBreak2: string;
  tieBreak3: string;
  shortJustificationPlaceholder: string;
  challenge2Options: Option[];
  qFlashOptions: Option[];
  infographicItems: string[];
  qcmLabel: string;
  challenge1ScoreLabel: string;
  challenge2ScoreLabel: string;
  totalScoreLabel: string;
};

const visuals = {
  opening: "/concours3/visual-opening.svg",
  interconnections: "/concours3/visual-interconnections.svg",
  diagnostic: "/concours3/visual-diagnostic.svg",
};

const localeCopy: Record<ParticipantLocale, Copy> = {
  fr: {
    headerTitle: "Concours 3: ODD pour débutants",
    headerDescription:
      "Parcours complet: animation visuelle, QCM d'analyse, mini cas systémique et défi final avec score automatique.",
    target: "Public visé: 16-20 ans",
    duration: "Durée conseillée: 2h",
    format: "Format: 10 min briefing, 15 min mission ODD, 55 min QCM, 20 min cas systémique, 20 min défi final",
    objective:
      "Objectif: raisonner en logique systémique, relier les ODD entre eux et passer de la connaissance à l'action.",
    openingTitle: "Animation d'ouverture: Un espace en transition",
    openingScenario:
      "Le scénario montre des problèmes interconnectés (déchets, énergie, eau, engagement) et des actions combinées avec des effets positifs multiples.",
    openingKeyMessage: "Message clé: une seule action peut toucher plusieurs ODD en même temps.",
    flashTitle: "Question flash",
    flashPrompt: "L'idée principale de l'animation est:",
    flashCorrect: "Réponse attendue: B",
    quizTitle: "QCM d'analyse (18 questions)",
    challenge1Title: "Défi visuel 1: Carte des interconnexions ODD",
    challenge1Instruction:
      "Reliez au moins 4 liens logiques parmi les ODD 3, 4, 6, 12, 13 et 17, puis justifiez brièvement chaque lien.",
    challenge2Title: "Défi visuel 2: Diagnostic d'un espace durable",
    challenge2Instruction: "Analysez les 4 données et choisissez le plan d'action le plus systémique.",
    challenge2Question: "Quel plan d'action répond au plus grand nombre d'ODD?",
    summaryTitle: "Résultat final",
    calculate: "Calculer le score",
    reset: "Réinitialiser",
    pointsLabel: "points",
    bonusLabel: "Bonus animation (+1)",
    tieBreakLabel: "Départage",
    tieBreak1: "score au défi systémique",
    tieBreak2: "nombre de réponses exactes sans erreur",
    tieBreak3: "temps total",
    shortJustificationPlaceholder: "Justification courte...",
    challenge2Options: [
      { key: "A", text: "Peindre juste un mur en vert" },
      {
        key: "B",
        text: "Installer des fontaines, réparer les fuites, optimiser l'éclairage, rendre les clubs plus inclusifs",
      },
      { key: "C", text: "Mettre seulement une affiche \"sauvez la planète\"" },
    ],
    qFlashOptions: [
      { key: "A", text: "Les problèmes se traitent séparément" },
      { key: "B", text: "Les actions sont interconnectées" },
      { key: "C", text: "Les ODD servent seulement à décorer des affiches" },
    ],
    infographicItems: [
      "500 bouteilles jetables / semaine",
      "3 robinets qui fuient",
      "Lumières allumées dans des salles vides",
      "Faible participation de certains groupes",
    ],
    qcmLabel: "QCM",
    challenge1ScoreLabel: "Défi 1",
    challenge2ScoreLabel: "Défi 2",
    totalScoreLabel: "Score global",
  },
  en: {
    headerTitle: "Contest 3: SDGs for Beginners",
    headerDescription:
      "Complete flow: opening visual, analysis MCQ, mini systemic case, and final challenge with automatic scoring.",
    target: "Target audience: 16-20 years old",
    duration: "Recommended duration: 2h",
    format: "Format: 10 min briefing, 15 min SDG mission, 55 min MCQ, 20 min systemic case, 20 min final challenge",
    objective:
      "Goal: develop systemic thinking, connect SDGs together, and move from knowledge to action.",
    openingTitle: "Opening animation: A Place in Transition",
    openingScenario:
      "The scenario presents interconnected issues (waste, energy, water, engagement) and combined actions with multiple positive effects.",
    openingKeyMessage: "Key message: one action can impact multiple SDGs at once.",
    flashTitle: "Flash question",
    flashPrompt: "The main idea of the animation is:",
    flashCorrect: "Expected answer: B",
    quizTitle: "Analysis MCQ (18 questions)",
    challenge1Title: "Visual challenge 1: SDG interconnection map",
    challenge1Instruction:
      "Create at least 4 logical links among SDGs 3, 4, 6, 12, 13 and 17, then provide a short justification for each.",
    challenge2Title: "Visual challenge 2: Sustainable place diagnosis",
    challenge2Instruction: "Review the 4 data points and choose the most systemic action plan.",
    challenge2Question: "Which action plan addresses the highest number of SDGs?",
    summaryTitle: "Final result",
    calculate: "Calculate score",
    reset: "Reset",
    pointsLabel: "points",
    bonusLabel: "Animation bonus (+1)",
    tieBreakLabel: "Tie-break",
    tieBreak1: "systemic challenge score",
    tieBreak2: "number of exact answers with no mistakes",
    tieBreak3: "total time",
    shortJustificationPlaceholder: "Short justification...",
    challenge2Options: [
      { key: "A", text: "Paint only one wall green" },
      {
        key: "B",
        text: "Install fountains, repair leaks, optimize lighting, and make clubs more inclusive",
      },
      { key: "C", text: "Only put up a \"save the planet\" poster" },
    ],
    qFlashOptions: [
      { key: "A", text: "Problems must be treated separately" },
      { key: "B", text: "Actions are interconnected" },
      { key: "C", text: "SDGs are only for decorative posters" },
    ],
    infographicItems: [
      "500 disposable bottles per week",
      "3 leaking taps",
      "Lights on in empty rooms",
      "Low participation from some groups",
    ],
    qcmLabel: "MCQ",
    challenge1ScoreLabel: "Challenge 1",
    challenge2ScoreLabel: "Challenge 2",
    totalScoreLabel: "Overall score",
  },
  ar: {
    headerTitle: "المسابقة 3: أهداف التنمية للمبتدئين",
    headerDescription:
      "مسار كامل: افتتاح بصري، أسئلة تحليلية، حالة منهجية مصغرة، وتحد نهائي مع احتساب تلقائي للنقاط.",
    target: "الفئة المستهدفة: 16-20 سنة",
    duration: "المدة المقترحة: ساعتان",
    format: "الهيكلة: 10 د تمهيد، 15 د مهمة ODD، 55 د أسئلة تحليلية، 20 د حالة منهجية، 20 د تحد نهائي",
    objective:
      "الهدف: بناء تفكير منهجي يربط بين الأهداف والانتقال من المعرفة إلى الفعل.",
    openingTitle: "الافتتاح: فضاء في حالة انتقال",
    openingScenario:
      "يعرض السيناريو مشكلات مترابطة (النفايات، الطاقة، الماء، المشاركة) وإجراءات مجمعة تؤدي إلى آثار إيجابية متعددة.",
    openingKeyMessage: "الرسالة الأساسية: إجراء واحد يمكن أن يؤثر في عدة أهداف معًا.",
    flashTitle: "سؤال سريع",
    flashPrompt: "الفكرة الرئيسية في الافتتاح هي:",
    flashCorrect: "الإجابة المتوقعة: B",
    quizTitle: "أسئلة التحليل (18 سؤالًا)",
    challenge1Title: "التحدي البصري 1: خريطة ترابط الأهداف",
    challenge1Instruction:
      "أنشئ 4 روابط منطقية على الأقل بين الأهداف 3 و4 و6 و12 و13 و17، مع تبرير قصير لكل رابط.",
    challenge2Title: "التحدي البصري 2: تشخيص فضاء مستدام",
    challenge2Instruction: "حلل المعطيات الأربع واختر خطة العمل الأكثر منهجية.",
    challenge2Question: "أي خطة عمل تستجيب لأكبر عدد من الأهداف؟",
    summaryTitle: "النتيجة النهائية",
    calculate: "حساب النتيجة",
    reset: "إعادة التعيين",
    pointsLabel: "نقاط",
    bonusLabel: "مكافأة الافتتاح (+1)",
    tieBreakLabel: "كسر التعادل",
    tieBreak1: "نتيجة التحدي المنهجي",
    tieBreak2: "عدد الإجابات الصحيحة دون أخطاء",
    tieBreak3: "الوقت الإجمالي",
    shortJustificationPlaceholder: "تبرير قصير...",
    challenge2Options: [
      { key: "A", text: "طلاء جدار واحد بالأخضر فقط" },
      {
        key: "B",
        text: "تركيب نوافير، إصلاح التسربات، تحسين الإضاءة، وجعل الأندية أكثر شمولًا",
      },
      { key: "C", text: "وضع ملصق \"أنقذوا الكوكب\" فقط" },
    ],
    qFlashOptions: [
      { key: "A", text: "يجب معالجة المشكلات بشكل منفصل" },
      { key: "B", text: "الإجراءات مترابطة" },
      { key: "C", text: "الأهداف مجرد زينة للملصقات" },
    ],
    infographicItems: [
      "500 قارورة أحادية الاستخدام أسبوعيًا",
      "3 صنابير بها تسرب",
      "إضاءة تعمل في قاعات فارغة",
      "ضعف مشاركة بعض المجموعات",
    ],
    qcmLabel: "الأسئلة",
    challenge1ScoreLabel: "التحدي 1",
    challenge2ScoreLabel: "التحدي 2",
    totalScoreLabel: "النتيجة الإجمالية",
  },
};

const questionBank: Record<ParticipantLocale, Question[]> = {
  fr: [
    { id: 1, points: 3, prompt: "Les ODD doivent être compris comme:", options: [{ key: "A", text: "Une simple liste de logos" }, { key: "B", text: "Un système dynamique et interconnecté" }, { key: "C", text: "Un thème uniquement écologique" }], correct: "B", justification: "Les ODD forment un cadre global interconnecté." },
    { id: 2, points: 3, prompt: "Les ODD couvrent principalement:", options: [{ key: "A", text: "Seulement l'environnement" }, { key: "B", text: "L'environnement, le social et l'économie" }, { key: "C", text: "Seulement la technologie" }], correct: "B", justification: "L'approche est holistique: environnement, social et économie." },
    { id: 3, points: 3, prompt: "Quel exemple montre le mieux l'interconnexion des ODD?", options: [{ key: "A", text: "Améliorer l'accès à l'eau agit aussi sur la santé et les conditions d'étude" }, { key: "B", text: "Un problème d'eau n'a aucun lien avec la santé" }, { key: "C", text: "L'éducation n'a aucun lien avec l'environnement" }], correct: "A", justification: "Un enjeu peut améliorer plusieurs dimensions à la fois." },
    { id: 4, points: 3, prompt: "Une ville durable repose surtout sur:", options: [{ key: "A", text: "Une seule solution miracle" }, { key: "B", text: "L'addition de plusieurs solutions complémentaires" }, { key: "C", text: "Seulement davantage de circulation automobile" }], correct: "B", justification: "La durabilité vient d'un ensemble cohérent d'actions." },
    { id: 5, points: 3, prompt: "Quel comportement est le plus cohérent avec l'ODD 12?", options: [{ key: "A", text: "Acheter plus pendant les promotions" }, { key: "B", text: "Réparer ou réutiliser avant de remplacer" }, { key: "C", text: "Jeter un appareil à la première panne" }], correct: "B", justification: "Consommer responsable, c'est prolonger la durée de vie." },
    { id: 6, points: 3, prompt: "L'expression \"personne ne gagne seul\" met surtout en avant:", options: [{ key: "A", text: "La coopération" }, { key: "B", text: "La mémorisation passive" }, { key: "C", text: "La compétition individuelle pure" }], correct: "A", justification: "Les dynamiques ODD se construisent collectivement." },
    { id: 7, points: 3, prompt: "Quel projet correspond le mieux à une approche ODD?", options: [{ key: "A", text: "Une seule journée d'affichage sans suite" }, { key: "B", text: "Un projet avec diagnostic, actions, suivi et implication" }, { key: "C", text: "Une affiche posée sans discussion" }], correct: "B", justification: "La logique ODD exige un cycle complet et participatif." },
    { id: 8, points: 3, prompt: "L'épuisement des ressources naturelles concerne:", options: [{ key: "A", text: "Seulement le pétrole" }, { key: "B", text: "Énergies fossiles, minerais, ressources halieutiques et eau douce" }, { key: "C", text: "Seulement les forêts tropicales" }], correct: "B", justification: "Le sujet touche plusieurs types de ressources." },
    { id: 9, points: 3, prompt: "Quel binôme d'ODD est le plus mobilisé par tri + réduction des déchets + baisse des émissions?", options: [{ key: "A", text: "ODD 12 et ODD 13" }, { key: "B", text: "ODD 4 et ODD 16" }, { key: "C", text: "ODD 8 et ODD 9" }], correct: "A", justification: "Consommation responsable et action climatique sont directement liées." },
    { id: 10, points: 3, prompt: "Dans une pédagogie ODD efficace, la personne apprenante doit être:", options: [{ key: "A", text: "Spectateur" }, { key: "B", text: "Acteur" }, { key: "C", text: "Simple réciteur" }], correct: "B", justification: "L'apprentissage actif est central." },
    { id: 11, points: 3, prompt: "\"Former autrement aujourd'hui pour agir demain\" signifie surtout:", options: [{ key: "A", text: "Apprendre pour agir" }, { key: "B", text: "Apprendre seulement pour réciter" }, { key: "C", text: "Agir sans comprendre" }], correct: "A", justification: "Compréhension et action vont ensemble." },
    { id: 12, points: 3, prompt: "Quelle proposition est la plus systémique?", options: [{ key: "A", text: "Traiter les déchets sans lien avec les autres enjeux" }, { key: "B", text: "Relier déchets, consommation, énergie, santé et climat" }, { key: "C", text: "Étudier chaque problème isolément" }], correct: "B", justification: "La lecture systémique relie les dimensions." },
    { id: 13, points: 4, prompt: "Une approche holistique des ODD signifie:", options: [{ key: "A", text: "Relier dimensions sociales, environnementales et économiques" }, { key: "B", text: "Étudier seulement l'environnement" }, { key: "C", text: "Étudier seulement l'économie" }], correct: "A", justification: "La perspective est globale et interconnectée." },
    { id: 14, points: 4, prompt: "Quel projet évite le mieux le greenwashing?", options: [{ key: "A", text: "Campagne d'affiches sans action mesurable" }, { key: "B", text: "Projet avec objectifs, indicateurs, suivi et bilan" }, { key: "C", text: "Slogan écologique sans changement réel" }], correct: "B", justification: "Il faut des résultats vérifiables." },
    { id: 15, points: 4, prompt: "Quel partenariat est le plus cohérent pour un projet ODD?", options: [{ key: "A", text: "Participants + équipe encadrante + acteurs locaux" }, { key: "B", text: "Une seule personne isolée" }, { key: "C", text: "Aucun acteur local" }], correct: "A", justification: "Les partenariats renforcent les projets." },
    { id: 16, points: 4, prompt: "Améliorer l'accès à l'eau potable peut aussi améliorer:", options: [{ key: "A", text: "La santé et les conditions d'apprentissage" }, { key: "B", text: "Seulement la couleur des murs" }, { key: "C", text: "Rien d'autre" }], correct: "A", justification: "Eau, santé et bien-être sont liés." },
    { id: 17, points: 4, prompt: "Quel ensemble d'indicateurs suit le mieux un projet ODD?", options: [{ key: "A", text: "Kg de déchets évités, litres d'eau économisés, kWh économisés, taux de participation" }, { key: "B", text: "Seulement le nombre d'affiches" }, { key: "C", text: "Seulement la couleur du logo" }], correct: "A", justification: "Le suivi doit couvrir plusieurs indicateurs concrets." },
    { id: 18, points: 4, prompt: "Une action écologique devient plus juste socialement quand:", options: [{ key: "A", text: "Elle reste accessible à toutes et tous" }, { key: "B", text: "Elle exclut les personnes avec moins de moyens" }, { key: "C", text: "Elle augmente les inégalités" }], correct: "A", justification: "La durabilité inclut l'équité sociale." },
  ],
  en: [
    { id: 1, points: 3, prompt: "SDGs should be understood as:", options: [{ key: "A", text: "A simple list of logos" }, { key: "B", text: "A dynamic and interconnected system" }, { key: "C", text: "A topic limited to ecology only" }], correct: "B", justification: "SDGs are designed as an interconnected global framework." },
    { id: 2, points: 3, prompt: "SDGs mainly cover:", options: [{ key: "A", text: "Only the environment" }, { key: "B", text: "Environment, society, and economy" }, { key: "C", text: "Only technology" }], correct: "B", justification: "The approach is holistic: environmental, social, and economic." },
    { id: 3, points: 3, prompt: "Which example best shows SDG interconnection?", options: [{ key: "A", text: "Improving access to water also improves health and study conditions" }, { key: "B", text: "A water issue has no link to health" }, { key: "C", text: "Education has no link to the environment" }], correct: "A", justification: "One intervention can improve several dimensions at once." },
    { id: 4, points: 3, prompt: "A sustainable city mostly depends on:", options: [{ key: "A", text: "One miracle solution" }, { key: "B", text: "Combining multiple complementary solutions" }, { key: "C", text: "Only increasing car traffic" }], correct: "B", justification: "Sustainability comes from coherent combined actions." },
    { id: 5, points: 3, prompt: "Which behavior is most aligned with SDG 12 (responsible consumption)?", options: [{ key: "A", text: "Buying more during promotions" }, { key: "B", text: "Repairing or reusing before replacing" }, { key: "C", text: "Throwing away a device at the first failure" }], correct: "B", justification: "Responsible consumption extends product life." },
    { id: 6, points: 3, prompt: "The statement \"no one wins alone\" mainly emphasizes:", options: [{ key: "A", text: "Cooperation" }, { key: "B", text: "Passive memorization" }, { key: "C", text: "Pure individual competition" }], correct: "A", justification: "SDG dynamics are built collectively." },
    { id: 7, points: 3, prompt: "Which project best matches an SDG approach?", options: [{ key: "A", text: "One display day with no follow-up" }, { key: "B", text: "A project with diagnosis, actions, tracking, and participation" }, { key: "C", text: "A poster in a hallway with no discussion" }], correct: "B", justification: "SDG logic requires a full participatory cycle." },
    { id: 8, points: 3, prompt: "Natural resource depletion concerns:", options: [{ key: "A", text: "Only oil" }, { key: "B", text: "Fossil energy, minerals, fishery resources, and freshwater" }, { key: "C", text: "Only tropical forests" }], correct: "B", justification: "The issue covers several resource categories." },
    { id: 9, points: 3, prompt: "Which SDG pair is most directly activated by sorting, reducing waste, and cutting emissions?", options: [{ key: "A", text: "SDG 12 and SDG 13" }, { key: "B", text: "SDG 4 and SDG 16" }, { key: "C", text: "SDG 8 and SDG 9" }], correct: "A", justification: "Responsible consumption and climate action are directly linked." },
    { id: 10, points: 3, prompt: "In effective SDG learning, the learner should be:", options: [{ key: "A", text: "A spectator" }, { key: "B", text: "An active actor" }, { key: "C", text: "A title reciter only" }], correct: "B", justification: "Active participation is central." },
    { id: 11, points: 3, prompt: "\"Learn differently today to act tomorrow\" mainly means:", options: [{ key: "A", text: "Learn in order to act" }, { key: "B", text: "Learn only to recite" }, { key: "C", text: "Act without understanding" }], correct: "A", justification: "Understanding and action must go together." },
    { id: 12, points: 3, prompt: "Which option is the most systemic?", options: [{ key: "A", text: "Treat waste without linking to other issues" }, { key: "B", text: "Connect waste, consumption, energy, health, and climate" }, { key: "C", text: "Study each issue in isolation" }], correct: "B", justification: "Systemic reasoning connects dimensions." },
    { id: 13, points: 4, prompt: "A holistic SDG approach means:", options: [{ key: "A", text: "Studying a problem by linking social, environmental, and economic dimensions" }, { key: "B", text: "Studying only the environment" }, { key: "C", text: "Studying only the economy" }], correct: "A", justification: "The SDG lens is globally interconnected." },
    { id: 14, points: 4, prompt: "Which project best avoids greenwashing?", options: [{ key: "A", text: "A poster campaign with no measurable action" }, { key: "B", text: "A project with goals, indicators, monitoring, and review" }, { key: "C", text: "An ecological slogan without real change" }], correct: "B", justification: "SDG action must be measurable and monitored." },
    { id: 15, points: 4, prompt: "For an SDG project, which partnership is most coherent?", options: [{ key: "A", text: "Participants + facilitators + local community actors" }, { key: "B", text: "One isolated participant" }, { key: "C", text: "A project with no local actors" }], correct: "A", justification: "Collaborative partnerships make projects stronger." },
    { id: 16, points: 4, prompt: "When access to safe water improves, what can also improve?", options: [{ key: "A", text: "Health and learning conditions" }, { key: "B", text: "Only wall color" }, { key: "C", text: "Nothing else" }], correct: "A", justification: "Water, health, and well-being are connected." },
    { id: 17, points: 4, prompt: "Which indicator set best tracks an SDG project?", options: [{ key: "A", text: "Kg of avoided waste, liters saved, kWh saved, participation rate" }, { key: "B", text: "Only number of printed posters" }, { key: "C", text: "Only logo color" }], correct: "A", justification: "Tracking should use multiple concrete indicators." },
    { id: 18, points: 4, prompt: "An ecological action becomes more socially fair when:", options: [{ key: "A", text: "It stays accessible to everyone" }, { key: "B", text: "It excludes people with fewer resources" }, { key: "C", text: "It increases inequality" }], correct: "A", justification: "Sustainability includes social equity." },
  ],
  ar: [
    { id: 1, points: 3, prompt: "يجب فهم أهداف التنمية المستدامة على أنها:", options: [{ key: "A", text: "مجرد قائمة شعارات" }, { key: "B", text: "نظام ديناميكي مترابط" }, { key: "C", text: "موضوع بيئي فقط" }], correct: "B", justification: "الأهداف إطار عالمي مترابط وليس عناصر منفصلة." },
    { id: 2, points: 3, prompt: "تغطي أهداف التنمية المستدامة أساسًا:", options: [{ key: "A", text: "البيئة فقط" }, { key: "B", text: "البيئة والمجتمع والاقتصاد" }, { key: "C", text: "التكنولوجيا فقط" }], correct: "B", justification: "المقاربة شمولية: بيئية واجتماعية واقتصادية." },
    { id: 3, points: 3, prompt: "أي مثال يوضح ترابط الأهداف بشكل أفضل؟", options: [{ key: "A", text: "تحسين الوصول إلى الماء يحسن أيضًا الصحة وظروف التعلم" }, { key: "B", text: "مشكل الماء لا علاقة له بالصحة" }, { key: "C", text: "التعليم لا علاقة له بالبيئة" }], correct: "A", justification: "الإجراء الواحد قد يحسن أكثر من بُعد في الوقت نفسه." },
    { id: 4, points: 3, prompt: "تعتمد المدينة المستدامة أساسًا على:", options: [{ key: "A", text: "حل سحري واحد" }, { key: "B", text: "دمج عدة حلول متكاملة" }, { key: "C", text: "زيادة حركة السيارات فقط" }], correct: "B", justification: "الاستدامة تتحقق عبر حزمة حلول متكاملة." },
    { id: 5, points: 3, prompt: "أي سلوك هو الأكثر توافقًا مع الهدف 12؟", options: [{ key: "A", text: "الشراء أكثر أثناء التخفيضات" }, { key: "B", text: "الإصلاح أو إعادة الاستخدام قبل الاستبدال" }, { key: "C", text: "رمي الجهاز عند أول عطل" }], correct: "B", justification: "الاستهلاك المسؤول يعني إطالة عمر المنتجات." },
    { id: 6, points: 3, prompt: "عبارة \"لا أحد يربح وحده\" تؤكد أساسًا على:", options: [{ key: "A", text: "التعاون" }, { key: "B", text: "الحفظ السلبي" }, { key: "C", text: "المنافسة الفردية الخالصة" }], correct: "A", justification: "العمل ضمن أهداف التنمية يقوم على التعاون." },
    { id: 7, points: 3, prompt: "أي مشروع يطابق نهج أهداف التنمية بشكل أفضل؟", options: [{ key: "A", text: "يوم عرض واحد بلا متابعة" }, { key: "B", text: "مشروع فيه تشخيص وإجراءات ومتابعة ومشاركة" }, { key: "C", text: "ملصق في الممر دون نقاش" }], correct: "B", justification: "النهج الصحيح يعتمد دورة كاملة تشاركية." },
    { id: 8, points: 3, prompt: "استنزاف الموارد الطبيعية يشمل:", options: [{ key: "A", text: "النفط فقط" }, { key: "B", text: "الطاقات الأحفورية والمعادن والموارد السمكية والمياه العذبة" }, { key: "C", text: "الغابات الاستوائية فقط" }], correct: "B", justification: "المسألة تمس موارد متعددة وليس نوعًا واحدًا." },
    { id: 9, points: 3, prompt: "أي ثنائي أهداف يرتبط مباشرة بالفرز وتقليل النفايات وخفض الانبعاثات؟", options: [{ key: "A", text: "الهدف 12 والهدف 13" }, { key: "B", text: "الهدف 4 والهدف 16" }, { key: "C", text: "الهدف 8 والهدف 9" }], correct: "A", justification: "الاستهلاك المسؤول والعمل المناخي مرتبطان مباشرة." },
    { id: 10, points: 3, prompt: "في تعلم فعّال لأهداف التنمية، يجب أن يكون المتعلم:", options: [{ key: "A", text: "متفرجًا" }, { key: "B", text: "فاعلًا" }, { key: "C", text: "مرددًا للعناوين فقط" }], correct: "B", justification: "التعلم النشط هو الأساس." },
    { id: 11, points: 3, prompt: "عبارة \"نتعلم اليوم بشكل مختلف لنفعل غدًا\" تعني أساسًا:", options: [{ key: "A", text: "نتعلم لكي نعمل" }, { key: "B", text: "نتعلم فقط للترديد" }, { key: "C", text: "نعمل دون فهم" }], correct: "A", justification: "الفهم والعمل يجب أن يسيرا معًا." },
    { id: 12, points: 3, prompt: "أي اقتراح هو الأكثر منهجية؟", options: [{ key: "A", text: "معالجة النفايات دون ربطها ببقية القضايا" }, { key: "B", text: "ربط النفايات بالاستهلاك والطاقة والصحة والمناخ" }, { key: "C", text: "دراسة كل مشكلة بمعزل" }], correct: "B", justification: "التفكير المنهجي يربط بين الأبعاد المختلفة." },
    { id: 13, points: 4, prompt: "المقاربة الشمولية لأهداف التنمية تعني:", options: [{ key: "A", text: "دراسة المشكلة بربط الأبعاد الاجتماعية والبيئية والاقتصادية" }, { key: "B", text: "دراسة البيئة فقط" }, { key: "C", text: "دراسة الاقتصاد فقط" }], correct: "A", justification: "المنظور الشمولي يدمج كل الأبعاد ذات الصلة." },
    { id: 14, points: 4, prompt: "أي مشروع يتجنب الغسل الأخضر بشكل أفضل؟", options: [{ key: "A", text: "حملة ملصقات دون إجراء قابل للقياس" }, { key: "B", text: "مشروع بأهداف ومؤشرات ومتابعة وتقييم" }, { key: "C", text: "شعار بيئي دون تغيير فعلي" }], correct: "B", justification: "العمل الحقيقي يحتاج قياسًا ومتابعة." },
    { id: 15, points: 4, prompt: "ما الشراكة الأكثر اتساقًا مع مشروع أهداف التنمية؟", options: [{ key: "A", text: "المشاركون + فريق التأطير + الفاعلون المحليون" }, { key: "B", text: "مشارك واحد معزول" }, { key: "C", text: "مشروع بلا أي فاعل محلي" }], correct: "A", justification: "الشراكة التعاونية تقوي أثر المشروع." },
    { id: 16, points: 4, prompt: "عند تحسين الوصول إلى الماء الصالح للشرب، ما الذي يمكن أن يتحسن أيضًا؟", options: [{ key: "A", text: "الصحة وظروف التعلم" }, { key: "B", text: "لون الجدران فقط" }, { key: "C", text: "لا شيء آخر" }], correct: "A", justification: "الماء والصحة والتعلم مترابطة." },
    { id: 17, points: 4, prompt: "أي مجموعة مؤشرات هي الأفضل لتتبع مشروع أهداف التنمية؟", options: [{ key: "A", text: "كغ النفايات المتفاداة، لترات الماء الموفرة، ك.و.س الموفرة، نسبة المشاركة" }, { key: "B", text: "عدد الملصقات المطبوعة فقط" }, { key: "C", text: "لون الشعار فقط" }], correct: "A", justification: "المتابعة الفعالة تحتاج مؤشرات متعددة وملموسة." },
    { id: 18, points: 4, prompt: "يصبح العمل البيئي أكثر عدلًا اجتماعيًا عندما:", options: [{ key: "A", text: "يبقى متاحًا للجميع" }, { key: "B", text: "يُقصي من لديهم موارد أقل" }, { key: "C", text: "يزيد عدم المساواة" }], correct: "A", justification: "الاستدامة تشمل العدالة الاجتماعية." },
  ],
};

const visualLinksByLocale: Record<ParticipantLocale, VisualLink[]> = {
  fr: [
    { id: "6-3", label: "ODD 6 ↔ ODD 3 (eau / santé)", valid: true },
    { id: "4-12", label: "ODD 4 ↔ ODD 12 (éducation / consommation)", valid: true },
    { id: "12-13", label: "ODD 12 ↔ ODD 13 (consommation / climat)", valid: true },
    { id: "17-all", label: "ODD 17 ↔ tous les autres (partenariats)", valid: true },
    { id: "4-13", label: "ODD 4 ↔ ODD 13 (éducation / action climatique)", valid: true },
    { id: "3-12-invalid", label: "ODD 3 ↔ ODD 12 (sans justification)", valid: false },
  ],
  en: [
    { id: "6-3", label: "SDG 6 ↔ SDG 3 (water / health)", valid: true },
    { id: "4-12", label: "SDG 4 ↔ SDG 12 (education / consumption)", valid: true },
    { id: "12-13", label: "SDG 12 ↔ SDG 13 (consumption / climate)", valid: true },
    { id: "17-all", label: "SDG 17 ↔ all others (partnerships)", valid: true },
    { id: "4-13", label: "SDG 4 ↔ SDG 13 (education / climate action)", valid: true },
    { id: "3-12-invalid", label: "SDG 3 ↔ SDG 12 (no justification)", valid: false },
  ],
  ar: [
    { id: "6-3", label: "الهدف 6 ↔ الهدف 3 (الماء / الصحة)", valid: true },
    { id: "4-12", label: "الهدف 4 ↔ الهدف 12 (التعليم / الاستهلاك)", valid: true },
    { id: "12-13", label: "الهدف 12 ↔ الهدف 13 (الاستهلاك / المناخ)", valid: true },
    { id: "17-all", label: "الهدف 17 ↔ بقية الأهداف (الشراكات)", valid: true },
    { id: "4-13", label: "الهدف 4 ↔ الهدف 13 (التعليم / العمل المناخي)", valid: true },
    { id: "3-12-invalid", label: "الهدف 3 ↔ الهدف 12 (من دون تبرير)", valid: false },
  ],
};

export function ParticipantTutorialContent() {
  const { locale } = useParticipantLanguage();
  const copy = localeCopy[locale];
  const questions = questionBank[locale];
  const visualLinks = visualLinksByLocale[locale];

  const [flashAnswer, setFlashAnswer] = useState<Option["key"] | null>(null);
  const [answers, setAnswers] = useState<Record<number, Option["key"]>>({});
  const [selectedLinks, setSelectedLinks] = useState<Record<string, boolean>>({});
  const [justifications, setJustifications] = useState<Record<string, string>>({});
  const [challenge2, setChallenge2] = useState<Option["key"] | null>(null);
  const [finalScore, setFinalScore] = useState<number | null>(null);

  const quizScore = useMemo(
    () => questions.reduce((sum, q) => (answers[q.id] === q.correct ? sum + q.points : sum), 0),
    [answers, questions],
  );

  const challenge1Score = useMemo(() => {
    const validSelected = visualLinks.filter(
      (link) =>
        selectedLinks[link.id] && link.valid && (justifications[link.id]?.trim().length ?? 0) >= 8,
    ).length;
    return Math.min(validSelected, 4) * 5;
  }, [selectedLinks, justifications, visualLinks]);

  const challenge2Score = challenge2 === "B" ? 20 : 0;
  const bonus = flashAnswer === "B" ? 1 : 0;

  function onCalculate() {
    setFinalScore(Math.min(100, quizScore + challenge1Score + challenge2Score));
  }

  function onReset() {
    setFlashAnswer(null);
    setAnswers({});
    setSelectedLinks({});
    setJustifications({});
    setChallenge2(null);
    setFinalScore(null);
  }

  return (
    <div className="space-y-6">
      <PageHeader title={copy.headerTitle} description={copy.headerDescription} />

      <Card className="space-y-3">
        <p className="text-sm font-semibold text-slate-800">{copy.target}</p>
        <p className="text-sm text-slate-700">{copy.duration}</p>
        <p className="text-sm text-slate-700">{copy.format}</p>
        <p className="text-sm text-slate-700">{copy.objective}</p>
      </Card>

      <Card className="space-y-4">
        <h2 className="font-display text-2xl text-slate-900">{copy.openingTitle}</h2>
        <p className="text-sm leading-7 text-slate-700">{copy.openingScenario}</p>
        <Image
          src={visuals.opening}
          alt="Concours opening visual"
          width={1400}
          height={700}
          className="h-auto w-full rounded-2xl border border-[var(--line)] bg-white"
        />
        <p className="rounded-2xl bg-[var(--panel-soft)] px-4 py-3 text-sm font-semibold text-slate-800">
          {copy.openingKeyMessage}
        </p>

        <div className="space-y-2 rounded-2xl border border-[var(--line)] bg-white/70 p-4">
          <p className="text-sm font-semibold text-slate-900">{copy.flashTitle}</p>
          <p className="text-sm text-slate-700">{copy.flashPrompt}</p>
          <div className="grid gap-2">
            {copy.qFlashOptions.map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => setFlashAnswer(option.key)}
                className={`rounded-xl border px-3 py-2 text-left text-sm transition ${
                  flashAnswer === option.key
                    ? "border-[var(--brand)] bg-[var(--panel-soft)] text-slate-900"
                    : "border-[var(--line)] bg-white text-slate-700"
                }`}
              >
                {option.key}. {option.text}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-500">{copy.flashCorrect}</p>
        </div>
      </Card>

      <Card className="space-y-4">
        <h2 className="font-display text-2xl text-slate-900">{copy.quizTitle}</h2>
        <div className="space-y-4">
          {questions.map((question) => (
            <div key={question.id} className="rounded-2xl border border-[var(--line)] bg-white/75 p-4">
              <p className="mb-2 text-sm font-semibold text-slate-900">
                Q{question.id} ({question.points} {copy.pointsLabel})
              </p>
              <p className="mb-3 text-sm leading-7 text-slate-700">{question.prompt}</p>
              <div className="grid gap-2">
                {question.options.map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setAnswers((prev) => ({ ...prev, [question.id]: option.key }))}
                    className={`rounded-xl border px-3 py-2 text-left text-sm transition ${
                      answers[question.id] === option.key
                        ? "border-[var(--brand)] bg-[var(--panel-soft)] text-slate-900"
                        : "border-[var(--line)] bg-white text-slate-700"
                    }`}
                  >
                    {option.key}. {option.text}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-slate-500">{question.justification}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="space-y-4">
        <h2 className="font-display text-2xl text-slate-900">{copy.challenge1Title}</h2>
        <p className="text-sm leading-7 text-slate-700">{copy.challenge1Instruction}</p>
        <Image
          src={visuals.interconnections}
          alt="SDG interconnections visual"
          width={1400}
          height={700}
          className="h-auto w-full rounded-2xl border border-[var(--line)] bg-white"
        />

        <div className="space-y-3">
          {visualLinks.map((link) => (
            <div key={link.id} className="rounded-2xl border border-[var(--line)] bg-white/80 p-3">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-800">
                <input
                  type="checkbox"
                  checked={Boolean(selectedLinks[link.id])}
                  onChange={(event) =>
                    setSelectedLinks((prev) => ({ ...prev, [link.id]: event.currentTarget.checked }))
                  }
                />
                {link.label}
              </label>
              {selectedLinks[link.id] && (
                <textarea
                  value={justifications[link.id] ?? ""}
                  onChange={(event) =>
                    setJustifications((prev) => ({ ...prev, [link.id]: event.currentTarget.value }))
                  }
                  className="mt-2 min-h-20 w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm"
                  placeholder={copy.shortJustificationPlaceholder}
                />
              )}
            </div>
          ))}
        </div>
      </Card>

      <Card className="space-y-4">
        <h2 className="font-display text-2xl text-slate-900">{copy.challenge2Title}</h2>
        <p className="text-sm leading-7 text-slate-700">{copy.challenge2Instruction}</p>
        <Image
          src={visuals.diagnostic}
          alt="Sustainable diagnosis visual"
          width={1400}
          height={700}
          className="h-auto w-full rounded-2xl border border-[var(--line)] bg-white"
        />

        <div className="grid gap-3 sm:grid-cols-2">
          {copy.infographicItems.map((item) => (
            <div key={item} className="rounded-2xl border border-[var(--line)] bg-white/80 px-4 py-3 text-sm text-slate-800">
              {item}
            </div>
          ))}
        </div>

        <p className="text-sm font-semibold text-slate-900">{copy.challenge2Question}</p>
        <div className="grid gap-2">
          {copy.challenge2Options.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => setChallenge2(option.key)}
              className={`rounded-xl border px-3 py-2 text-left text-sm transition ${
                challenge2 === option.key
                  ? "border-[var(--brand)] bg-[var(--panel-soft)] text-slate-900"
                  : "border-[var(--line)] bg-white text-slate-700"
              }`}
            >
              {option.key}. {option.text}
            </button>
          ))}
        </div>
      </Card>

      <Card className="space-y-4">
        <h2 className="font-display text-2xl text-slate-900">{copy.summaryTitle}</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <ScoreTile label={copy.qcmLabel} value={`${quizScore}/60`} />
          <ScoreTile label={copy.challenge1ScoreLabel} value={`${challenge1Score}/20`} />
          <ScoreTile label={copy.challenge2ScoreLabel} value={`${challenge2Score}/20`} />
          <ScoreTile label={copy.bonusLabel} value={`${bonus}`} />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={onCalculate}>{copy.calculate}</Button>
          <Button variant="secondary" onClick={onReset}>
            {copy.reset}
          </Button>
        </div>

        {finalScore !== null && (
          <div className="rounded-2xl border border-[var(--brand)] bg-[var(--panel-soft)] p-4">
            <p className="text-sm font-semibold text-slate-800">
              {copy.totalScoreLabel}: {finalScore}/100
            </p>
            <p className="mt-1 text-xs text-slate-600">{copy.tieBreakLabel}:</p>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-xs text-slate-600">
              <li>{copy.tieBreak1}</li>
              <li>{copy.tieBreak2}</li>
              <li>{copy.tieBreak3}</li>
            </ul>
          </div>
        )}
      </Card>
    </div>
  );
}

function ScoreTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-white/80 p-3">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-bold text-slate-900">{value}</p>
    </div>
  );
}
