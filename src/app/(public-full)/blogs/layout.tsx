import "./blog.css";
export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="realty-blog">{children}</div>;
}
