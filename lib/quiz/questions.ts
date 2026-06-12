// The 60-second health quiz — questions, options and the concern weights each
// option contributes. Pure and client-safe (no server-only imports), so the
// quiz client island and the recommendation logic share one source of truth.
//
// COMPLIANCE (conventions.md): structure/function language only — every option
// "supports" or "helps maintain" a function; never "cures", "treats" or
// "prevents". Concern keys match `CONCERN_OPTIONS` / `products.concerns` so the
// recommendation can match an answer straight onto a product's `concerns[]`.

import { CONCERN_OPTIONS } from "@/lib/products/types";

/** The concern keys an answer can point at — exactly the storefront concerns. */
export type ConcernKey = (typeof CONCERN_OPTIONS)[number]["key"];

/** A single selectable answer and the concern weights it contributes. */
export interface QuizOption {
  /** Stable id stored in `quiz_answers` (kebab-case, ≤60 chars). */
  id: string;
  label: string;
  /** Concern key → weight added to that concern's score when chosen. */
  weights: Partial<Record<ConcernKey, number>>;
}

/** One quiz step: an id, a prompt and 3–4 options. */
export interface QuizQuestion {
  id: string;
  prompt: string;
  options: QuizOption[];
}

/**
 * Five concern-first questions. Q1 is the primary goal (weighted heaviest);
 * Q2–Q4 add supporting signal; Q5 captures a format preference used only as a
 * tie-breaker between equally-matched products (it carries no concern weight).
 */
export const QUIZ_QUESTIONS: readonly QuizQuestion[] = [
  {
    id: "goal",
    prompt: "What would you most like to support right now?",
    options: [
      {
        id: "hydration",
        label: "Staying hydrated & replenishing electrolytes",
        weights: { hydration: 3 },
      },
      {
        id: "energy",
        label: "Everyday energy & feeling less sluggish",
        weights: { energy: 3 },
      },
      {
        id: "immunity",
        label: "Supporting my immunity",
        weights: { immunity: 3 },
      },
      {
        id: "hair-skin",
        label: "Healthy-looking hair & skin",
        weights: { "hair-skin": 3 },
      },
    ],
  },
  {
    id: "day",
    prompt: "Which best describes a typical day for you?",
    options: [
      {
        id: "active-sweat",
        label: "Active & sweating — workouts, heat or being on my feet",
        weights: { hydration: 2, energy: 1 },
      },
      {
        id: "desk",
        label: "Mostly at a desk, long hours on screens",
        weights: { energy: 1, "daily-nutrition": 1 },
      },
      {
        id: "on-the-go",
        label: "Always on the go — meals are rushed or skipped",
        weights: { "daily-nutrition": 2, energy: 1 },
      },
      {
        id: "rest-poor",
        label: "Busy, and I rarely wind down properly",
        weights: { sleep: 2 },
      },
    ],
  },
  {
    id: "feel",
    prompt: "What would make the biggest difference to how you feel?",
    options: [
      {
        id: "steady-energy",
        label: "Steadier energy through the afternoon",
        weights: { energy: 2 },
      },
      {
        id: "fewer-bugs",
        label: "Better day-to-day resilience",
        weights: { immunity: 2 },
      },
      {
        id: "better-rest",
        label: "Calmer evenings & more restful sleep",
        weights: { sleep: 2 },
      },
      {
        id: "look-good",
        label: "Stronger hair, nails & clearer skin",
        weights: { "hair-skin": 2 },
      },
    ],
  },
  {
    id: "gap",
    prompt: "Where do you feel your routine falls short?",
    options: [
      {
        id: "water-electrolytes",
        label: "I don't drink enough water or replace what I sweat out",
        weights: { hydration: 2 },
      },
      {
        id: "nutrient-gaps",
        label: "My diet has gaps — I don't always eat balanced meals",
        weights: { "daily-nutrition": 2 },
      },
      {
        id: "low-immunity",
        label: "I catch whatever's going around",
        weights: { immunity: 2 },
      },
      {
        id: "poor-sleep",
        label: "I don't sleep as well as I'd like",
        weights: { sleep: 2 },
      },
    ],
  },
  {
    id: "format",
    prompt: "What format do you prefer?",
    options: [
      {
        id: "drink",
        label: "A drink I can mix into water",
        weights: {},
      },
      {
        id: "gummy",
        label: "A gummy I can chew on the go",
        weights: {},
      },
      {
        id: "no-preference",
        label: "No preference — recommend what fits best",
        weights: {},
      },
    ],
  },
];

/** Map a format answer (Q5) onto a product `type`, or null for no preference. */
export function formatPreferenceToType(
  optionId: string | undefined,
): "hydration" | "gummy" | null {
  if (optionId === "drink") return "hydration";
  if (optionId === "gummy") return "gummy";
  return null;
}
