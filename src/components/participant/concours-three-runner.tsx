"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";

type Option = { key: "A" | "B" | "C"; text: string };

type ConcoursThreeRunnerProps = {
  sessionId: string;
  status: "NOT_STARTED" | "IN_PROGRESS";
  ids: {
    flash: string;
    questions: string[];
    challenge1: string;
    challenge2: string;
  };
  initialAnswers: Record<string, unknown>;
};

const flashOptions: Option[] = [
  { key: "A", text: "Les problemes se traitent separement" },
  { key: "B", text: "Les actions sont interconnectees" },
  { key: "C", text: "Les ODD servent seulement a decorer" },
];

const qcm: Array<{ prompt: string; options: Option[] }> = [
  {
    prompt: "Q1. Les ODD doivent etre compris comme:",
    options: [
      { key: "A", text: "Une simple liste de logos" },
      { key: "B", text: "Un systeme dynamique et interconnecte" },
      { key: "C", text: "Un theme uniquement ecologique" },
    ],
  },
  {
    prompt: "Q2. Les ODD couvrent principalement:",
    options: [
      { key: "A", text: "Seulement l'environnement" },
      { key: "B", text: "L'environnement, le social et l'economie" },
      { key: "C", text: "Seulement la technologie" },
    ],
  },
  {
    prompt: "Q3. Quel exemple montre le mieux l'interconnexion des ODD?",
    options: [
      { key: "A", text: "Ameliorer l'acces a l'eau agit aussi sur la sante et les conditions d'etude" },
      { key: "B", text: "Un probleme d'eau n'a aucun lien avec la sante" },
      { key: "C", text: "L'education n'a aucun lien avec l'environnement" },
    ],
  },
  {
    prompt: "Q4. Une ville durable repose surtout sur:",
    options: [
      { key: "A", text: "Une seule solution miracle" },
      { key: "B", text: "L'addition de plusieurs solutions complementaires" },
      { key: "C", text: "Seulement davantage de circulation automobile" },
    ],
  },
  {
    prompt: "Q5. Le comportement le plus coherent avec l'ODD 12 (consommation responsable) est:",
    options: [
      { key: "A", text: "Acheter plus pendant les promotions" },
      { key: "B", text: "Reparer ou reutiliser avant de remplacer" },
      { key: "C", text: "Jeter un appareil a la premiere panne" },
    ],
  },
  {
    prompt: "Q6. L'expression personne ne gagne seul met surtout en avant:",
    options: [
      { key: "A", text: "La cooperation" },
      { key: "B", text: "La memorisation passive" },
      { key: "C", text: "La competition individuelle pure" },
    ],
  },
  {
    prompt: "Q7. Quel projet de lycee correspond le mieux a une approche ODD ?",
    options: [
      { key: "A", text: "Une seule journee d'affichage sans suite" },
      { key: "B", text: "Un projet avec diagnostic, actions, suivi et implication des eleves" },
      { key: "C", text: "Une affiche posee dans le couloir sans discussion" },
    ],
  },
  {
    prompt: "Q8. L'epuisement des ressources naturelles concerne:",
    options: [
      { key: "A", text: "Seulement le petrole" },
      { key: "B", text: "Energies fossiles, minerais, ressources halieutiques et eau douce" },
      { key: "C", text: "Seulement les forets tropicales" },
    ],
  },
  {
    prompt:
      "Q9. Quel binome d'ODD est le plus directement mobilise par le tri, la reduction des dechets et la baisse des emissions ?",
    options: [
      { key: "A", text: "ODD 12 et ODD 13" },
      { key: "B", text: "ODD 4 et ODD 16" },
      { key: "C", text: "ODD 8 et ODD 9" },
    ],
  },
  {
    prompt: "Q10. Dans une pedagogie ODD efficace, l'eleve doit etre:",
    options: [
      { key: "A", text: "Spectateur" },
      { key: "B", text: "Acteur" },
      { key: "C", text: "Simple reciteur" },
    ],
  },
  {
    prompt: "Q11. Le message former autrement aujourd'hui pour permettre aux eleves d'agir demain signifie surtout:",
    options: [
      { key: "A", text: "Apprendre pour agir" },
      { key: "B", text: "Apprendre seulement pour reciter" },
      { key: "C", text: "Agir sans comprendre" },
    ],
  },
  {
    prompt: "Q12. Quelle proposition est la plus systemique?",
    options: [
      { key: "A", text: "Traiter un probleme de dechets sans lien avec sante, climat ou ville" },
      { key: "B", text: "Relier dechets, consommation, energie, sante et climat dans une meme analyse" },
      { key: "C", text: "Etudier chaque probleme sans aucun lien" },
    ],
  },
  {
    prompt: "Q13. Une approche holistique des ODD signifie:",
    options: [
      { key: "A", text: "Relier dimensions sociales, environnementales et economiques" },
      { key: "B", text: "Etudier seulement l'environnement" },
      { key: "C", text: "Etudier seulement l'economie" },
    ],
  },
  {
    prompt: "Q14. Quel projet evite le mieux le greenwashing?",
    options: [
      { key: "A", text: "Une campagne d'affiches sans action mesurable" },
      { key: "B", text: "Un projet avec objectifs, indicateurs, suivi et bilan" },
      { key: "C", text: "Un slogan ecologique sans changement reel" },
    ],
  },
  {
    prompt: "Q15. Pour un projet ODD dans un lycee, le partenariat le plus coherent est:",
    options: [
      { key: "A", text: "Eleves + enseignants + direction + commune/association" },
      { key: "B", text: "Un seul eleve isole" },
      { key: "C", text: "Un projet sans acteur local" },
    ],
  },
  {
    prompt: "Q16. Quand un etablissement ameliore l'acces a l'eau potable, cela peut aussi ameliorer:",
    options: [
      { key: "A", text: "La sante et les conditions d'apprentissage" },
      { key: "B", text: "Seulement la couleur des murs" },
      { key: "C", text: "Rien d'autre" },
    ],
  },
  {
    prompt: "Q17. Quel ensemble d'indicateurs permet le mieux de suivre un projet ODD au lycee ?",
    options: [
      { key: "A", text: "Kg de dechets evites, litres d'eau economises, kWh economises, taux de participation" },
      { key: "B", text: "Uniquement le nombre d'affiches" },
      { key: "C", text: "Seulement la couleur du logo" },
    ],
  },
  {
    prompt: "Q18. Une action ecologique devient plus juste socialement quand:",
    options: [
      { key: "A", text: "Elle reste accessible a tous les eleves" },
      { key: "B", text: "Elle exclut les eleves qui ont moins de moyens" },
      { key: "C", text: "Elle augmente les inegalites" },
    ],
  },
];

