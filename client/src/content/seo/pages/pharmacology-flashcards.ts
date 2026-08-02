import type { SeoPageContent } from "../types";
import { section } from "../utils";

export const pharmacologyFlashcards: SeoPageContent = {
  slug: "pharmacology-flashcards",
  cluster: "medical-students",
  primaryKeyword: "pharmacology flashcards",
  secondaryKeywords: [
    "drug mechanism flashcards",
    "side effect flashcards",
    "pharm shelf review",
    "medication mnemonics",
    "pharmacology active recall",
  ],
  searchIntent: "informational",
  seoTitle: "Pharmacology Flashcards | MyRemynd",
  metaDescription:
    "Learn drug classes, mechanisms, and adverse effects with pharmacology flashcards. MyRemynd builds cards from notes and schedules FSRS reviews.",
  h1: "Pharmacology Flashcards for Mechanisms, Adverse Effects, and Exam Traps",
  intro:
    "Pharmacology exams punish vague recognition: you need the exact first-line agent, the classic toxidrome, and the interaction that contraindicates a combo. Pharmacology flashcards distill each drug into testable atoms—class, mechanism, key effect, major adverse event, and one clinical pearl. MyRemynd accelerates deck building from lecture PDFs and pharm tables while FSRS scheduling keeps hundreds of agents retrievable without weekly cram sessions. Start pharmacology flashcards early in the block so agents feel familiar before shelf vignettes stack mechanisms, labs, and contraindications in one stem.",
  sections: [
    section("why-pharm-cards", "Why Flashcards Beat Re-Reading Pharm Tables", 2, [
      "Pharmacy tables encourage horizontal scanning: you see metformin beside sulfonylureas and feel fluent, but the exam asks which agent causes lactic acidosis risk in renal failure. Retrieval practice fixes that illusion. Each pharmacology flashcard should force a decision—first line, contraindication, antidote, or monitoring parameter.",
      "Spaced repetition spreads drugs across days so you learn the class story once and revisit individual agents before forgetting. MyRemynd queues struggling cards more frequently, which is ideal for look-alike antibiotics and antihypertensives that differ by one letter on the stem.",
    ]),
    section("card-template", "A Repeatable Template for Drug Cards", 2, [
      "Use a consistent skeleton: Generic name → class → mechanism (one line) → primary use → hallmark adverse effect → contraindication or interaction. Split if the back exceeds two short sentences. For drug classes, ask 'Which member causes X?' to test distinguishing features within the class.",
      "Add comparison cards: 'ACE inhibitor cough vs ARB—management difference?' beats isolated facts. For antibiotics, pair spectrum with organism and setting (community pneumonia vs nosocomial). For CNS drugs, link receptor activity to clinical use and withdrawal risk.",
    ]),
    section("high-yield-topics", "High-Yield Pharm Topics for Med School and Shelves", 2, [
      "Autonomic drugs, cardiovascular agents, antimicrobials, endocrine therapies, and chemo basics dominate early exams. Psychotropics matter for psych rotations and boards. Anticoagulants and diabetes regimens appear constantly in clinical vignettes. Tag cards by these buckets so you can ramp reviews before the matching shelf.",
      "Do not neglect toxidromes and antidotes—they are fast points. Organophosphate poisoning, acetaminophen overdose, and opioid reversal are classic one-card wins. MyRemynd tagging lets you drill `tox::` or `antidote::` subsets the night before a shelf without touching unrelated decks.",
    ]),
    section("building-decks", "Turning Lecture PDFs Into Pharm Decks", 2, [
      "Paste your school's pharm deck PDF or table export into MyRemynd. The AI proposes mechanism and adverse-effect prompts; you verify against your syllabus because professors vary on first-line choices. Edit stems to mirror NBME phrasing when you are board-focused.",
      "Cap new drug cards during heavy weeks—fifteen to twenty-five new agents daily is plenty if you keep reviewing mature cards. Batch creation on Sunday, curation Monday, steady reviews all week beats sporadic all-nighters that do not stick.",
    ]),
    section("clinical-bridge", "Bridging Pharmacology Flashcards to the Wards", 2, [
      "When you write orders, add a card for monitoring parameters you almost missed—INR for warfarin, potassium for diuretics, renal dosing for gabapentin. Clinical pharmacology is where flashcards pay rent on rotations attendings expect you to know daily meds cold.",
      "Pair cards with micro-cases: '62M on metformin, CrCl 25—next step?' integrates knowledge better than bare facts alone. Keep case cards short; if the vignette grows, make it a question bank item and extract one flashcard pearl from the explanation.",
    ]),
    section("maintenance", "Maintaining Pharm Decks Without Burnout", 2, [
      "After the pharm exam, suspend obsolete lecture-only agents but keep board staples active. Merge duplicates when generic and brand names crept in separately. Quarterly, sort by failure rate and fix cards with ambiguous fronts—'Side effect of statins?' is too broad; ask for the muscle-related complication you must name.",
      "MyRemynd review analytics show whether your daily cap is realistic. If overdue cards snowball, reduce new additions for a week rather than stopping reviews entirely. Consistency preserves the hardest-won pharm knowledge across clerkships.",
    ]),
    section("look-alikes", "Separating Look-Alike Drugs With Comparison Cards", 2, [
      "Pharmacology exams love near-miss distractors: SSRIs with different CYP effects, beta blockers with or without ISA, insulin types by onset. Build explicit comparison fronts: 'Which sulfonylurea is preferred in renal impairment?' rather than isolated monotherapy facts. MyRemynd struggle metrics reveal which comparisons you still confuse after three exposures.",
      "When AI generates class overviews, split them into pairwise comparisons students actually miss on NBME-style stems. One comparison per card keeps reviews fast and decision-ready under time pressure.",
    ]),
    section("toxicology", "Toxicology and Antidote Cards for Fast Points", 2, [
      "Overdose presentations are high-yield per minute of study: acetaminophen timing and antidote, opioid reversal, TCA QRS widening, salicylate mixed acid-base patterns. One card per toxidrome keeps reviews fast. MyRemynd tags like `tox::` isolate these for pre-clinical exams and EM rotations alike.",
      "Pair antidote cards with mechanism cards only when the exam links them—otherwise keep antidotes atomic for speed under time pressure.",
    ]),
    section("ward-integration", "Ward Integration: Formulary Reality vs Lecture Ideal", 2, [
      "Hospital formularies differ from textbook first lines. Add small tags for `ward::` when you learn what your service actually prescribes—H2 blockers vs PPI choices, antibiotic restrictions, renal dosing adjustments. These cards bridge classroom pharmacology flashcards to oral presentations attendings expect.",
      "Paste hospital antibiogram summaries or pharmacy handouts into MyRemynd, edit AI cards to local protocols, and review them before call nights. Local cards complement national board decks without replacing them.",
    ]),
    section("pediatrics-geriatrics", "Pediatrics, Geriatrics, and Dose Adjustment Cards", 2, [
      "Pediatric dosing and geriatric polypharmacy appear on shelf and board stems with predictable patterns. Add cards for age-specific contraindications, Beers criteria pearls, and weight-based calculations your exams emphasize. Keep each card to one decision: when to avoid, what to monitor, what to substitute.",
    ]),
    section("start-pharm", "Your First Week With Pharmacology Flashcards", 2, [
      "Choose one drug class lecture, generate twenty edited cards, and complete reviews five days in a row before expanding. Notice which comparison cards fail twice—those become priority edits. MyRemynd struggle sorting makes those fixes obvious without rereading entire chapters.",
      "Pharmacology flashcards compound: students who start in week one of the block enter shelf season with mechanisms automatic, freeing mental bandwidth for vignette integration and test-taking speed.",
    ]),
  ],
  faqs: [
    {
      question: "How many pharmacology flashcards do I need?",
      answer:
        "Many students thrive with three hundred to eight hundred well-edited cards covering core classes and differentiators, not every obscure agent in a reference table.",
    },
    {
      question: "Should I separate brand and generic names?",
      answer:
        "Pick one primary naming style per card and add the alternate name in parentheses if exams use both. Avoid duplicate cards that test the same fact under two names.",
    },
    {
      question: "Can MyRemynd handle table-heavy PDFs?",
      answer:
        "Yes—upload pharm tables and edit AI-generated prompts to match your lecture emphasis before adding them to the FSRS queue.",
    },
    {
      question: "How do I memorize antibiotic spectra?",
      answer:
        "Use comparison cards by organism and setting, not monolithic spectrum lists. Test one decision at a time: first line for MRSA pneumonia, empiric UTI coverage, etc.",
    },
    {
      question: "Are pharmacology flashcards enough for shelf exams?",
      answer:
        "They anchor drug knowledge but pair best with questions and guidelines for management algorithms. Use cards for facts; use cases for integration.",
    },
  ],
  relatedSlugs: [
    "flashcards-for-medical-school",
    "medical-school-flashcards",
    "anatomy-flashcards",
    "medical-study-ai",
    "medical-exam-preparation",
    "active-recall",
    "spaced-repetition",
    "ai-flashcard-generator",
  ],
  publishedAt: "2026-06-02",
  updatedAt: "2026-06-02",
};
