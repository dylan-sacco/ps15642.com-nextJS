'use client';

import { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

export default function MarkdownPreview({ body }) {
  useEffect(() => {
    const applyHighlight = () => {
      const hash = window.location.hash.slice(1);
      if (!hash) return;
      const el = document.getElementById(hash);
      if (!el) return;
      // Remove first to restart animation if same anchor is clicked twice
      el.classList.remove('anchor-highlight');
      void el.offsetWidth; // force reflow
      el.classList.add('anchor-highlight');
    };

    // Small delay on mount so the browser finishes its initial scroll first
    const timer = setTimeout(applyHighlight, 50);
    window.addEventListener('hashchange', applyHighlight);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('hashchange', applyHighlight);
    };
  }, []);

  if (!body) {
    return <p className="text-gray-400 italic text-sm">Nothing to preview yet.</p>;
  }

  return (
    <>
      <style>{`
        @keyframes anchor-flash {
          0%   { background-color: rgba(163, 230, 53, 0.35); }
          100% { background-color: transparent; }
        }
        .anchor-highlight {
          animation: anchor-flash 2.5s ease-out forwards;
          border-radius: 4px;
          padding-inline: 6px;
          margin-inline: -6px;
        }
      `}</style>
      <div className="prose prose-sm max-w-none text-gray-800 [&>h1]:text-2xl [&>h1]:font-bold [&>h1]:mb-3 [&>h2]:text-xl [&>h2]:font-semibold [&>h2]:mb-2 [&>h3]:text-lg [&>h3]:font-semibold [&>h3]:mb-2 [&>p]:mb-3 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-3 [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:mb-3 [&>blockquote]:border-l-4 [&>blockquote]:border-gray-300 [&>blockquote]:pl-4 [&>blockquote]:text-gray-600 [&>blockquote]:italic [&>pre]:bg-gray-900 [&>pre]:text-green-400 [&>pre]:p-3 [&>pre]:rounded [&>pre]:overflow-x-auto [&>pre]:text-sm [&>hr]:border-gray-300 [&>hr]:my-4 [&_a]:text-lime-700 [&_a]:underline [&_code]:bg-gray-100 [&_code]:px-1 [&_code]:rounded [&_code]:text-sm [&_table]:w-full [&_table]:border-collapse [&_th]:border [&_th]:border-gray-300 [&_th]:px-2 [&_th]:py-1 [&_th]:bg-gray-100 [&_td]:border [&_td]:border-gray-300 [&_td]:px-2 [&_td]:py-1 [&_video]:w-full [&_video]:rounded-lg [&_video]:my-3">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
        >
          {body}
        </ReactMarkdown>
      </div>
    </>
  );
}
