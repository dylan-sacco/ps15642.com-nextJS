"use client";

import { useState } from "react";
import LoginForm from "@/components/private/LoginForm"; // adjust path as needed
import BlogEditor from "@/components/private/BlogEditor";

export default function BlogPostPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      {isLoggedIn ? (
        <>
          <h1 className="text-3xl font-semibold text-green-700">
            Welcome to the blog editor!
          </h1>
          <BlogEditor />
        </>
      ) : (
        <LoginForm onSuccess={() => setIsLoggedIn(true)} />
      )}
    </div>
  );
}
