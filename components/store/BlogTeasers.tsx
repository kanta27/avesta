import { SectionHead } from "@/components/ui/SectionHead";
import { Button } from "@/components/ui/Button";

const POSTS = [
  {
    emoji: "💧",
    bg: "linear-gradient(150deg,#E3F4FB,#CBE9F4)",
    meta: "HYDRATION · 5 MIN READ",
    title: "Signs you're chronically under-hydrated (and don't know it)",
  },
  {
    emoji: "🧬",
    bg: "linear-gradient(150deg,#E5F6E8,#CDEBD4)",
    meta: "SCIENCE · 7 MIN READ",
    title: "Gummies vs tablets: what absorption research actually says",
  },
  {
    emoji: "🛡️",
    bg: "linear-gradient(150deg,#FFF0DC,#FBDFB6)",
    meta: "IMMUNITY · 4 MIN READ",
    title: "The Vitamin D deficiency most Indians live with",
  },
] as const;

export function BlogTeasers() {
  return (
    <section id="blog" style={{ paddingTop: 20 }}>
      <div className="wrap">
        <SectionHead kicker="06 — Learn" title="From the journal">
          <Button variant="ghost" href="#blog">
            All articles →
          </Button>
        </SectionHead>
        <div className="blog-grid">
          {POSTS.map((p) => (
            <a className="post" key={p.title} href="#blog">
              <div className="thumb" style={{ background: p.bg }} aria-hidden>
                {p.emoji}
              </div>
              <div className="body">
                <div className="meta">{p.meta}</div>
                <h3>{p.title}</h3>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
