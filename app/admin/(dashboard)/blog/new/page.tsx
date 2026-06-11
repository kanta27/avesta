import { requireAdmin } from "@/lib/auth/require-admin";
import { BlogEditor } from "@/components/admin/BlogEditor";

/** New blog post (feature 16). Gate first; the editor writes via a server action. */
export default async function NewBlogPostPage() {
  await requireAdmin();
  return <BlogEditor />;
}
