import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { MDXRemote } from "next-mdx-remote/rsc"; // for App Router
import "./globals.css";

export default async function BlogPostPage({ params }) {
  const { slug } = params;

  const blogPath = path.join(process.cwd(), "public", "blogs", `${slug}.mdx`);

  if (!fs.existsSync(blogPath)) {
    return <div className="p-10 text-red-500">Blog post not found.</div>;
  }

  const fileContent = fs.readFileSync(blogPath, "utf8");
  const { content, data } = matter(fileContent);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-6">{data.title || slug}</h1>
      <article className="prose max-w-none">
        <MDXRemote source={content} />
      </article>
    </div>
  );
}