const challengeTwoOptions: Option[] = [
  { key: "A", text: "Peindre juste un mur en vert" },
  {
    key: "B",
    text: "Installer des fontaines, reparer les fuites, optimiser l'eclairage, rendre les clubs plus inclusifs",
  },
  { key: "C", text: "Mettre seulement une affiche sauvez la planete" },
];

const openingFrames = [
  "Observer les liens entre les ODD",
  "Comprendre les effets en chaine",
  "Agir avec une vision systemique",
] as const;

const oddIcons = [
  { code: "ODD 3", title: "Bonne sante et bien-etre", icon: "HEALTH" },
  { code: "ODD 4", title: "Education de qualite", icon: "EDU" },
  { code: "ODD 6", title: "Eau propre et assainissement", icon: "WATER" },
  { code: "ODD 12", title: "Consommation responsable", icon: "RESP" },
  { code: "ODD 13", title: "Action climatique", icon: "CLIMATE" },
  { code: "ODD 17", title: "Partenariats", icon: "LINK" },
] as const;

export function ConcoursThreeRunner({ sessionId, status, ids, initialAnswers }: ConcoursThreeRunnerProps) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, unknown>>(initialAnswers);
  const [submitting, setSubmitting] = useState(false);
  const [frameIndex, setFrameIndex] = useState(0);

  const readyQuestions = useMemo(() => {
    return ids.questions.map((id, index) => ({ id, ...qcm[index] })).filter((item) => Boolean(item.prompt));
  }, [ids.questions]);

  useEffect(() => {
    const timeout = window.setTimeout(async () => {
      const response = await fetch(`/api/sessions/${sessionId}/autosave`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, start: status === "NOT_STARTED" }),
      });

      if (!response.ok && response.status === 409) {
        router.push(`/participant/results/${sessionId}`);
      }
    }, 1200);

    return () => window.clearTimeout(timeout);
  }, [answers, router, sessionId, status]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % openingFrames.length);
    }, 1800);

    return () => window.clearInterval(interval);
  }, []);

  async function submit() {
    if (submitting) return;
    setSubmitting(true);
    const response = await fetch(`/api/sessions/${sessionId}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers }),
    });

    if (!response.ok) {
      setSubmitting(false);
      toast.error("Submission failed. Please try again.");
      return;
    }

    router.push(`/participant/results/${sessionId}`);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Concours 3: ODD"
        description="Repondez a toutes les questions et soumettez vos reponses pour evaluation manuelle."
      />

      <Card className="space-y-4">
        <h2 className="font-display text-2xl text-slate-900">Animation d&apos;ouverture</h2>
        <div className="opening-stage relative overflow-hidden rounded-2xl border border-[var(--line)] bg-slate-900/95 p-6 text-white">
          <div className="orb orb-a" />
          <div className="orb orb-b" />
          <div className="orb orb-c" />
          <div className="relative z-10 space-y-3">
            <p className="text-xs uppercase tracking-[0.25em] text-cyan-200">Concours ODD</p>
            <p className="max-w-xl text-lg font-semibold leading-7">{openingFrames[frameIndex]}</p>
            <div className="flex flex-wrap gap-2 pt-2">
              {oddIcons.map((item) => (
                <span key={item.code} className="rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs">
                  {item.code}
                </span>
              ))}
            </div>
          </div>
        </div>
        <p className="text-sm text-slate-700">Question flash: L&apos;idee principale de l&apos;animation est:</p>
        <div className="grid gap-2">
          {flashOptions.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => setAnswers((prev) => ({ ...prev, [ids.flash]: option.key }))}
              className={`rounded-xl border px-3 py-2 text-left text-sm ${
                answers[ids.flash] === option.key
                  ? "border-[var(--brand)] bg-[var(--panel-soft)]"
                  : "border-[var(--line)] bg-white"
              }`}
            >
              {option.key}. {option.text}
            </button>
          ))}
        </div>
      </Card>

      <Card className="space-y-4">
        <h2 className="font-display text-2xl text-slate-900">QCM d&apos;analyse</h2>
        {readyQuestions.map((question) => (
          <div key={question.id} className="rounded-2xl border border-[var(--line)] bg-white/80 p-4">
            <p className="mb-2 text-sm font-semibold text-slate-900">{question.prompt}</p>
            <div className="grid gap-2">
              {question.options.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setAnswers((prev) => ({ ...prev, [question.id]: option.key }))}
                  className={`rounded-xl border px-3 py-2 text-left text-sm ${
                    answers[question.id] === option.key
                      ? "border-[var(--brand)] bg-[var(--panel-soft)]"
                      : "border-[var(--line)] bg-white"
                  }`}
                >
                  {option.key}. {option.text}
                </button>
              ))}
            </div>
            <textarea
              className="mt-3 min-h-20 w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm"
              placeholder="Justification courte (optionnelle)"
              value={typeof answers[`${question.id}-note`] === "string" ? String(answers[`${question.id}-note`]) : ""}
              onChange={(event) =>
                setAnswers((prev) => ({ ...prev, [`${question.id}-note`]: event.target.value }))
              }
            />
          </div>
        ))}
      </Card>

      <Card className="space-y-4">
        <h2 className="font-display text-2xl text-slate-900">Defi visuel 1</h2>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {oddIcons.map((item) => (
            <div key={item.code} className="rounded-2xl border border-[var(--line)] bg-[var(--panel-soft)] p-4">
              <p className="inline-flex rounded-full border border-[var(--line)] bg-white px-2 py-1 text-[11px] font-semibold text-slate-700">
                {item.icon}
              </p>
              <p className="mt-3 text-sm font-semibold text-slate-900">{item.code}</p>
              <p className="text-xs text-slate-600">{item.title}</p>
            </div>
          ))}
        </div>
        <p className="text-sm text-slate-700">Reliez au moins 4 liens logiques entre ODD 3, 4, 6, 12, 13, 17 et justifiez.</p>
        <textarea
          className="min-h-36 w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm"
          placeholder="Ecrivez vos liens et justifications..."
          value={typeof answers[ids.challenge1] === "string" ? String(answers[ids.challenge1]) : ""}
          onChange={(event) => setAnswers((prev) => ({ ...prev, [ids.challenge1]: event.target.value }))}
        />
      </Card>

      <Card className="space-y-4">
        <h2 className="font-display text-2xl text-slate-900">Defi visuel 2</h2>
        <Image
          src="/concours3/visual-diagnostic.svg"
          alt="Diagnostic visual"
          width={1400}
          height={700}
          className="h-auto w-full rounded-2xl border border-[var(--line)]"
        />
        <p className="text-sm text-slate-700">Quel plan d&apos;action repond au plus grand nombre d&apos;ODD?</p>
        <div className="grid gap-2">
          {challengeTwoOptions.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => setAnswers((prev) => ({ ...prev, [ids.challenge2]: option.key }))}
              className={`rounded-xl border px-3 py-2 text-left text-sm ${
                answers[ids.challenge2] === option.key
                  ? "border-[var(--brand)] bg-[var(--panel-soft)]"
                  : "border-[var(--line)] bg-white"
              }`}
            >
              {option.key}. {option.text}
            </button>
          ))}
        </div>
        <textarea
          className="min-h-24 w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm"
          placeholder="Justification de votre choix..."
          value={typeof answers[`${ids.challenge2}-note`] === "string" ? String(answers[`${ids.challenge2}-note`]) : ""}
          onChange={(event) => setAnswers((prev) => ({ ...prev, [`${ids.challenge2}-note`]: event.target.value }))}
        />
      </Card>

      <Button type="button" onClick={() => void submit()} disabled={submitting}>
        {submitting ? "Envoi..." : "Soumettre mes reponses"}
      </Button>

      <style jsx>{`
        .opening-stage {
          min-height: 220px;
        }

        .orb {
          position: absolute;
          border-radius: 9999px;
          filter: blur(4px);
          opacity: 0.75;
        }

        .orb-a {
          width: 190px;
          height: 190px;
          left: -30px;
          top: -40px;
          background: radial-gradient(circle at 30% 30%, #67e8f9, #0f172a);
          animation: driftA 4s ease-in-out infinite;
        }

        .orb-b {
          width: 170px;
          height: 170px;
          right: -20px;
          top: 30px;
          background: radial-gradient(circle at 40% 30%, #facc15, #0f172a);
          animation: driftB 4.8s ease-in-out infinite;
        }

        .orb-c {
          width: 160px;
          height: 160px;
          left: 40%;
          bottom: -70px;
          background: radial-gradient(circle at 40% 40%, #4ade80, #0f172a);
          animation: driftC 5.2s ease-in-out infinite;
        }

        @keyframes driftA {
          0%,
          100% {
            transform: translate(0, 0);
          }
          50% {
            transform: translate(18px, 12px);
          }
        }

        @keyframes driftB {
          0%,
          100% {
            transform: translate(0, 0);
          }
          50% {
            transform: translate(-12px, 16px);
          }
        }

        @keyframes driftC {
          0%,
          100% {
            transform: translate(0, 0);
          }
          50% {
            transform: translate(8px, -18px);
          }
        }
      `}</style>
    </div>
  );
}
