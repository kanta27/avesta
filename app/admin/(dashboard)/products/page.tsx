import Link from "next/link";
import { requireAdmin } from "@/lib/auth/require-admin";
import { listAllProducts } from "@/lib/products/admin";
import { formatPaiseINR } from "@/lib/format";
import { ProductActiveToggle } from "@/components/admin/ProductActiveToggle";

/** Products admin list (feature 12, module 1). Shows all rows — active + hidden. */
export default async function AdminProductsPage() {
  await requireAdmin();
  const products = await listAllProducts();

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Products</h1>
          <p className="mt-1 text-sm text-grey">
            {products.length} product{products.length === 1 ? "" : "s"}.
          </p>
        </div>
        <Link href="/admin/products/new" className="btn btn-primary text-sm">
          + New product
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="mt-8 rounded-card border border-line bg-paper-2 px-5 py-8 text-center text-sm text-grey">
          No products yet. Create your first one.
        </p>
      ) : (
        <div className="mt-6 overflow-hidden rounded-card border border-line">
          <table className="w-full text-sm">
            <thead className="bg-paper-2 text-left font-mono text-xs uppercase tracking-wide text-grey">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">From</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Images</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {products.map((p) => (
                <tr key={p.id} className="bg-white">
                  <td className="px-4 py-3">
                    <div className="font-medium text-ink">{p.name}</div>
                    <div className="font-mono text-xs text-grey">{p.slug}</div>
                  </td>
                  <td className="px-4 py-3 capitalize text-grey">{p.type}</td>
                  <td className="px-4 py-3 text-grey">
                    {p.fromPaise != null ? formatPaiseINR(p.fromPaise) : "—"}
                  </td>
                  <td className="px-4 py-3 text-grey">{p.stockCount}</td>
                  <td className="px-4 py-3 text-grey">{p.imageCount}</td>
                  <td className="px-4 py-3">
                    <ProductActiveToggle id={p.id} initialActive={p.isActive} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/products/${p.id}/edit`}
                      className="font-medium text-ink underline-offset-2 hover:underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
