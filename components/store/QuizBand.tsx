import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";

/**
 * The lime quiz call-to-action band. `cta` is a slot for an override; by default
 * it links to the 60-second health quiz at `/quiz` (feature 20).
 */
export function QuizBand({ cta }: { cta?: ReactNode }) {
  return (
    <section>
      <div className="wrap">
        <div className="quiz">
          <div>
            <h2>Not sure where to start? Take the 60-second health quiz.</h2>
            <p>
              Answer 5 quick questions → get your matched formula + 10% off your
              first order.
            </p>
          </div>
          {cta ?? (
            <Button
              variant="primary"
              href="/quiz"
              style={{ fontSize: 16, padding: "16px 30px" }}
            >
              Find my formula →
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
