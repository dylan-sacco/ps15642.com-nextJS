// components/LoginForm.tsx
"use client";

import { useState } from "react";

export default function LoginForm({ onSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loginErrorMessage, setLoginErrorMessage] = useState("");

  const clearFields = () => {
    setUsername("");
    setPassword("");
    setLoginErrorMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginErrorMessage("");

    await new Promise((res) => setTimeout(res, 2000));

    if (
      username !== process.env.NEXT_PUBLIC_BLOG_USERNAME ||
      password !== process.env.NEXT_PUBLIC_BLOG_PASSWORD
    ) {
      clearFields();
      setLoginErrorMessage("Invalid username or password.");
      setIsLoading(false);
      return;
    }

    onSuccess();
    setIsLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white shadow-lg rounded-lg p-8 w-full max-w-sm"
    >
      <h2 className="text-2xl font-bold mb-6 text-center">Admin Login</h2>

      {loginErrorMessage && (
        <p className="text-red-500 text-sm mb-4 text-center">
          {loginErrorMessage}
        </p>
      )}

      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        disabled={isLoading}
        className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={isLoading}
        className="w-full p-3 mb-6 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
      />

      <button
        type="submit"
        disabled={isLoading}
        className={`w-full p-3 text-white rounded-lg transition ${
          isLoading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {isLoading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}
