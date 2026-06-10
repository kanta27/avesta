import type { Ingredient } from "@/lib/products/types";

/** Ingredients table (name / amount / unit). Renders nothing if empty. */
export function IngredientsTable({ ingredients }: { ingredients: Ingredient[] }) {
  if (ingredients.length === 0) return null;

  return (
    <table className="pdp-table">
      <thead>
        <tr>
          <th scope="col">Ingredient</th>
          <th scope="col">Amount</th>
        </tr>
      </thead>
      <tbody>
        {ingredients.map((ing) => (
          <tr key={ing.name}>
            <td>{ing.name}</td>
            <td className="pdp-amount mono">
              {ing.amount != null && ing.amount !== ""
                ? `${ing.amount}${ing.unit ? ` ${ing.unit}` : ""}`
                : "—"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
