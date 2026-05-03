import { Helmet } from "react-helmet-async";

interface SEOProps {
  title: string;
  description?: string;
  canonical?: string;
  image?: string;
  type?: "website" | "article";
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

const SITE = "https://aumecho.hightechenterprise.xyz";
const DEFAULT_IMAGE = `${SITE}/og-image.jpg`;

export function SEO({
  title,
  description = "AUMECHO — lofi music for focused minds. Series, shorts, and curated playlists.",
  canonical,
  image = DEFAULT_IMAGE,
  type = "website",
  jsonLd,
}: SEOProps) {
  const url = canonical ?? (typeof window !== "undefined" ? window.location.href : SITE);
  const fullTitle = title.includes("AUMECHO") ? title : `${title} | AUMECHO`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
}
