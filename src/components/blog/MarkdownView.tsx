import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function MarkdownView({ content }: { content: string }) {
  return (
    <div className="prose prose-invert max-w-none prose-headings:tracking-tightest prose-headings:text-pure prose-p:text-ghost prose-a:text-cyan prose-strong:text-pure prose-li:text-ghost prose-code:text-cyan prose-blockquote:border-cyan prose-blockquote:text-ghost">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
