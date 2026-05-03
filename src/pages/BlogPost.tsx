import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { RootLayout } from "@/components/layout/RootLayout";
import { SEO } from "@/components/seo/SEO";
import { MarkdownView } from "@/components/blog/MarkdownView";
import { useBlogPost } from "@/hooks/useBlogPosts";

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading } = useBlogPost(slug);

  if (isLoading) {
    return (
      <RootLayout>
        <div className="mx-auto max-w-3xl px-5 py-24 text-ghost">Loading…</div>
      </RootLayout>
    );
  }

  if (!post) {
    return (
      <RootLayout>
        <SEO title="Post not found" />
        <div className="mx-auto max-w-3xl px-5 py-24 text-center">
          <h1 className="text-3xl font-semibold text-pure">Post not found</h1>
          <Link to="/blog" className="mt-6 inline-block text-cyan underline">
            Back to blog
          </Link>
        </div>
      </RootLayout>
    );
  }

  const dateISO = post.published_at ?? post.created_at;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt ?? undefined,
    image: post.cover_url ?? undefined,
    datePublished: dateISO,
    dateModified: post.updated_at,
    author: { "@type": "Organization", name: "AUMECHO" },
    publisher: {
      "@type": "Organization",
      name: "AUMECHO",
    },
  };

  return (
    <RootLayout>
      <SEO
        title={post.title}
        description={post.excerpt ?? undefined}
        image={post.cover_url ?? undefined}
        type="article"
        jsonLd={jsonLd}
      />
      <article className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-24">
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-hud text-ghost transition-colors hover:text-cyan"
        >
          <ArrowLeft size={12} /> Back to blog
        </Link>

        <header className="mt-8">
          <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-hud text-slate">
            <time dateTime={dateISO}>
              {new Date(dateISO).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
            {post.tags?.map((t) => (
              <span
                key={t}
                className="rounded-full border border-[rgba(0,242,255,0.3)] px-2 py-0.5 text-cyan"
              >
                {t}
              </span>
            ))}
          </div>
          <h1 className="mt-4 text-4xl font-semibold tracking-tightest text-pure sm:text-5xl">
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="mt-4 text-lg text-ghost">{post.excerpt}</p>
          )}
        </header>

        {post.cover_url && (
          <img
            src={post.cover_url}
            alt={post.title}
            className="mt-10 aspect-[16/9] w-full rounded-lg border border-[rgba(255,255,255,0.06)] object-cover"
          />
        )}

        <div className="mt-10">
          <MarkdownView content={post.body_md} />
        </div>
      </article>
    </RootLayout>
  );
}
