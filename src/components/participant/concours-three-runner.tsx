"use client";

import { useEffect, useMemo, useState } from "react";
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
  { key: "A", text: "Seulement des oceans" },
  { key: "B", text: "D'objets plastiques qui se fragmentent et d'autres sources" },
  { key: "C", text: "Seulement du verre" },
];

const qcm: Array<{ prompt: string; options: Option[] }> = [
  {
    prompt: "Q1. Les microplastiques sont:",
    options: [
      { key: "A", text: "De tres petites particules plastiques, jusqu'a 5 mm" },
      { key: "B", text: "Des morceaux de metal" },
      { key: "C", text: "Des gouttes d'eau" },
    ],
  },
  {
    prompt: "Q2. Les microplastiques peuvent provenir:",
    options: [
      { key: "A", text: "De la fragmentation d'objets plastiques plus grands" },
      { key: "B", text: "Seulement des nuages" },
      { key: "C", text: "Seulement du sable" },
    ],
  },
  {
    prompt: "Q3. Un megot jete dans l'environnement:",
    options: [
      { key: "A", text: "Peut liberer des substances toxiques et se fragmenter en microplastiques" },
      { key: "B", text: "Devient immediatement du compost" },
      { key: "C", text: "N'a aucun effet" },
    ],
  },
  {
    prompt: "Q4. Selon l'OMS, l'exposition humaine aux microplastiques peut se faire notamment par:",
    options: [
      { key: "A", text: "Ingestion et inhalation" },
      { key: "B", text: "Seulement par la vue" },
      { key: "C", text: "Seulement par l'ecriture" },
    ],
  },
  {
    prompt: "Q5. Les dangers potentiels associes aux microplastiques peuvent concerner:",
    options: [
      { key: "A", text: "Les particules, les substances chimiques et des biofilms" },
      { key: "B", text: "Seulement la couleur" },
      { key: "C", text: "Seulement la temperature" },
    ],
  },
  {
    prompt: "Q6. Dire \"on connait deja tous les effets sanitaires avec certitude\" est:",
    options: [
      { key: "A", text: "Faux" },
      { key: "B", text: "Vrai" },
      { key: "C", text: "Obligatoire" },
    ],
  },
  {
    prompt: "Q7. Les plastiques se recyclent tous ensemble sans difficulte:",
    options: [
      { key: "A", text: "Vrai" },
      { key: "B", text: "Faux" },
      { key: "C", text: "Seulement la nuit" },
    ],
  },
  {
    prompt: "Q8. Un megot peut polluer:",
    options: [
      { key: "A", text: "Environ 500 litres d'eau" },
      { key: "B", text: "5 litres d'eau seulement" },
      { key: "C", text: "0 litre" },
    ],
  },
  {
    prompt: "Q9. Les megots representent dans le support fourni:",
    options: [
      { key: "A", text: "Pres de 40 % des dechets presents en mer Mediterranee" },
      { key: "B", text: "1 %" },
      { key: "C", text: "0 %" },
    ],
  },
  {
    prompt: "Q10. Parmi ces sources, laquelle est reconnue comme importante pour les microplastiques ?",
    options: [
      { key: "A", text: "L'usure des pneus" },
      { key: "B", text: "Les nuages uniquement" },
      { key: "C", text: "Les roches magnetiques" },
    ],
  },
  {
    prompt: "Q11. Les textiles synthetiques peuvent contribuer aux microplastiques:",
    options: [
      { key: "A", text: "Oui, via des microfibres" },
      { key: "B", text: "Non, jamais" },
      { key: "C", text: "Seulement s'ils sont en coton pur" },
    ],
  },
  {
    prompt: "Q12. La meilleure strategie generale face aux microplastiques est:",
    options: [
      { key: "A", text: "Prevenir a la source et mieux gerer les dechets" },
      { key: "B", text: "Attendre que tout disparaisse seul" },
      { key: "C", text: "Melanger tous les dechets ensemble" },
    ],
  },
  {
    prompt: "Q13. Boire dans une gourde durable et eviter les plastiques jetables quand c'est possible:",
    options: [
      { key: "A", text: "Peut aider a reduire la production de dechets plastiques" },
      { key: "B", text: "Augmente toujours les dechets" },
      { key: "C", text: "N'a aucun lien" },
    ],
  },
  {
    prompt: "Q14. Un lycee qui veut limiter la dispersion de microplastiques devrait:",
    options: [
      { key: "A", text: "Reduire les dechets abandonnes et renforcer le tri" },
      { key: "B", text: "Laisser les dechets dans la cour" },
      { key: "C", text: "Bruler les plastiques sur place" },
    ],
  },
  {
    prompt: "Q15. Les microplastiques sont retrouves:",
    options: [
      { key: "A", text: "Dans l'eau, l'air et les sols" },
      { key: "B", text: "Seulement dans les livres" },
      { key: "C", text: "Seulement dans les metaux" },
    ],
  },
  {
    prompt: "Q16. La phrase la plus juste aujourd'hui est:",
    options: [
      {
        key: "A",
        text: "Il existe des preoccupations de sante, mais la recherche continue pour preciser plusieurs effets",
      },
      { key: "B", text: "Il n'y a aucune question de sante" },
      { key: "C", text: "Tout est deja totalement prouve dans le moindre detail" },
    ],
  },
  {
    prompt: "Q17. Une politique efficace contre les microplastiques agit:",
    options: [
      { key: "A", text: "Sur tout le cycle de vie des plastiques" },
      { key: "B", text: "Seulement au moment ou l'objet est achete" },
      { key: "C", text: "Seulement en mer" },
    ],
  },
  {
    prompt: "Q18. Le meilleur message final pour ce concours est:",
    options: [
      { key: "A", text: "\"Invisible ne veut pas dire sans importance\"" },
      { key: "B", text: "\"Ce qui est petit n'a jamais d'effet\"" },
      { key: "C", text: "\"Plus de plastique jete = moins de pollution\"" },
    ],
  },
  {
    prompt: "Q19. Les microplastiques secondaires proviennent surtout:",
    options: [
      { key: "A", text: "De la fragmentation d'objets plus grands" },
      { key: "B", text: "Seulement de roches naturelles" },
      { key: "C", text: "Du verre fondu" },
    ],
  },
  {
    prompt: "Q20. Les microplastiques primaires sont:",
    options: [
      { key: "A", text: "Des particules deja petites au depart" },
      { key: "B", text: "Seulement des bouteilles cassees" },
      { key: "C", text: "Des metaux tres fins" },
    ],
  },
  {
    prompt: "Q21. Une source importante de microplastiques dans l'environnement est:",
    options: [
      { key: "A", text: "L'usure des pneus" },
      { key: "B", text: "Les feuilles d'arbres" },
      { key: "C", text: "Le verre recycle" },
    ],
  },
  {
    prompt: "Q22. Les textiles synthetiques peuvent liberer:",
    options: [
      { key: "A", text: "Des microfibres plastiques" },
      { key: "B", text: "De la pierre" },
      { key: "C", text: "Du carton" },
    ],
  },
  {
    prompt: "Q23. Les microplastiques peuvent etre presents:",
    options: [
      { key: "A", text: "Dans l'air, l'eau et les sols" },
      { key: "B", text: "Seulement dans les oceans" },
      { key: "C", text: "Seulement dans les usines" },
    ],
  },
  {
    prompt: "Q24. Le risque lie aux microplastiques est etudie car ils peuvent:",
    options: [
      { key: "A", text: "Entrer dans la chaine alimentaire et exposer les humains" },
      { key: "B", text: "Disparaitre immediatement" },
      { key: "C", text: "Se transformer automatiquement en compost" },
    ],
  },
  {
    prompt: "Q25. Selon l'OMS, parler des effets sanitaires des microplastiques demande:",
    options: [
      { key: "A", text: "Prudence scientifique" },
      { key: "B", text: "Aucune nuance" },
      { key: "C", text: "Des certitudes absolues sur tout" },
    ],
  },
  {
    prompt: "Q26. Une bonne strategie de prevention est:",
    options: [
      { key: "A", text: "Reduire l'usage inutile du plastique et mieux gerer les dechets" },
      { key: "B", text: "Jeter les plastiques dans la nature" },
      { key: "C", text: "Melanger tous les dechets" },
    ],
  },
  {
    prompt: "Q27. Les megots sont problematiques car ils:",
    options: [
      { key: "A", text: "Peuvent relacher des substances toxiques et contribuer aux microplastiques" },
      { key: "B", text: "Se transforment vite en compost" },
      { key: "C", text: "N'ont pas d'impact notable" },
    ],
  },
  {
    prompt: "Q28. Dire \"un dechet plastique abandonne est sans consequence s'il est petit\" est:",
    options: [
      { key: "A", text: "Faux" },
      { key: "B", text: "Vrai" },
      { key: "C", text: "Exact seulement en ville" },
    ],
  },
  {
    prompt: "Q29. Les systemes de traitement de l'eau peuvent:",
    options: [
      { key: "A", text: "Retenir une partie des microplastiques" },
      { key: "B", text: "Tout laisser passer obligatoirement" },
      { key: "C", text: "Creer du plastique a partir de l'eau" },
    ],
  },
  {
    prompt: "Q30. Le lien entre microplastiques et sante humaine est etudie notamment via:",
    options: [
      { key: "A", text: "L'exposition par boisson, alimentation et air" },
      { key: "B", text: "Uniquement la couleur des plastiques" },
      { key: "C", text: "Seulement l'odeur des dechets" },
    ],
  },
  {
    prompt: "Q31. Un lycee qui veut reduire son impact plastique devrait d'abord:",
    options: [
      { key: "A", text: "Agir sur les dechets a la source" },
      { key: "B", text: "Attendre sans rien faire" },
      { key: "C", text: "Remplacer le tri par des affiches seules" },
    ],
  },
  {
    prompt: "Q32. Le recyclage du plastique est utile mais:",
    options: [
      { key: "A", text: "Il ne suffit pas a lui seul" },
      { key: "B", text: "Il rend inutile toute prevention" },
      { key: "C", text: "Il marche pareil pour tous les plastiques melanges" },
    ],
  },
  {
    prompt: "Q33. La taille tres petite des microplastiques pose probleme car:",
    options: [
      { key: "A", text: "Ils sont difficiles a reperer et a suivre" },
      { key: "B", text: "Ils deviennent du metal" },
      { key: "C", text: "Ils ne circulent nulle part" },
    ],
  },
  {
    prompt: "Q34. Le message \"Invisible ne veut pas dire inoffensif\" s'applique ici car:",
    options: [
      { key: "A", text: "Les particules sont petites mais potentiellement preoccupantes" },
      { key: "B", text: "Tout ce qui est petit est forcement sans effet" },
      { key: "C", text: "Les microplastiques n'existent pas" },
    ],
  },
  {
    prompt: "Q35. Une bonne action de sensibilisation au lycee serait:",
    options: [
      { key: "A", text: "Expliquer les sources, les voies d'exposition et les gestes de reduction" },
      { key: "B", text: "Dire seulement \"le plastique c'est mal\" sans explication" },
      { key: "C", text: "Ne parler que des oceans" },
    ],
  },
  {
    prompt: "Q36. Le cycle de vie du plastique comprend:",
    options: [
      { key: "A", text: "Production, usage, dechets et dispersion eventuelle" },
      { key: "B", text: "Seulement l'achat" },
      { key: "C", text: "Seulement le recyclage" },
    ],
  },
  {
    prompt: "Q37. Un exemple d'action individuelle realiste est:",
    options: [
      { key: "A", text: "Eviter le jetable quand une alternative durable existe" },
      { key: "B", text: "Jeter les dechets hors des poubelles" },
      { key: "C", text: "Bruler le plastique chez soi" },
    ],
  },
  {
    prompt: "Q38. Le principal enjeu scientifique aujourd'hui n'est pas seulement de detecter les microplastiques, mais aussi:",
    options: [
      { key: "A", text: "De mieux comprendre leurs effets et les expositions reelles" },
      { key: "B", text: "De changer leur couleur" },
      { key: "C", text: "De les rendre visibles a l'oeil nu uniquement" },
    ],
  },
  {
    prompt: "Q39. Une politique efficace contre les microplastiques combine:",
    options: [
      { key: "A", text: "Prevention, collecte, tri, reduction et sensibilisation" },
      { key: "B", text: "Une seule affiche" },
      { key: "C", text: "Un seul nettoyage annuel" },
    ],
  },
  {
    prompt: "Q40. La meilleure conclusion pour ce concours est:",
    options: [
      { key: "A", text: "Reduire la pollution plastique aide aussi a proteger la sante et l'environnement" },
      { key: "B", text: "Les microplastiques sont trop petits pour compter" },
      { key: "C", text: "La prevention ne sert a rien" },
    ],
  },
  {
    prompt: "Q41. Un lycee veut reduire l'exposition potentielle aux microplastiques. Quelle action est la plus pertinente en priorite ?",
    options: [
      { key: "A", text: "Remplacer seulement les affiches plastifiees par du papier" },
      { key: "B", text: "Reduire les plastiques jetables, mieux trier, et limiter l'abandon de dechets sur le site" },
      { key: "C", text: "Fermer la bibliotheque" },
    ],
  },
  {
    prompt: "Q42. Pourquoi une strategie \"nettoyer seulement en fin de chaine\" est-elle insuffisante ?",
    options: [
      { key: "A", text: "Parce qu'elle ne traite pas les sources de production et de dispersion" },
      { key: "B", text: "Parce que le nettoyage est toujours inutile" },
      { key: "C", text: "Parce que les dechets disparaissent seuls" },
    ],
  },
  {
    prompt: "Q43. Quel scenario reflete le mieux une logique de prevention ?",
    options: [
      { key: "A", text: "Reduire les emballages inutiles, ameliorer la collecte, sensibiliser les usagers" },
      { key: "B", text: "Produire autant puis esperer recycler parfaitement" },
      { key: "C", text: "Attendre que la pollution soit visible avant d'agir" },
    ],
  },
  {
    prompt: "Q44. Dans une analyse de sante publique, pourquoi faut-il distinguer danger et exposition ?",
    options: [
      {
        key: "A",
        text: "Parce qu'un materiau potentiellement dangereux n'entraine pas automatiquement le meme risque pour tous sans tenir compte du niveau et de la voie d'exposition",
      },
      { key: "B", text: "Parce qu'ils signifient exactement la meme chose" },
      { key: "C", text: "Parce que l'exposition n'a aucun role" },
    ],
  },
  {
    prompt: "Q45. Pourquoi l'usure des pneus est-elle un enjeu important dans le debat sur les microplastiques ?",
    options: [
      { key: "A", text: "Parce qu'elle constitue l'une des sources abondantes de particules rejetees dans l'environnement" },
      { key: "B", text: "Parce qu'un pneu est biodegradable" },
      { key: "C", text: "Parce qu'elle ne concerne que les routes desertes" },
    ],
  },
  {
    prompt: "Q46. Un etablissement veut acheter des uniformes. Quel critere est le plus coherent avec une approche \"microplastiques + sante + durabilite\" ?",
    options: [
      { key: "A", text: "Choisir uniquement le prix le plus bas, sans autre critere" },
      { key: "B", text: "Evaluer aussi la durabilite, l'entretien, la composition textile et la logique de circularite" },
      { key: "C", text: "Changer d'uniforme tous les mois" },
    ],
  },
  {
    prompt: "Q47. Quelle affirmation montre la meilleure comprehension scientifique actuelle ?",
    options: [
      { key: "A", text: "Tous les effets des microplastiques sur la sante humaine sont deja connus avec certitude" },
      { key: "B", text: "Il existe des preoccupations serieuses, mais plusieurs mecanismes et niveaux de risque doivent encore etre mieux documentes" },
      { key: "C", text: "Les microplastiques sont sans interet pour la sante publique" },
    ],
  },
  {
    prompt: "Q48. Quel exemple illustre le mieux une \"source secondaire\" de microplastiques ?",
    options: [
      { key: "A", text: "Une bouteille abandonnee qui se fragmente au soleil et avec l'usure" },
      { key: "B", text: "Une microbille deja fabriquee a tres petite taille" },
      { key: "C", text: "Une molecule d'eau" },
    ],
  },
  {
    prompt: "Q49. Pourquoi les microplastiques posent-ils un defi methodologique pour la recherche ?",
    options: [
      { key: "A", text: "Parce qu'ils sont petits, heterogenes, et presents dans des milieux varies, ce qui complique leur mesure et la comparaison des etudes" },
      { key: "B", text: "Parce qu'ils sont faciles a voir partout a l'oeil nu" },
      { key: "C", text: "Parce qu'ils ont tous la meme forme et la meme composition" },
    ],
  },
  {
    prompt: "Q50. Une politique centree uniquement sur le recyclage a quelle limite principale ?",
    options: [
      { key: "A", text: "Elle ne suffit pas si la production, l'usage jetable et les fuites dans l'environnement continuent au meme rythme" },
      { key: "B", text: "Elle supprime automatiquement toute pollution" },
      { key: "C", text: "Elle rend inutile toute reduction a la source" },
    ],
  },
  {
    prompt: "Q51. Quel raisonnement est le plus solide ?",
    options: [
      { key: "A", text: "\"Comme la science n'a pas tout prouve, il ne faut rien faire.\"" },
      { key: "B", text: "\"Meme avec des incertitudes, on peut mettre en place des mesures raisonnables de prevention.\"" },
      { key: "C", text: "\"Il faut interdire immediatement tout materiau sans analyse.\"" },
    ],
  },
  {
    prompt: "Q52. Dans quel cas parle-t-on le plus d'une approche \"cycle de vie\" du plastique ?",
    options: [
      { key: "A", text: "Quand on etudie production, usage, dechets, dispersion et impacts" },
      { key: "B", text: "Quand on regarde seulement le moment ou l'objet est achete" },
      { key: "C", text: "Quand on observe uniquement la couleur du materiau" },
    ],
  },
  {
    prompt: "Q53. Pourquoi les microfibres textiles interessent-elles particulierement les chercheurs ?",
    options: [
      { key: "A", text: "Parce qu'elles peuvent etre liberees tout au long de l'usage et de l'entretien des textiles synthetiques" },
      { key: "B", text: "Parce qu'elles n'existent que dans les laboratoires" },
      { key: "C", text: "Parce qu'elles sont toujours visibles au microscope scolaire simple" },
    ],
  },
  {
    prompt: "Q54. Une ville remplace les bouteilles jetables dans les batiments publics par des fontaines et contenants reutilisables. Quel effet est le plus plausible ?",
    options: [
      { key: "A", text: "Reduction de certains dechets plastiques a usage unique" },
      { key: "B", text: "Augmentation automatique des microplastiques dans l'air" },
      { key: "C", text: "Disparition immediate de toute pollution plastique" },
    ],
  },
  {
    prompt: "Q55. Quelle proposition montre le meilleur esprit critique ?",
    options: [
      { key: "A", text: "\"Les microplastiques sont presents dans plusieurs milieux ; il faut hierarchiser les sources et les expositions avant de conclure.\"" },
      { key: "B", text: "\"Toute particule plastique provoque necessairement le meme effet chez tout le monde.\"" },
      { key: "C", text: "\"Si une particule est petite, elle est forcement sans importance.\"" },
    ],
  },
  {
    prompt: "Q56. Pourquoi l'abandon de dechets plastiques dans l'espace public reste-t-il un probleme meme quand le dechet parait \"petit\" ?",
    options: [
      { key: "A", text: "Parce qu'il peut se fragmenter, disperser des particules et compliquer la gestion environnementale" },
      { key: "B", text: "Parce qu'un petit dechet nettoie parfois le sol" },
      { key: "C", text: "Parce qu'il se transforme en compost" },
    ],
  },
  {
    prompt: "Q57. Une campagne scolaire veut etre scientifiquement honnete. Quelle formule est la meilleure ?",
    options: [
      { key: "A", text: "\"Les microplastiques sont un sujet etudie de pres ; on connait des voies d'exposition et des preoccupations, mais la recherche continue pour preciser certains effets.\"" },
      { key: "B", text: "\"Tout est deja demontre dans le detail, il n'y a plus rien a etudier.\"" },
      { key: "C", text: "\"Comme il existe des incertitudes, le sujet n'a aucune importance.\"" },
    ],
  },
  {
    prompt: "Q58. Quel ensemble d'indicateurs serait le plus utile pour suivre un plan \"plastique et sante\" dans un lycee ?",
    options: [
      { key: "A", text: "Nombre de bouteilles jetables utilisees, qualite du tri, taux d'equipement en contenants reutilisables, participation des eleves" },
      { key: "B", text: "Couleur des murs, taille des fenetres, sonnerie du matin" },
      { key: "C", text: "Nombre de messages sur les reseaux sociaux seulement" },
    ],
  },
  {
    prompt: "Q59. Quelle action a le plus de chances de produire un effet durable ?",
    options: [
      { key: "A", text: "Une journee symbolique sans suite" },
      { key: "B", text: "Un plan combinant achats responsables, reduction du jetable, tri, sensibilisation et suivi" },
      { key: "C", text: "Une affiche sans changement de pratiques" },
    ],
  },
  {
    prompt: "Q60. La conclusion la plus rigoureuse pour ce concours est:",
    options: [
      { key: "A", text: "Les microplastiques constituent un enjeu environnemental et sanitaire plausible qui demande prevention, recherche continue et meilleure gestion des plastiques" },
      { key: "B", text: "Les microplastiques ne concernent que les oceans lointains" },
      { key: "C", text: "Le seul sujet important est le recyclage final" },
    ],
  },
];

