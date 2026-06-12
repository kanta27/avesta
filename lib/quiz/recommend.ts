// Quiz recommendation — maps the 5 answers onto a primary concern, then onto the
// best-matching ACTIVE product. Pure and client-safe (no DB / server-only): the
// caller hands in the live catalog (`getActiveProducts`) so this stays a simple,
// data-driven function over `product.concerns`.

import type { ProductListItem } from "@/lib/products/types";
import { CONCERN_OPTIONS } from "@/lib/products/types";
import {
  QUIZ_QUESTIONS,
  formatPreferenceToType,
  type ConcernKey,
} from "./questions";

/** Answers as { questionId: optionId } — the shape the quiz island accumulates. */
export type QuizAnswers = Record<string, string>;

export interface QuizRecommendation {
  /** The product to show, or null when the catalog is empty (browse-shop CTA). */
  product: ProductListItem | null;
  /** The winning concern key (always set, even on fallback — drives the copy). */
  primaryConcern: ConcernKey;
  /** Human label for `primaryConcern`. */
  primaryConcernLabel: string;
  /**
   * True when no product matched the ranked concerns and we fell back to a
   * sensible bestseller (or, with an empty catalog, to no product at all).
   */
  fallback: boolean;
}

const CONCERN_LABEL = new Map(CONCERN_OPTIONS.map((c) => [c.key, c.label]));
/** Stable tiebreak order for equal concern scores: the CONCERN_OPTIONS order. */
const CONCERN_ORDER = CONCERN_OPTIONS.map((c) => c.key);

/** Tally a concern → score map from the chosen options' weights. */
export function scoreConcerns(answers: QuizAnswers): Record<string, number> {
  const scores: Record<string, number> = {};
  for (const question of QUIZ_QUESTIONS) {
    const chosenId = answers[question.id];
    if (!chosenId) continue;
    const option = question.options.find((o) => o.id === chosenId);
    if (!option) continue;
    for (const [concern, weight] of Object.entries(option.weights)) {
      scores[concern] = (scores[concern] ?? 0) + (weight ?? 0);
    }
  }
  return scores;
}

/** Concern keys ranked by score desc, ties broken by CONCERN_OPTIONS order. */
function rankConcerns(scores: Record<string, number>): ConcernKey[] {
  return [...CONCERN_ORDER].sort((a, b) => {
    const diff = (scores[b] ?? 0) - (scores[a] ?? 0);
    if (diff !== 0) return diff;
    return CONCERN_ORDER.indexOf(a) - CONCERN_ORDER.indexOf(b);
  });
}

/**
 * Among `candidates`, pick the best one: products matching the preferred format
 * (Q5) win first, then the highest rating, then the existing catalog order
 * (already type→name sorted) as a stable final tiebreak.
 */
function pickBest(
  candidates: ProductListItem[],
  preferredType: "hydration" | "gummy" | null,
): ProductListItem | null {
  if (candidates.length === 0) return null;
  const ranked = [...candidates].sort((a, b) => {
    if (preferredType) {
      const aPref = a.type === preferredType ? 1 : 0;
      const bPref = b.type === preferredType ? 1 : 0;
      if (aPref !== bPref) return bPref - aPref;
    }
    const ratingDiff = (b.ratingAvg ?? 0) - (a.ratingAvg ?? 0);
    if (ratingDiff !== 0) return ratingDiff;
    return 0; // keep input order (catalog is already type→name sorted)
  });
  return ranked[0];
}

/**
 * Recommend a product from the quiz answers.
 *
 * 1. Score concerns from the answers and rank them.
 * 2. Walk the ranked concerns; the first concern with at least one active
 *    product whose `concerns[]` includes it wins — within that concern, prefer
 *    the chosen format, then rating.
 * 3. If NO concern matches any product (sparse catalog) fall back to a sensible
 *    bestseller; with an empty catalog, return no product so the UI can show a
 *    browse-the-shop CTA. Never throws, never returns an empty result.
 */
export function recommendProduct(
  answers: QuizAnswers,
  products: ProductListItem[],
): QuizRecommendation {
  const scores = scoreConcerns(answers);
  const ranked = rankConcerns(scores);
  const primaryConcern = ranked[0];
  const preferredType = formatPreferenceToType(answers["format"]);

  for (const concern of ranked) {
    // Only let a concern win if the visitor actually pointed at it (score > 0),
    // so a zero-signal concern never short-circuits the fallback.
    if ((scores[concern] ?? 0) === 0) continue;
    const matches = products.filter((p) => p.concerns.includes(concern));
    const best = pickBest(matches, preferredType);
    if (best) {
      return {
        product: best,
        primaryConcern: concern,
        primaryConcernLabel: CONCERN_LABEL.get(concern) ?? concern,
        fallback: false,
      };
    }
  }

  // No concern matched a product — fall back to a bestseller across the whole
  // catalog (format-preferred if possible). Empty catalog → no product.
  const fallbackProduct = pickBest(products, preferredType);
  return {
    product: fallbackProduct,
    primaryConcern,
    primaryConcernLabel: CONCERN_LABEL.get(primaryConcern) ?? primaryConcern,
    fallback: true,
  };
}
