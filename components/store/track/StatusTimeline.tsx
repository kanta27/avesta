import {
  STATUS_TIMELINE,
  type OrderStatus,
  type TimelineStatus,
} from "@/lib/track/types";

/** Human label for each milestone shown in the timeline. */
const STEP_LABEL: Record<TimelineStatus, string> = {
  created: "Order placed",
  paid: "Payment confirmed",
  packed: "Packed",
  shipped: "Shipped",
  delivered: "Delivered",
};

/**
 * Horizontal status timeline: created → paid → packed → shipped → delivered.
 * Steps up to and including the current status render as complete; the current
 * step is marked active. Terminal off-path states (cancelled / refunded) are
 * handled by the caller with a banner instead of this progress view.
 */
export function StatusTimeline({ status }: { status: OrderStatus }) {
  const currentIndex = (STATUS_TIMELINE as readonly OrderStatus[]).indexOf(
    status,
  );

  return (
    <ol className="track-timeline" aria-label="Order status">
      {STATUS_TIMELINE.map((step, i) => {
        const state =
          i < currentIndex ? "done" : i === currentIndex ? "active" : "todo";
        return (
          <li key={step} className={`track-step track-step-${state}`}>
            <span className="track-step-dot" aria-hidden />
            <span className="track-step-label">{STEP_LABEL[step]}</span>
          </li>
        );
      })}
    </ol>
  );
}
