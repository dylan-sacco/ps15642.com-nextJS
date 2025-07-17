"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

export default function BlogEditor() {
  const [content, setContent] = useState("## Start writing your blog post...");
  const [title, setTitle] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const handleDrop = async (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file || !file.type.startsWith("image/")) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (res.ok && data?.filename) {
      const imagePath = `/blog-photos/${data.filename}`;
      setContent((prev) => `${prev}\n\n![](${imagePath})`);
    }

    setIsUploading(false);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      alert("Please enter a title.");
      return;
    }

    setIsSaving(true);
    setSaveMessage("");

    const res = await fetch("/api/save-blog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    });

    const data = await res.json();
    if (res.ok) {
      setSaveMessage("✅ Blog post saved!");
    } else {
      setSaveMessage(`❌ Failed to save: ${data.error}`);
    }

    setIsSaving(false);
  };

  return (
    <div
      className="w-full max-w-4xl mx-auto p-4"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <input
        type="text"
        placeholder="Post Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full p-3 mb-4 border rounded-lg"
      />

      {isUploading && (
        <p className="mb-2 text-blue-500">Uploading image...</p>
      )}

      <MDEditor value={content} onChange={setContent} height={500} />

      <button
        onClick={handleSave}
        disabled={isSaving}
        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {isSaving ? "Saving..." : "Save Post"}
      </button>

      {saveMessage && <p className="mt-2 text-sm">{saveMessage}</p>}
    </div>
  );
}
