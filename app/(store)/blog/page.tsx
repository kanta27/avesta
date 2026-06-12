import type { Metadata } from "next";
import Link from "next/link";

import { SectionHead } from "@/components/ui/SectionHead";
import { getPublishedPosts } from "@/lib/blog/queries";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Evidence-led articles on hydration, immunity, and everyday nutrition from the Avesta Nordic science team.",
  alternates: { canonical: "/blog" },
};

// Published posts change when an admin publishes; let Next revalidate so a newly
// published post appears without a redeploy (the admin action also revalidates).
export const revalidate = 300;

export default async function BlogIndexPage() {
  const posts = await getPublishedPosts();

  return (
    <section id="blog">
      <div className="wrap">
        <SectionHead
          kicker="Journal"
          title="The Avesta blog"
          description="Evidence-led notes on hydration, immunity, and everyday nutrition — written and reviewed by our science team."
        />

        {posts.length === 0 ? (
          <p className="shop-empty">No articles published yet. Check back soon.</p>
        ) : (
          <div className="blog-grid">
            {posts.map((post) => (
              <article key={post.id} className="blog-card">
                <Link href={`/blog/${post.slug}`} className="blog-card-link">
                  {post.cover?.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      className="blog-card-cover"
                      src={post.cover.url}
                      alt={post.cover.alt ?? ""}
                      loading="lazy"
                    />
                  ) : (
                    <div className="blog-card-cover blog-card-cover--placeholder" aria-hidden />
                  )}
                  <div className="blog-card-body">
                    {post.publishedAt ? (
                      <time className="blog-card-date mono" dateTime={post.publishedAt}>
                        {formatDate(post.publishedAt)}
                      </time>
                    ) : null}
                    <h3 className="blog-card-title">{post.title}</h3>
                    {post.excerpt ? (
                      <p className="blog-card-excerpt">{post.excerpt}</p>
                    ) : null}
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
