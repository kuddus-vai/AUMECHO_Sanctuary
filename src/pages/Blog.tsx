import { RootLayout } from "@/components/layout/RootLayout";
import { SEO } from "@/components/seo/SEO";
import { PostCard } from "@/components/blog/PostCard";
import { useBlogPosts } from "@/hooks/useBlogPosts";

export default function Blog() {
  const { data: posts, isLoading } = useBlogPosts();

  return (
    <RootLayout>
      <SEO
        title="Blog — Notes, mixes, and updates from AUMECHO"
        description="Read the AUMECHO blog: behind-the-scenes notes on lofi production, new releases, and updates from the studio."
      />
      <div className="mx-auto max-w-[1200px] px-5 py-16 sm:px-8 sm:py-24">
        <header className="mb-12 max-w-3xl">
          <p className="font-mono text-[11px] uppercase tracking-hud text-cyan">
            // JOURNAL
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tightest text-pure sm:text-5xl">
            The AUMECHO Blog
          </h1>
          <p className="mt-4 text-base text-ghost sm:text-lg">
            Notes from the studio — releases, the craft of lofi, and updates from
            our community.
          </p>
        </header>

        {isLoading && (
          <p className="font-mono text-xs text-slate">Loading posts…</p>
        )}

        {!isLoading && posts && posts.length === 0 && (
          <p className="font-mono text-xs text-slate">No posts yet — check back soon.</p>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts?.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>
      </div>
    </RootLayout>
  );
}
