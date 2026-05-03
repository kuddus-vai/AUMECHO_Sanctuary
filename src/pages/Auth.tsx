import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RootLayout } from "@/components/layout/RootLayout";
import { SEO } from "@/components/seo/SEO";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export default function Auth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate("/admin/blog", { replace: true });
    });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setSubmitting(false);
      if (error) return toast({ title: error.message, variant: "destructive" });
      navigate("/admin/blog");
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/admin/blog` },
      });
      setSubmitting(false);
      if (error) return toast({ title: error.message, variant: "destructive" });
      toast({ title: "Account created", description: "Check your email to confirm." });
    }
  };

  return (
    <RootLayout>
      <SEO title="Sign in" description="Sign in to manage AUMECHO content." />
      <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-5 py-16">
        <form
          onSubmit={submit}
          className="w-full rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] p-8"
        >
          <h1 className="text-2xl font-semibold tracking-tightest text-pure">
            {mode === "signin" ? "Sign in" : "Create account"}
          </h1>
          <p className="mt-1 text-sm text-ghost">Admin access only.</p>

          <label className="mt-6 block">
            <span className="font-mono text-[10px] uppercase tracking-hud text-slate">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-[rgba(255,255,255,0.1)] bg-void px-3 py-2.5 text-pure focus:border-cyan focus:outline-none"
            />
          </label>

          <label className="mt-4 block">
            <span className="font-mono text-[10px] uppercase tracking-hud text-slate">Password</span>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-md border border-[rgba(255,255,255,0.1)] bg-void px-3 py-2.5 text-pure focus:border-cyan focus:outline-none"
            />
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 w-full rounded-md bg-cyan py-3 font-mono text-[11px] uppercase tracking-hud text-void transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? "Please wait…" : mode === "signin" ? "Sign in" : "Sign up"}
          </button>

          <button
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="mt-4 w-full text-center font-mono text-[11px] uppercase tracking-hud text-ghost hover:text-cyan"
          >
            {mode === "signin" ? "Need an account? Sign up" : "Have an account? Sign in"}
          </button>
        </form>
      </div>
    </RootLayout>
  );
}
