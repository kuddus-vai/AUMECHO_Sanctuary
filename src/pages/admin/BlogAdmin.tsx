import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Trash2 } from "lucide-react";
import { RootLayout } from "@/components/layout/RootLayout";
import { SEO } from "@/components/seo/SEO";
import { RequireAdmin } from "@/components/auth/RequireAdmin";
import { supabase } from "@/integrations/supabase/client";
import type { BlogPost } from "@/hooks/useBlogPosts";
import { toast } from "@/hooks/use-toast";

function AdminInner() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .order("created_at", { ascending: false });
    setLoading(false);
    if (error) return toast({ title: error.message, variant: "destructive" });
    setPosts((data ?? []) as BlogPost[]);
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    const { error } = await supabase.from("blog_posts").delete().eq("id", id);
    if (error) return toast({ title: error.message, variant: "destructive" });
    setPosts((p) => p.filter((x) => x.id !== id));
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <RootLayout>
      <SEO title="Blog admin" />
      <div className="mx-auto max-w-[1200px] px-5 py-16 sm:px-8 sm:py-20">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold tracking-tightest text-pure">
            Blog admin
          </h1>
          <div className="flex gap-3">
            <Link
              to="/admin/blog/new"
              className="inline-flex items-center gap-2 rounded-md bg-cyan px-4 py-2 font-mono text-[11px] uppercase tracking-hud text-void hover:opacity-90"
            >
              <Plus size={14} /> New post
            </Link>
            <button
              onClick={signOut}
              className="rounded-md border border-[rgba(255,255,255,0.1)] px-4 py-2 font-mono text-[11px] uppercase tracking-hud text-ghost hover:text-pure"
            >
              Sign out
            </button>
          </div>
        </div>

        <div className="mt-10 overflow-hidden rounded-lg border border-[rgba(255,255,255,0.06)]">
          {loading && <p className="p-6 text-ghost">Loading…</p>}
          {!loading && posts.length === 0 && (
            <p className="p-6 text-ghost">No posts yet.</p>
          )}
          {posts.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between gap-4 border-b border-[rgba(255,255,255,0.06)] px-5 py-4 last:border-b-0"
            >
              <div className="min-w-0">
                <Link
                  to={`/admin/blog/${p.id}`}
                  className="block truncate text-pure hover:text-cyan"
                >
                  {p.title}
                </Link>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-hud text-slate">
                  {p.published ? "Published" : "Draft"} · /{p.slug}
                </p>
              </div>
              <button
                onClick={() => remove(p.id)}
                className="rounded-md border border-[rgba(255,255,255,0.08)] p-2 text-ghost hover:border-red-500/50 hover:text-red-400"
                aria-label="Delete"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </RootLayout>
  );
}

export default function BlogAdmin() {
  return (
    <RequireAdmin>
      <AdminInner />
    </RequireAdmin>
  );
}
