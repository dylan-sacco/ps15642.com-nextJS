import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import slugify from "slugify";

export async function POST(req) {
  const { title, content } = await req.json();

  if (!title || !content) {
    return NextResponse.json({ error: "Missing title or content" }, { status: 400 });
  }

  try {
    const blogsDir = path.join(process.cwd(), "public/blogs");
    await mkdir(blogsDir, { recursive: true });

    const slug = slugify(title, { lower: true, strict: true });
    const filePath = path.join(blogsDir, `${slug}.mdx`);

    // Build frontmatter string with date
    const date = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    const frontmatter = `---
title: ${title}
date: ${date}
---

`;

    // Combine frontmatter + content
    const fullContent = frontmatter + content;

    await writeFile(filePath, fullContent);

    return NextResponse.json({ success: true, slug });
  } catch (err) {
    console.error("Save blog error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
