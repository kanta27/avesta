import type { Bioactive } from "@/lib/products/types";

/** Bioactive breakdown (name / role / evidence link). Empty → renders nothing. */
export function BioactivesTable({ bioactives }: { bioactives: Bioactive[] }) {
  if (bioactives.length === 0) return null;

  return (
    <table className="pdp-table">
      <thead>
        <tr>
          <th scope="col">Bioactive</th>
          <th scope="col">Role</th>
          <th scope="col">Evidence</th>
        </tr>
      </thead>
      <tbody>
        {bioactives.map((b) => (
          <tr key={b.name}>
            <td>{b.name}</td>
            <td>{b.role ?? "—"}</td>
            <td>
              {b.evidence_url ? (
                <a
                  href={b.evidence_url}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="mono"
                >
                  Study ↗
                </a>
              ) : (
                "—"
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
