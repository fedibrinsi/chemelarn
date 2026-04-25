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
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [links, setLinks] = useState<Array<{ from: string; to: string }>>(() => {
    const saved = initialAnswers[ids.challenge1] ?? initialAnswers[`${ids.challenge1}-links`];
    return Array.isArray(saved) ? (saved as Array<{ from: string; to: string }>) : [];
  });
  const storageKey = `chemlearn:concours3:answers:${sessionId}`;

  const readyQuestions = useMemo(() => {
    return ids.questions.map((id, index) => ({ id, ...qcm[index] })).filter((item) => Boolean(item.prompt));
  }, [ids.questions]);

  useEffect(() => {
    const cached = window.localStorage.getItem(storageKey);
    if (!cached) return;
    try {
      const parsed = JSON.parse(cached) as Record<string, unknown>;
      setAnswers((prev) => ({ ...parsed, ...prev }));
      const cachedLinks = parsed[ids.challenge1] ?? parsed[`${ids.challenge1}-links`];
      if (Array.isArray(cachedLinks)) {
        setLinks(cachedLinks as Array<{ from: string; to: string }>);
      }
    } catch (error) {
      console.error("Failed to restore local answers", error);
    }
  }, [ids.challenge1, storageKey]);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(answers));
  }, [answers, storageKey]);

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

  const leftOdd = oddIcons.slice(0, 3);
  const rightOdd = oddIcons.slice(3);

  function addLink(from: string, to: string) {
    setLinks((prev) => {
      const exists = prev.some((link) => link.from === from && link.to === to);
      if (exists) return prev;
      const next = [...prev, { from, to }];
      setAnswers((current) => ({ ...current, [ids.challenge1]: next }));
      return next;
    });
  }

  function handleLeftPick(code: string) {
    if (selectedLeft === code) {
      setSelectedLeft(null);
      return;
    }
    setSelectedLeft(code);
    if (selectedRight) {
      addLink(code, selectedRight);
      setSelectedLeft(null);
      setSelectedRight(null);
    }
  }

  function handleRightPick(code: string) {
    if (selectedRight === code) {
      setSelectedRight(null);
      return;
    }
    setSelectedRight(code);
    if (selectedLeft) {
      addLink(selectedLeft, code);
      setSelectedLeft(null);
      setSelectedRight(null);
    }
  }

  function removeLink(index: number) {
    setLinks((prev) => {
      const next = prev.filter((_, i) => i !== index);
      setAnswers((current) => ({ ...current, [ids.challenge1]: next }));
      return next;
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Concours 3: ODD"
        description="Repondez a toutes les questions et soumettez vos reponses pour evaluation manuelle."
      />

      <Card className="space-y-4">
        <h2 className="font-display text-2xl text-slate-900">Animation d&apos;ouverture</h2>
        <div className="concours-stage relative overflow-hidden rounded-2xl border border-[var(--line)] bg-white p-5">
          <div className="concours-step step-1">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Situation</p>
            <h3 className="text-xl font-semibold text-slate-900">Le lycee fait face a 4 problemes</h3>
            <div className="step-layout">
              <ul className="problem-grid">
                <li className="problem-card">Bouteilles jetables</li>
                <li className="problem-card">Gaspillage d&apos;energie</li>
                <li className="problem-card">Fuites d&apos;eau</li>
                <li className="problem-card">Faible engagement des eleves</li>
              </ul>
              <div className="illustration-panel" aria-hidden="true">
                <svg viewBox="0 0 220 180" role="presentation" className="illustration-svg">
                  <rect x="8" y="12" width="204" height="156" rx="18" fill="#f8fafc" stroke="#e2e8f0" />
                  <rect x="24" y="26" width="172" height="36" rx="12" fill="#e2e8f0" />
                  <circle cx="44" cy="96" r="16" fill="#93c5fd" />
                  <path d="M44 82 C38 92, 34 98, 44 112 C54 98, 50 92, 44 82" fill="#2563eb" />
                  <rect x="80" y="82" width="20" height="36" rx="6" fill="#facc15" />
                  <path d="M90 74 L96 86 L84 86 Z" fill="#ca8a04" />
                  <rect x="122" y="78" width="28" height="44" rx="8" fill="#f97316" />
                  <circle cx="136" cy="74" r="10" fill="#fb923c" />
                  <rect x="160" y="84" width="32" height="32" rx="10" fill="#a3e635" />
                  <circle cx="172" cy="96" r="6" fill="#4d7c0f" />
                  <circle cx="186" cy="96" r="6" fill="#4d7c0f" />
                </svg>
                <p className="illustration-caption">Diagnostic rapide des problemes.</p>
              </div>
            </div>
          </div>

          <div className="concours-step step-2">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Tableau d&apos;actions</p>
            <h3 className="text-xl font-semibold text-slate-900">4 actions concretes</h3>
            <div className="step-layout">
              <div className="action-grid">
                <div className="action-card">Installation de fontaines + gourdes</div>
                <div className="action-card">Reparation des fuites</div>
                <div className="action-card">Tri + compost</div>
                <div className="action-card">Extinction intelligente / LED</div>
              </div>
              <div className="illustration-panel" aria-hidden="true">
                <svg viewBox="0 0 220 180" role="presentation" className="illustration-svg">
                  <rect x="8" y="12" width="204" height="156" rx="18" fill="#f1f5f9" stroke="#e2e8f0" />
                  <rect x="26" y="30" width="168" height="32" rx="12" fill="#dbeafe" />
                  <rect x="32" y="78" width="64" height="76" rx="12" fill="#bfdbfe" />
                  <path d="M64 92 C56 104, 56 122, 64 134 C72 122, 72 104, 64 92" fill="#2563eb" />
                  <rect x="110" y="78" width="80" height="28" rx="10" fill="#bbf7d0" />
                  <rect x="110" y="114" width="80" height="40" rx="10" fill="#fde68a" />
                </svg>
                <p className="illustration-caption">Plan d&apos;actions coordonnees.</p>
              </div>
            </div>
          </div>

          <div className="concours-step step-3">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Effets</p>
            <h3 className="text-xl font-semibold text-slate-900">Les impacts positifs</h3>
            <div className="step-layout">
              <div className="effects-grid">
                <div className="effect-pill">Moins de dechets</div>
                <div className="effect-pill">Moins d&apos;eau gaspillee</div>
                <div className="effect-pill">Moins de depenses</div>
                <div className="effect-pill">Plus de participation</div>
              </div>
              <div className="illustration-panel" aria-hidden="true">
                <svg viewBox="0 0 220 180" role="presentation" className="illustration-svg">
                  <rect x="8" y="12" width="204" height="156" rx="18" fill="#ecfccb" stroke="#d9f99d" />
                  <circle cx="60" cy="94" r="22" fill="#22c55e" />
                  <path d="M54 94 L60 100 L70 88" stroke="#f8fafc" strokeWidth="6" fill="none" strokeLinecap="round" />
                  <rect x="100" y="70" width="90" height="18" rx="8" fill="#bbf7d0" />
                  <rect x="100" y="98" width="70" height="18" rx="8" fill="#bbf7d0" />
                  <rect x="100" y="126" width="80" height="18" rx="8" fill="#bbf7d0" />
                </svg>
                <p className="illustration-caption">Resultats visibles sur le campus.</p>
              </div>
            </div>
          </div>

          <div className="concours-step step-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Final</p>
            <h3 className="text-xl font-semibold text-slate-900">La roue ODD apparait</h3>
            <div className="odd-wheel" aria-hidden="true" />
            <p className="mt-3 text-sm text-slate-600">Les actions convergent vers les ODD.</p>
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
          </div>
        ))}
      </Card>

      <Card className="space-y-4">
        <h2 className="font-display text-2xl text-slate-900">Defi visuel 1</h2>
        <p className="text-sm text-slate-700">
          Reliez au moins 4 liens logiques entre ODD 3, 4, 6, 12, 13, 17 et justifiez.
        </p>
        <div className="odd-linker">
          <div className="odd-column">
            <p className="column-title">Partie gauche</p>
            {leftOdd.map((item) => (
              <button
                key={item.code}
                type="button"
                onClick={() => handleLeftPick(item.code)}
                className={`odd-card ${selectedLeft === item.code ? "odd-card-active" : ""}`}
              >
                <span className="odd-badge">{item.icon}</span>
                <span className="odd-code">{item.code}</span>
                <span className="odd-title">{item.title}</span>
              </button>
            ))}
          </div>
          <div className="odd-column">
            <p className="column-title">Partie droite</p>
            {rightOdd.map((item) => (
              <button
                key={item.code}
                type="button"
                onClick={() => handleRightPick(item.code)}
                className={`odd-card ${selectedRight === item.code ? "odd-card-active" : ""}`}
              >
                <span className="odd-badge">{item.icon}</span>
                <span className="odd-code">{item.code}</span>
                <span className="odd-title">{item.title}</span>
              </button>
            ))}
          </div>
          <div className="odd-links">
            <p className="column-title">Liens valides</p>
            {links.length === 0 ? (
              <p className="empty-links">Cliquez un ODD a gauche puis un ODD a droite.</p>
            ) : (
              <ul className="links-list">
                {links.map((link, index) => (
                  <li key={`${link.from}-${link.to}-${index}`}>
                    <span>{link.from}</span>
                    <span className="link-arrow">→</span>
                    <span>{link.to}</span>
                    <button type="button" className="link-remove" onClick={() => removeLink(index)}>
                      Retirer
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
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
      </Card>

      <Button type="button" onClick={() => void submit()} disabled={submitting}>
        {submitting ? "Envoi..." : "Soumettre mes reponses"}
      </Button>

      <style jsx>{`
        .concours-stage {
          min-height: 420px;
          background: linear-gradient(135deg, #f8fafc 0%, #eef2ff 50%, #fef9c3 100%);
        }

        .concours-step {
          position: absolute;
          inset: 20px;
          opacity: 0;
          transform: translateY(12px);
          animation: stepShow 20s infinite;
        }

        .step-1 {
          animation-delay: 0s;
        }

        .step-2 {
          animation-delay: 5s;
        }

        .step-3 {
          animation-delay: 10s;
        }

        .step-4 {
          animation-delay: 15s;
          text-align: center;
        }

        .problem-grid {
          margin-top: 16px;
          display: grid;
          gap: 10px;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          list-style: none;
          padding: 0;
        }

        .step-layout {
          margin-top: 14px;
          display: grid;
          gap: 18px;
          align-items: center;
          grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
        }

        .problem-card {
          border-radius: 16px;
          border: 1px solid rgba(15, 23, 42, 0.1);
          background: rgba(255, 255, 255, 0.9);
          padding: 12px 14px;
          font-size: 14px;
        }

        .illustration-panel {
          border-radius: 18px;
          border: 1px solid rgba(15, 23, 42, 0.08);
          background: rgba(255, 255, 255, 0.7);
          padding: 12px;
          box-shadow: 0 12px 24px rgba(15, 23, 42, 0.08);
          text-align: center;
        }

        .illustration-svg {
          width: 100%;
          height: auto;
          max-height: 220px;
          display: block;
        }

        .illustration-caption {
          margin-top: 8px;
          font-size: 12px;
          color: #475569;
        }

        .action-grid {
          margin-top: 16px;
          display: grid;
          gap: 12px;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        }

        .action-card {
          border-radius: 18px;
          border: 1px solid rgba(59, 130, 246, 0.2);
          background: rgba(239, 246, 255, 0.95);
          padding: 14px 16px;
          font-size: 14px;
          font-weight: 600;
          color: #1e3a8a;
          box-shadow: inset 0 0 0 1px rgba(59, 130, 246, 0.12);
        }

        .effects-grid {
          margin-top: 18px;
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }

        .effect-pill {
          border-radius: 999px;
          background: rgba(34, 197, 94, 0.15);
          color: #166534;
          padding: 10px 16px;
          font-size: 13px;
          font-weight: 600;
          border: 1px solid rgba(22, 101, 52, 0.2);
        }

        .odd-wheel {
          margin: 18px auto 0;
          width: 160px;
          height: 160px;
          border-radius: 999px;
          background: conic-gradient(
            #ef4444 0deg 36deg,
            #f97316 36deg 72deg,
            #eab308 72deg 108deg,
            #22c55e 108deg 144deg,
            #14b8a6 144deg 180deg,
            #0ea5e9 180deg 216deg,
            #3b82f6 216deg 252deg,
            #6366f1 252deg 288deg,
            #a855f7 288deg 324deg,
            #ec4899 324deg 360deg
          );
          position: relative;
          animation: wheelSpin 6s linear infinite;
          box-shadow: 0 14px 30px rgba(15, 23, 42, 0.25);
        }

        .odd-wheel::after {
          content: "";
          position: absolute;
          inset: 24px;
          border-radius: 999px;
          background: #ffffff;
          box-shadow: inset 0 0 0 1px rgba(15, 23, 42, 0.08);
        }

        .odd-linker {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
        }

        .odd-column,
        .odd-links {
          border-radius: 16px;
          border: 1px solid rgba(15, 23, 42, 0.08);
          background: rgba(255, 255, 255, 0.85);
          padding: 12px;
          display: grid;
          gap: 10px;
        }

        .column-title {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: #64748b;
        }

        .odd-card {
          display: grid;
          gap: 6px;
          text-align: left;
          border-radius: 14px;
          border: 1px solid rgba(226, 232, 240, 1);
          background: #fef3e2;
          padding: 12px;
          transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .odd-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(15, 23, 42, 0.1);
        }

        .odd-card-active {
          border-color: #2563eb;
          box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
        }

        .odd-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          border: 1px solid rgba(226, 232, 240, 1);
          background: #ffffff;
          padding: 2px 10px;
          font-size: 11px;
          font-weight: 600;
          color: #0f172a;
          width: fit-content;
        }

        .odd-code {
          font-size: 14px;
          font-weight: 700;
          color: #0f172a;
        }

        .odd-title {
          font-size: 12px;
          color: #475569;
        }

        .empty-links {
          font-size: 13px;
          color: #64748b;
        }

        .links-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: grid;
          gap: 8px;
          font-size: 13px;
          color: #0f172a;
        }

        .links-list li {
          display: grid;
          grid-template-columns: auto auto auto 1fr;
          gap: 8px;
          align-items: center;
        }

        .link-arrow {
          color: #2563eb;
        }

        .link-remove {
          justify-self: end;
          border: none;
          background: none;
          color: #ef4444;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
        }

        @keyframes stepShow {
          0% {
            opacity: 0;
            transform: translateY(12px);
          }
          5% {
            opacity: 1;
            transform: translateY(0);
          }
          25% {
            opacity: 1;
            transform: translateY(0);
          }
          30% {
            opacity: 0;
            transform: translateY(-8px);
          }
          100% {
            opacity: 0;
            transform: translateY(-8px);
          }
        }

        @keyframes wheelSpin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 768px) {
          .step-layout {
            grid-template-columns: 1fr;
          }

          .concours-stage {
            min-height: 520px;
          }

          .odd-linker {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
