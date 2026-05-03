import { Link } from "react-router-dom";
import type { BlogPost } from "@/hooks/useBlogPosts";

export function PostCard({ post }: { post: BlogPost }) {
  const date = post.published_at
    ? new Date(post.published_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "";

  return (
    <Link
      to={`/blog/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] transition-all duration-300 hover:border-[rgba(0,242,255,0.3)] hover:shadow-glow-sm"
    >
      {post.cover_url && (
        <div className="aspect-[16/9] overflow-hidden">
          <img
            src={post.cover_url}
            alt={post.title}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-hud text-slate">
          <span>{date}</span>
          {post.tags?.[0] && (
            <span className="rounded-full border border-[rgba(0,242,255,0.3)] px-2 py-0.5 text-cyan">
              {post.tags[0]}
            </span>
          )}
        </div>
        <h2 className="text-xl font-semibold tracking-tightest text-pure transition-colors group-hover:text-cyan">
          {post.title}
        </h2>
        {post.excerpt && (
          <p className="line-clamp-3 text-sm text-ghost">{post.excerpt}</p>
        )}
      </div>
    </Link>
  );
}
