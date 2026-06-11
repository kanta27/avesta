import { notFound } from "next/navigation";

import { requireAdmin } from "@/lib/auth/require-admin";
import { getPostForEdit } from "@/lib/blog/admin";
import { BlogEditor } from "@/components/admin/BlogEditor";

type Params = Promise<{ id: string }>;

/** Edit a blog post (feature 16). Gate first, load any-status row, then edit. */
export default async function EditBlogPostPage({
  params,
}: {
  params: Params;
}) {
  await requireAdmin();
  const { id } = await params;
  const post = await getPostForEdit(id);
  if (!post) notFound();

  return <BlogEditor post={post} />;
}