const challengeOneItems = [
  { id: "pneu", label: "Pneu" },
  { id: "microbilles", label: "Microbilles cosmetiques" },
  { id: "textile", label: "Textile synthetique" },
  { id: "bouteille", label: "Bouteille plastique cassee" },
  { id: "sac", label: "Sac plastique fragmente" },
  { id: "peinture", label: "Peinture ecaillee" },
] as const;

const challengeOneCategories = [
  { key: "primary", label: "Source primaire" },
  { key: "secondary", label: "Source secondaire" },
] as const;

const challengeTwoSteps = [
  { id: "produit", label: "Produit plastique" },
  { id: "usure", label: "Usure / fragmentation" },
  { id: "environnement", label: "Microplastiques dans l'environnement" },
  { id: "milieux", label: "Presence dans eau / air / aliments" },
  { id: "exposition", label: "Exposition humaine possible" },
  { id: "prevention", label: "Necessite de prevention" },
] as const;

export function ConcoursThreeRunner({ sessionId, status, ids, initialAnswers }: ConcoursThreeRunnerProps) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, unknown>>(initialAnswers);
  const [submitting, setSubmitting] = useState(false);
  const [sourceAnswers, setSourceAnswers] = useState<Record<string, "primary" | "secondary">>(() => {
    const saved = initialAnswers[ids.challenge1];
    if (saved && typeof saved === "object" && !Array.isArray(saved)) {
      return saved as Record<string, "primary" | "secondary">;
    }
    return {};
  });
  const [challengeTwoOrder, setChallengeTwoOrder] = useState<string[]>(() => {
    const saved = initialAnswers[ids.challenge2];
    if (Array.isArray(saved) && saved.length) {
      return saved.map(String);
    }
    return challengeTwoSteps.map((step) => step.id);
  });
  const storageKey = `chemlearn:concours2:answers:${sessionId}`;

  const readyQuestions = useMemo(() => {
    return ids.questions.map((id, index) => ({ id, ...qcm[index] })).filter((item) => Boolean(item.prompt));
  }, [ids.questions]);

  useEffect(() => {
    const cached = window.localStorage.getItem(storageKey);
    if (!cached) return;
    try {
      const parsed = JSON.parse(cached) as Record<string, unknown>;
      setAnswers((prev) => ({ ...parsed, ...prev }));
      const cachedSources = parsed[ids.challenge1];
      if (cachedSources && typeof cachedSources === "object" && !Array.isArray(cachedSources)) {
        setSourceAnswers(cachedSources as Record<string, "primary" | "secondary">);
      }
      const cachedOrder = parsed[ids.challenge2];
      if (Array.isArray(cachedOrder) && cachedOrder.length) {
        setChallengeTwoOrder(cachedOrder.map(String));
      }
    } catch (error) {
      console.error("Failed to restore local answers", error);
    }
  }, [ids.challenge1, ids.challenge2, storageKey]);

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

  const orderedSteps = challengeTwoOrder
    .map((id) => challengeTwoSteps.find((step) => step.id === id))
    .filter(Boolean) as Array<(typeof challengeTwoSteps)[number]>;

  function handleSourcePick(itemId: string, category: "primary" | "secondary") {
    setSourceAnswers((prev) => {
      const next = { ...prev, [itemId]: category };
      setAnswers((current) => ({ ...current, [ids.challenge1]: next }));
      return next;
    });
  }

  function moveStep(index: number, direction: -1 | 1) {
    setChallengeTwoOrder((prev) => {
      const next = [...prev];
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= next.length) return prev;
      const [moved] = next.splice(index, 1);
      next.splice(targetIndex, 0, moved);
      setAnswers((current) => ({ ...current, [ids.challenge2]: next }));
      return next;
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Concours 2: Microplastiques et impact sur la sante"
        description="Repondez a toutes les questions et soumettez vos reponses pour evaluation manuelle."
      />

      <Card className="space-y-4">
        <h2 className="font-display text-2xl text-slate-900">Animation d&apos;ouverture</h2>
        <div className="concours-stage relative overflow-hidden rounded-2xl border border-[var(--line)] bg-white p-5">
          <div className="concours-step step-1">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Observation</p>
            <h3 className="text-xl font-semibold text-slate-900">Zoom sur des objets du quotidien</h3>
            <div className="step-layout">
              <ul className="problem-grid">
                <li className="problem-card">Bouteille plastique</li>
                <li className="problem-card">Megot</li>
                <li className="problem-card">Textile synthetique</li>
                <li className="problem-card">Pneu</li>
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
                <p className="illustration-caption">Sources visibles a l&apos;oeil nu.</p>
              </div>
            </div>
          </div>

          <div className="concours-step step-2">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Fragmentation</p>
            <h3 className="text-xl font-semibold text-slate-900">Des particules de plus en plus fines</h3>
            <div className="step-layout">
              <div className="action-grid">
                <div className="action-card">Usure mecanique</div>
                <div className="action-card">UV + soleil</div>
                <div className="action-card">Frottements</div>
                <div className="action-card">Petites particules</div>
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
                <p className="illustration-caption">Fragmentation en microplastiques.</p>
              </div>
            </div>
          </div>

          <div className="concours-step step-3">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Dispersion</p>
            <h3 className="text-xl font-semibold text-slate-900">Les particules se retrouvent partout</h3>
            <div className="step-layout">
              <div className="effects-grid">
                <div className="effect-pill">Eau</div>
                <div className="effect-pill">Air</div>
                <div className="effect-pill">Sols</div>
                <div className="effect-pill">Aliments</div>
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
                <p className="illustration-caption">Presence diffuse dans l&apos;environnement.</p>
              </div>
            </div>
          </div>

          <div className="concours-step step-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Exposition</p>
            <h3 className="text-xl font-semibold text-slate-900">Boire, manger, respirer</h3>
            <div className="exposure-grid" aria-hidden="true">
              <div className="exposure-card">Boire</div>
              <div className="exposure-card">Manger</div>
              <div className="exposure-card">Respirer</div>
            </div>
            <p className="mt-3 text-sm text-slate-600">Le meilleur dechet plastique est celui qu&apos;on evite.</p>
          </div>
        </div>
        <p className="text-sm text-slate-700">Question flash: Les microplastiques peuvent venir :</p>
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
        <h2 className="font-display text-2xl text-slate-900">QCM microplastiques</h2>
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
        <p className="text-sm text-slate-700">Classez chaque source en primaire ou secondaire.</p>
        <div className="grid gap-3">
          {challengeOneItems.map((item) => (
            <div key={item.id} className="challenge-row">
              <div className="challenge-label">{item.label}</div>
              <div className="challenge-actions">
                {challengeOneCategories.map((category) => (
                  <button
                    key={category.key}
                    type="button"
                    onClick={() => handleSourcePick(item.id, category.key)}
                    className={`challenge-pill ${
                      sourceAnswers[item.id] === category.key
                        ? "challenge-pill-active"
                        : "challenge-pill-idle"
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="space-y-4">
        <h2 className="font-display text-2xl text-slate-900">Defi visuel 2</h2>
        <p className="text-sm text-slate-700">Remettez la chaine d'exposition dans l'ordre logique.</p>
        <ul className="ordering-list">
          {orderedSteps.map((step, index) => (
            <li key={step.id} className="ordering-item">
              <div className="ordering-index">{index + 1}</div>
              <div className="ordering-text">{step.label}</div>
              <div className="ordering-controls">
                <button
                  type="button"
                  onClick={() => moveStep(index, -1)}
                  disabled={index === 0}
                  className="ordering-button"
                >
                  Monter
                </button>
                <button
                  type="button"
                  onClick={() => moveStep(index, 1)}
                  disabled={index === orderedSteps.length - 1}
                  className="ordering-button"
                >
                  Descendre
                </button>
              </div>
            </li>
          ))}
        </ul>
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

        .exposure-grid {
          margin-top: 16px;
          display: grid;
          gap: 12px;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        }

        .exposure-card {
          border-radius: 16px;
          border: 1px solid rgba(14, 116, 144, 0.2);
          background: rgba(219, 234, 254, 0.6);
          padding: 12px 14px;
          font-size: 14px;
          font-weight: 600;
          color: #0f172a;
          text-align: center;
        }

        .challenge-row {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr);
          gap: 12px;
          align-items: center;
          border-radius: 16px;
          border: 1px solid rgba(15, 23, 42, 0.08);
          background: rgba(255, 255, 255, 0.92);
          padding: 12px 14px;
        }

        .challenge-label {
          font-size: 14px;
          font-weight: 600;
          color: #0f172a;
        }

        .challenge-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .challenge-pill {
          border-radius: 999px;
          border: 1px solid rgba(148, 163, 184, 0.6);
          padding: 6px 12px;
          font-size: 12px;
          font-weight: 600;
        }

        .challenge-pill-idle {
          background: #ffffff;
          color: #334155;
        }

        .challenge-pill-active {
          background: rgba(59, 130, 246, 0.16);
          border-color: #2563eb;
          color: #1d4ed8;
        }

        .ordering-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: grid;
          gap: 12px;
        }

        .ordering-item {
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          gap: 12px;
          border-radius: 16px;
          border: 1px solid rgba(15, 23, 42, 0.08);
          background: rgba(255, 255, 255, 0.92);
          padding: 12px 14px;
        }

        .ordering-index {
          width: 28px;
          height: 28px;
          border-radius: 999px;
          background: rgba(14, 116, 144, 0.12);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
          color: #0f172a;
        }

        .ordering-text {
          font-size: 14px;
          font-weight: 600;
          color: #0f172a;
        }

        .ordering-controls {
          display: flex;
          gap: 8px;
        }

        .ordering-button {
          border-radius: 999px;
          border: 1px solid rgba(148, 163, 184, 0.6);
          background: #ffffff;
          padding: 6px 12px;
          font-size: 12px;
          font-weight: 600;
          color: #0f172a;
        }

        .ordering-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
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

        @media (max-width: 768px) {
          .step-layout {
            grid-template-columns: 1fr;
          }

          .concours-stage {
            min-height: 520px;
          }

          .challenge-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
