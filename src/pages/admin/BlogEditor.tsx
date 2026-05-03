import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { RootLayout } from "@/components/layout/RootLayout";
import { SEO } from "@/components/seo/SEO";
import { RequireAdmin } from "@/components/auth/RequireAdmin";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function EditorInner() {
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === "new";
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState("");
  const [published, setPublished] = useState(false);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isNew) return;
    supabase
      .from("blog_posts")
      .select("*")
      .eq("id", id!)
      .maybeSingle()
      .then(({ data, error }) => {
        setLoading(false);
        if (error || !data) return toast({ title: "Could not load post", variant: "destructive" });
        setTitle(data.title);
        setSlug(data.slug);
        setExcerpt(data.excerpt ?? "");
        setCoverUrl(data.cover_url ?? "");
        setBody(data.body_md);
        setTags((data.tags ?? []).join(", "));
        setPublished(data.published);
      });
  }, [id, isNew]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      title,
      slug: slug || slugify(title),
      excerpt: excerpt || null,
      cover_url: coverUrl || null,
      body_md: body,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      published,
      published_at: published ? new Date().toISOString() : null,
    };

    const { error } = isNew
      ? await supabase.from("blog_posts").insert(payload)
      : await supabase.from("blog_posts").update(payload).eq("id", id!);

    setSaving(false);
    if (error) return toast({ title: error.message, variant: "destructive" });
    toast({ title: "Saved" });
    navigate("/admin/blog");
  };

  if (loading) {
    return (
      <RootLayout>
        <div className="mx-auto max-w-3xl px-5 py-24 text-ghost">Loading…</div>
      </RootLayout>
    );
  }

  return (
    <RootLayout>
      <SEO title={isNew ? "New post" : "Edit post"} />
      <form onSubmit={save} className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-20">
        <h1 className="text-3xl font-semibold tracking-tightest text-pure">
          {isNew ? "New post" : "Edit post"}
        </h1>

        <div className="mt-8 space-y-5">
          <Field label="Title">
            <input
              required
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (isNew && !slug) setSlug(slugify(e.target.value));
              }}
              className={inputCls}
            />
          </Field>
          <Field label="Slug">
            <input
              required
              value={slug}
              onChange={(e) => setSlug(slugify(e.target.value))}
              className={inputCls}
            />
          </Field>
          <Field label="Excerpt">
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={2}
              className={inputCls}
            />
          </Field>
          <Field label="Cover image URL">
            <input
              type="url"
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Tags (comma separated)">
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Body (markdown)">
            <textarea
              required
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={18}
              className={`${inputCls} font-mono text-sm`}
            />
          </Field>

          <label className="flex items-center gap-3 text-ghost">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="h-4 w-4 accent-cyan"
            />
            Published
          </label>
        </div>

        <div className="mt-8 flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-cyan px-6 py-3 font-mono text-[11px] uppercase tracking-hud text-void hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin/blog")}
            className="rounded-md border border-[rgba(255,255,255,0.1)] px-6 py-3 font-mono text-[11px] uppercase tracking-hud text-ghost hover:text-pure"
          >
            Cancel
          </button>
        </div>
      </form>
    </RootLayout>
  );
}

const inputCls =
  "w-full rounded-md border border-[rgba(255,255,255,0.1)] bg-void px-3 py-2.5 text-pure focus:border-cyan focus:outline-none";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block font-mono text-[10px] uppercase tracking-hud text-slate">
        {label}
      </span>
      {children}
    </label>
  );
}

export default function BlogEditor() {
  return (
    <RequireAdmin>
      <EditorInner />
    </RequireAdmin>
  );
}
