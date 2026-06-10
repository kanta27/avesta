/** "Who this is for / not for" — two columns. Renders nothing if both empty. */
export function WhoForNotFor({
  whoFor,
  whoNotFor,
}: {
  whoFor: string | null;
  whoNotFor: string | null;
}) {
  if (!whoFor && !whoNotFor) return null;

  return (
    <div className="who-grid">
      {whoFor ? (
        <div className="who-col who-for">
          <h3>
            <span aria-hidden>✓</span> Who this is for
          </h3>
          <p>{whoFor}</p>
        </div>
      ) : null}
      {whoNotFor ? (
        <div className="who-col who-not">
          <h3>
            <span aria-hidden>•</span> Who this isn&apos;t for
          </h3>
          <p>{whoNotFor}</p>
        </div>
      ) : null}
    </div>
  );
}
