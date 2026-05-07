export default function BlogPostRenderer({ html }: { html: string }) {
  return (
    <div
      className="dfp-prose"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
