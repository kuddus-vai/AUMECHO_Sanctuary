import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  cover_url: string | null;
  body_md: string;
  tags: string[];
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export function useBlogPosts() {
  return useQuery({
    queryKey: ["blog_posts"],
    queryFn: async (): Promise<BlogPost[]> => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("published", true)
        .order("published_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as BlogPost[];
    },
  });
}

export function useBlogPost(slug?: string) {
  return useQuery({
    queryKey: ["blog_post", slug],
    enabled: !!slug,
    queryFn: async (): Promise<BlogPost | null> => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug!)
        .eq("published", true)
        .maybeSingle();
      if (error) throw error;
      return data as BlogPost | null;
    },
  });
}
