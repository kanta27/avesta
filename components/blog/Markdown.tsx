import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";

/**
 * The ONE render path for blog `body_md` (feature 16).
 *
 * SECURITY — `body_md` is UNTRUSTED (it can come from the automation agent):
 *   - No `dangerouslySetInnerHTML`. react-markdown renders to React elements.
 *   - We do NOT enable `rehype-raw`, so any literal HTML in the markdown (e.g. a
 *     `<script>` tag) is treated as plain text, never parsed into live DOM.
 *   - `rehype-sanitize` runs as defense-in-depth with an ALLOWLIST schema
 *     (GitHub's default): it strips disallowed tags, event-handler attributes,
 *     and dangerous URL protocols such as `javascript:`.
 *
 * No `"use client"` — this is a pure render component, so it works both in
 * server components (the public post page) and inside client components (the
 * admin editor's live preview).
 */

// Allowlist = GitHub's default schema, with class names permitted on <code>/<pre>
// so fenced code blocks keep their language hint. Everything else stays locked.
const schema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    code: [...(defaultSchema.attributes?.code ?? []), ["className"]],
  },
};

export function Markdown({ source }: { source: string | null }) {
  if (!source || source.trim() === "") {
    return null;
  }

  return (
    <div className="blog-prose">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeSanitize, schema]]}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}
