import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { RootLayout } from "@/components/layout/RootLayout";
import { SEO } from "@/components/seo/SEO";
import { RequireAdmin } from "@/components/auth/RequireAdmin";
import { MarkdownView } from "@/components/blog/MarkdownView";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { X, Upload, Eye, FileText, Loader2, Check, CloudOff, ChevronDown, ChevronRight, AlertCircle } from "lucide-react";

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
  const fileRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [excerpt, setExcerpt] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [published, setPublished] = useState(false);

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [publishToggling, setPublishToggling] = useState(false);
  const [publishError, setPublishError] = useState<{
    message: string;
    code?: string;
    details?: string;
    hint?: string;
    status?: number;
    attemptedState?: boolean;
    at?: string;
  } | null>(null);
  const [errorOpen, setErrorOpen] = useState(false);

  // Autosave state
  const [postId, setPostId] = useState<string | null>(isNew ? null : id!);
  const [dirty, setDirty] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [autoError, setAutoError] = useState<string | null>(null);
  const hydratedRef = useRef(isNew); // suppress dirty on initial load
  const inFlightRef = useRef(false);

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
        setSlugTouched(true);
        setExcerpt(data.excerpt ?? "");
        setCoverUrl(data.cover_url ?? "");
        setBody(data.body_md);
        setTags(data.tags ?? []);
        setPublished(data.published);
        hydratedRef.current = true;
      });
  }, [id, isNew]);

  // Mark dirty whenever an editable field changes (after hydration)
  useEffect(() => {
    if (!hydratedRef.current) return;
    setDirty(true);
  }, [title, slug, excerpt, coverUrl, body, tags, published]);

  // Debounced autosave loop — saves 2s after last edit
  useEffect(() => {
    if (!dirty) return;
    if (!title.trim()) return; // need a title to create/save
    const t = setTimeout(() => {
      void autoSave();
    }, 2000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dirty, title, slug, excerpt, coverUrl, body, tags, published]);

  // Warn on unload if unsaved
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (dirty || autoSaving) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty, autoSaving]);

  const buildPayload = (publishState: boolean) => ({
    title: title.trim(),
    slug: slug || slugify(title),
    excerpt: excerpt || null,
    cover_url: coverUrl || null,
    body_md: body,
    tags,
    published: publishState,
    published_at: publishState ? new Date().toISOString() : null,
  });

  const autoSave = async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setAutoSaving(true);
    setAutoError(null);
    const payload = buildPayload(published);
    const { data, error } = postId
      ? await supabase.from("blog_posts").update(payload).eq("id", postId).select("id").maybeSingle()
      : await supabase.from("blog_posts").insert(payload).select("id").maybeSingle();
    inFlightRef.current = false;
    setAutoSaving(false);
    if (error) {
      setAutoError(error.message);
      return;
    }
    setDirty(false);
    setLastSavedAt(new Date());
    if (!postId && data?.id) {
      setPostId(data.id);
      window.history.replaceState(null, "", `/admin/blog/${data.id}`);
    }
  };

  // Auto-generate slug from title until user edits slug manually
  useEffect(() => {
    if (!slugTouched) setSlug(slugify(title));
  }, [title, slugTouched]);

  const addTag = (raw: string) => {
    const t = raw.trim().replace(/,$/, "");
    if (!t) return;
    if (!tags.includes(t)) setTags([...tags, t]);
    setTagInput("");
  };

  const handleTagKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "," || e.key === "Tab") {
      if (tagInput.trim()) {
        e.preventDefault();
        addTag(tagInput);
      }
    } else if (e.key === "Backspace" && !tagInput && tags.length) {
      setTags(tags.slice(0, -1));
    }
  };

  const handleUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      return toast({ title: "Please select an image", variant: "destructive" });
    }
    if (file.size > 5 * 1024 * 1024) {
      return toast({ title: "Max 5MB", variant: "destructive" });
    }
    setUploading(true);
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("blog-covers").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });
    if (error) {
      setUploading(false);
      return toast({ title: error.message, variant: "destructive" });
    }
    const { data } = supabase.storage.from("blog-covers").getPublicUrl(path);
    setCoverUrl(data.publicUrl);
    setUploading(false);
    toast({ title: "Cover uploaded" });
  };

  const persist = async (publishState: boolean) => {
    if (!title.trim()) return toast({ title: "Title required", variant: "destructive" });
    setSaving(true);
    const payload = buildPayload(publishState);

    const { data, error } = postId
      ? await supabase.from("blog_posts").update(payload).eq("id", postId).select("id").maybeSingle()
      : await supabase.from("blog_posts").insert(payload).select("id").maybeSingle();

    setSaving(false);
    if (error) return toast({ title: error.message, variant: "destructive" });
    setPublished(publishState);
    setDirty(false);
    setLastSavedAt(new Date());
    toast({ title: publishState ? "Published" : "Draft saved" });
    if (!postId && data?.id) {
      setPostId(data.id);
      navigate(`/admin/blog/${data.id}`, { replace: true });
    }
  };

  const savedLabel = (() => {
    if (autoSaving) return "Saving…";
    if (autoError) return "Save failed";
    if (dirty) return "Unsaved changes";
    if (lastSavedAt) {
      const s = Math.round((Date.now() - lastSavedAt.getTime()) / 1000);
      if (s < 5) return "Saved just now";
      if (s < 60) return `Saved ${s}s ago`;
      return `Saved ${Math.round(s / 60)}m ago`;
    }
    return "";
  })();

  if (loading) {
    return (
      <RootLayout>
        <div className="mx-auto max-w-3xl px-5 py-24 text-ghost">Loading…</div>
      </RootLayout>
    );
  }

  return (
    <RootLayout>
      <SEO title={isNew ? "New post" : `Edit · ${title || "post"}`} />
      <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-hud text-slate">
              {isNew ? "New post" : "Editing"}
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tightest text-pure">
              {title || "Untitled"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {savedLabel && (
              <span
                className={`inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-hud ${
                  autoError ? "text-red-400" : autoSaving || dirty ? "text-slate" : "text-cyan/80"
                }`}
                title={autoError ?? undefined}
              >
                {autoSaving ? (
                  <Loader2 size={11} className="animate-spin" />
                ) : autoError ? (
                  <CloudOff size={11} />
                ) : !dirty && lastSavedAt ? (
                  <Check size={11} />
                ) : null}
                {savedLabel}
              </span>
            )}
            {(dirty || autoSaving) && (
              <button
                type="button"
                disabled={autoSaving || !title.trim()}
                onClick={() => autoSave()}
                className="rounded-sm px-2 py-1 font-mono text-[10px] uppercase tracking-hud text-cyan hover:bg-cyan/10 disabled:pointer-events-none disabled:opacity-40"
              >
                {autoSaving ? "Saving…" : "Save now"}
              </button>
            )}
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-hud ${
                published ? "bg-cyan/10 text-cyan" : "bg-white/5 text-slate"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${published ? "bg-cyan" : "bg-slate"}`} />
              {published ? "Published" : "Draft"}
            </span>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_280px]">
          {/* Main editor */}
          <div className="space-y-5">
            <Field label="Title">
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="An unforgettable headline"
                className={inputCls}
              />
            </Field>

            <Field label="Slug">
              <div className="flex items-stretch overflow-hidden rounded-md border border-[rgba(255,255,255,0.1)] bg-void focus-within:border-cyan">
                <span className="flex items-center px-3 font-mono text-[11px] text-slate">/blog/</span>
                <input
                  required
                  value={slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setSlug(slugify(e.target.value));
                  }}
                  className="flex-1 bg-transparent px-1 py-2.5 text-pure focus:outline-none"
                />
                {slugTouched && (
                  <button
                    type="button"
                    onClick={() => {
                      setSlugTouched(false);
                      setSlug(slugify(title));
                    }}
                    className="px-3 font-mono text-[10px] uppercase tracking-hud text-slate hover:text-cyan"
                  >
                    Auto
                  </button>
                )}
              </div>
            </Field>

            <Field label="Excerpt">
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={2}
                placeholder="Short summary for cards & SEO"
                className={inputCls}
              />
            </Field>

            {/* Body with tabs */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-hud text-slate">Body</span>
                <div className="flex rounded-md border border-[rgba(255,255,255,0.1)] p-0.5">
                  <button
                    type="button"
                    onClick={() => setTab("write")}
                    className={`flex items-center gap-1.5 rounded px-2.5 py-1 font-mono text-[10px] uppercase tracking-hud ${
                      tab === "write" ? "bg-white/10 text-pure" : "text-slate hover:text-pure"
                    }`}
                  >
                    <FileText size={11} /> Write
                  </button>
                  <button
                    type="button"
                    onClick={() => setTab("preview")}
                    className={`flex items-center gap-1.5 rounded px-2.5 py-1 font-mono text-[10px] uppercase tracking-hud ${
                      tab === "preview" ? "bg-white/10 text-pure" : "text-slate hover:text-pure"
                    }`}
                  >
                    <Eye size={11} /> Preview
                  </button>
                </div>
              </div>
              {tab === "write" ? (
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={20}
                  placeholder="# Write in markdown…"
                  className={`${inputCls} font-mono text-sm leading-relaxed`}
                />
              ) : (
                <div className="min-h-[400px] rounded-md border border-[rgba(255,255,255,0.1)] bg-void p-6">
                  {body.trim() ? (
                    <MarkdownView content={body} />
                  ) : (
                    <p className="text-slate">Nothing to preview yet.</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-5">
            {/* Cover */}
            <div>
              <span className="mb-2 block font-mono text-[10px] uppercase tracking-hud text-slate">
                Cover image
              </span>
              {coverUrl ? (
                <div className="group relative overflow-hidden rounded-md border border-[rgba(255,255,255,0.1)]">
                  <img src={coverUrl} alt="Cover" className="aspect-video w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setCoverUrl("")}
                    className="absolute right-2 top-2 rounded-full bg-void/80 p-1.5 text-pure opacity-0 transition group-hover:opacity-100"
                    aria-label="Remove cover"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed border-[rgba(255,255,255,0.15)] bg-void/50 text-slate transition hover:border-cyan hover:text-cyan disabled:opacity-50"
                >
                  {uploading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <>
                      <Upload size={20} />
                      <span className="font-mono text-[10px] uppercase tracking-hud">Upload</span>
                    </>
                  )}
                </button>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleUpload(f);
                  e.target.value = "";
                }}
              />
              <input
                type="url"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                placeholder="…or paste URL"
                className={`${inputCls} mt-2 text-xs`}
              />
            </div>

            {/* Tags */}
            <div>
              <span className="mb-2 block font-mono text-[10px] uppercase tracking-hud text-slate">
                Tags
              </span>
              <div className="flex flex-wrap gap-1.5 rounded-md border border-[rgba(255,255,255,0.1)] bg-void p-2 focus-within:border-cyan">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 rounded-full bg-cyan/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-hud text-cyan"
                  >
                    {t}
                    <button
                      type="button"
                      onClick={() => setTags(tags.filter((x) => x !== t))}
                      className="opacity-60 hover:opacity-100"
                      aria-label={`Remove ${t}`}
                    >
                      <X size={10} />
                    </button>
                  </span>
                ))}
                <input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKey}
                  onBlur={() => tagInput.trim() && addTag(tagInput)}
                  placeholder={tags.length ? "" : "Add tag…"}
                  className="min-w-[80px] flex-1 bg-transparent px-1 text-sm text-pure placeholder:text-slate focus:outline-none"
                />
              </div>
              <p className="mt-1.5 font-mono text-[10px] text-slate">Enter or comma to add</p>
            </div>

            {/* Publish toggle */}
            <div
              className={`rounded-md border bg-void p-4 transition ${
                publishError ? "border-red-400/60" : "border-[rgba(255,255,255,0.1)]"
              }`}
            >
              <label className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-hud text-slate">Visibility</p>
                  <p className="flex items-center gap-2 text-pure">
                    {published ? "Published" : "Draft"}
                    {publishToggling && <Loader2 size={12} className="animate-spin text-slate" />}
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={published}
                  disabled={saving || autoSaving || publishToggling || !postId}
                  onClick={() => void applyPublish(!published)}
                  className={`relative h-6 w-11 rounded-full transition disabled:opacity-50 ${
                    published ? "bg-cyan" : "bg-white/15"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-pure transition ${
                      published ? "left-[22px]" : "left-0.5"
                    }`}
                  />
                </button>
              </label>
              {publishError ? (
                <div className="mt-3 rounded-sm border border-red-400/40 bg-red-400/5">
                  <button
                    type="button"
                    onClick={() => setErrorOpen((o) => !o)}
                    className="flex w-full items-center justify-between gap-2 px-2.5 py-2 text-left"
                    aria-expanded={errorOpen}
                  >
                    <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-hud text-red-400">
                      <AlertCircle size={11} />
                      Sync failed — reverted
                    </span>
                    {errorOpen ? (
                      <ChevronDown size={12} className="text-red-400/70" />
                    ) : (
                      <ChevronRight size={12} className="text-red-400/70" />
                    )}
                  </button>
                  {errorOpen && (
                    <div className="space-y-1.5 border-t border-red-400/20 px-2.5 py-2 font-mono text-[10px] text-ghost">
                      <ErrorRow label="Message" value={publishError.message} />
                      {publishError.code && <ErrorRow label="Code" value={publishError.code} />}
                      {publishError.status !== undefined && (
                        <ErrorRow label="Status" value={String(publishError.status)} />
                      )}
                      {publishError.details && (
                        <ErrorRow label="Details" value={publishError.details} />
                      )}
                      {publishError.hint && <ErrorRow label="Hint" value={publishError.hint} />}
                      {publishError.attemptedState !== undefined && (
                        <ErrorRow
                          label="Tried"
                          value={publishError.attemptedState ? "publish" : "unpublish"}
                        />
                      )}
                      {publishError.at && (
                        <ErrorRow
                          label="At"
                          value={new Date(publishError.at).toLocaleTimeString()}
                        />
                      )}
                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setPublishError(null);
                            setErrorOpen(false);
                          }}
                          className="rounded-sm px-2 py-0.5 uppercase tracking-hud text-slate hover:text-pure"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="mt-2 font-mono text-[10px] text-slate">
                  {postId ? "Toggling syncs immediately." : "Save the post first to publish."}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <button
                type="button"
                disabled={saving}
                onClick={() => persist(true)}
                className="w-full rounded-md bg-cyan px-6 py-3 font-mono text-[11px] uppercase tracking-hud text-void hover:opacity-90 disabled:opacity-50"
              >
                {saving ? "Saving…" : published ? "Update" : "Publish"}
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => persist(false)}
                className="w-full rounded-md border border-[rgba(255,255,255,0.1)] px-6 py-3 font-mono text-[11px] uppercase tracking-hud text-ghost hover:text-pure disabled:opacity-50"
              >
                Save draft
              </button>
              <button
                type="button"
                onClick={() => navigate("/admin/blog")}
                className="w-full px-6 py-2 font-mono text-[10px] uppercase tracking-hud text-slate hover:text-pure"
              >
                Cancel
              </button>
            </div>
          </aside>
        </div>
      </div>
    </RootLayout>
  );
}

const inputCls =
  "w-full rounded-md border border-[rgba(255,255,255,0.1)] bg-void px-3 py-2.5 text-pure placeholder:text-slate focus:border-cyan focus:outline-none";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-hud text-slate">
        {label}
      </span>
      {children}
    </label>
  );
}

function ErrorRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="w-14 shrink-0 uppercase tracking-hud text-slate">{label}</span>
      <span className="break-all text-pure/90">{value}</span>
    </div>
  );
}

export default function BlogEditor() {
  return (
    <RequireAdmin>
      <EditorInner />
    </RequireAdmin>
  );
}
