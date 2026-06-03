import type { SeoPageContent } from "../types";
import { section } from "../utils";

export const howSpacedRepetitionWorks: SeoPageContent = {
  slug: "how-spaced-repetition-works",
  cluster: "spaced-repetition",
  primaryKeyword: "how spaced repetition works",
  secondaryKeywords: [
    "spaced repetition algorithm",
    "spaced repetition intervals",
    "spaced repetition schedule",
    "FSRS algorithm explained",
    "spaced repetition process",
  ],
  searchIntent: "informational",
  seoTitle: "How Spaced Repetition Works: Step by Step",
  metaDescription:
    "See how spaced repetition schedules reviews, adapts intervals, and uses FSRS in SmartFlashcards to maximize memory retention with less study time.",
  h1: "How Spaced Repetition Works",
  intro:
    "Spaced repetition works by timing each review to coincide with the moment your memory of a fact starts to weaken. Successful recall extends the interval until the next review. Failed recall shortens it. Modern algorithms like FSRS model this cycle mathematically so software can predict the ideal review date for every card in your deck. SmartFlashcards applies that process automatically from the first card you create.",
  sections: [
    section("review-cycle", "The Basic Review Cycle", 2, [
      "Every spaced repetition session follows the same loop. You encounter a prompt, attempt to retrieve the answer from memory, reveal the correct answer, and rate how well you recalled it. That rating feeds the scheduler, which assigns a new due date before moving to the next card.",
      "The cycle takes seconds per card but compounds over months into deep, stable knowledge. You are not learning faster in the sense of skipping steps. You are learning more efficiently by eliminating wasted reviews of material you already know cold and concentrating effort where it matters.",
    ]),
    section("interval-growth", "How Intervals Grow Over Time", 2, [
      "A new card typically returns within one day of its first review. If you recall it successfully, the next interval might stretch to three days, then seven, then sixteen, then thirty-five. These numbers are not arbitrary; they reflect estimated memory stability increasing with each successful retrieval.",
      "When you fail a card, the interval resets or shrinks dramatically. That card re-enters a learning phase with shorter gaps until you demonstrate reliable recall again. This asymmetry ensures weak items receive more attention while strong items fade into the background until they are due again.",
    ]),
    section("fsrs-model", "Inside the FSRS Model", 2, [
      "FSRS tracks two key parameters for each card: stability, which reflects how long the memory is likely to last, and difficulty, which reflects how inherently hard the item is for you. Each review updates both values based on your rating and the elapsed time since the last review.",
      "The algorithm predicts the probability that you will recall a card on any given day. SmartFlashcards schedules reviews when that probability drops to a target threshold, typically around ninety percent. Cards above the threshold stay dormant. Cards below it surface in your daily queue.",
    ]),
    section("ratings-impact", "What Your Ratings Tell the Scheduler", 2, [
      "Again means you did not recall the answer. The card returns almost immediately, often within minutes or hours during the same session. Hard means you recalled with serious effort or partial error. Good means comfortable recall. Easy means instant, effortless recall.",
      "These four ratings give FSRS enough signal to adjust intervals precisely. Consistent honest ratings produce better schedules than always clicking Good. If you guess correctly but feel uncertain, Hard is the accurate choice. The algorithm learns your patterns only when your input reflects real memory strength.",
    ]),
    section("daily-queue", "How the Daily Queue Is Built", 2, [
      "Each morning SmartFlashcards calculates which cards have due dates on or before today. Those cards form your review queue, sorted so overdue items appear first. New cards may also enter the queue up to a daily limit you control, preventing overload when building a large deck.",
      "Completing the queue takes the guesswork out of studying. You open the app, work through due cards, and stop when the count reaches zero. There is no decision fatigue about what to study next. FSRS has already prioritized the material most at risk of being forgotten.",
    ]),
    section("comparison-sm2", "FSRS Compared to Older Algorithms", 2, [
      "SM-2, the classic SuperMemo algorithm adopted by many flashcard tools, uses fixed multipliers to grow intervals. It works but treats all learners identically and ignores the elapsed time between reviews in nuanced ways. FSRS was trained on large datasets of real review outcomes to produce more accurate predictions.",
      "Practical benefits include fewer total reviews to reach the same retention target and smoother daily workloads. Students migrating from other tools often notice that FSRS reduces review spikes before exams because intervals adapt to their actual performance rather than following rigid formulas.",
    ]),
    section("implementation", "How SmartFlashcards Implements the Process", 2, [
      "When you generate flashcards from a PDF or paste notes into SmartFlashcards, each card receives an initial FSRS state with a due date of today or tomorrow. Your first review establishes baseline stability and difficulty. Every subsequent rating refines those values in the background without any action on your part.",
      "The entire pipeline, from AI card generation to FSRS scheduling to daily review UI, lives in one web application. You do not export decks, install plugins, or sync databases manually. The system handles the mechanics so you can focus on the cognitive work of retrieval and learning.",
    ]),
    section("troubleshooting", "When Scheduling Feels Wrong", 2, [
      "If a card you know well keeps appearing too often, you may be rating Hard when Easy is accurate. FSRS trusts your input. Adjust ratings to reflect genuine recall difficulty and intervals will stretch appropriately within a few review cycles.",
      "If your daily queue feels overwhelming after a break, complete the oldest due cards first over several shorter sessions rather than one marathon. FSRS recalibrates as you catch up. SmartFlashcards prioritizes overdue items so the most at-risk memories get attention before intervals slip further.",
      "New users sometimes review ahead of schedule by browsing the full deck. Trust the due queue instead. Cards not yet due are still well retained; reviewing them early wastes time you could spend on material FSRS has identified as fading.",
    ]),
  ],
  faqs: [
    {
      question: "What data does FSRS store for each card?",
      answer:
        "FSRS tracks due date, stability, difficulty, review count, lapse count, and card state. SmartFlashcards persists these values so your schedule survives across sessions and devices.",
    },
    {
      question: "Why do intervals not follow a fixed pattern like 1-3-7-14?",
      answer:
        "Fixed patterns ignore individual variation. FSRS personalizes intervals based on your ratings and timing history, producing schedules that fit your memory rather than a generic template.",
    },
    {
      question: "Can I see when a card will next be due?",
      answer:
        "SmartFlashcards displays due status and scheduling information in the review interface so you understand how your ratings affect future intervals.",
    },
    {
      question: "Does the algorithm change if I skip days?",
      answer:
        "FSRS accounts for elapsed time when you return. Overdue cards remain in the queue until reviewed, and the scheduler recalculates stability based on how long you waited.",
    },
    {
      question: "Is FSRS better than Leitner box systems?",
      answer:
        "Leitner boxes use physical or virtual buckets with fixed promotion rules. FSRS provides finer-grained, continuous interval adjustment that typically achieves higher retention with fewer reviews.",
    },
    {
      question: "Should I review all cards or only due cards?",
      answer:
        "Review only due cards for optimal efficiency. FSRS calculates due dates based on memory stability. Reviewing ahead adds workload without improving retention for material you still remember well.",
    },
  ],
  relatedSlugs: [
    "spaced-repetition",
    "what-is-spaced-repetition",
    "spaced-repetition-software",
    "memory-retention-techniques",
    "long-term-memory-learning",
    "active-recall",
    "anki-vs-smartflashcards",
    "how-to-remember-more",
  ],
  publishedAt: "2026-06-02",
  updatedAt: "2026-06-02",
};
