'use client';

const tips = [
  { syntax: '# Heading 1', result: 'Large heading (H1)' },
  { syntax: '## Heading 2', result: 'Section heading (H2)' },
  { syntax: '### Heading 3', result: 'Sub-section (H3)' },
  { syntax: '**bold text**', result: 'Bold text' },
  { syntax: '*italic text*', result: 'Italic text' },
  { syntax: '~~strikethrough~~', result: 'Strikethrough text' },
  { syntax: '`inline code`', result: 'Inline code snippet' },
  { syntax: '```\ncode block\n```', result: 'Fenced code block' },
  { syntax: '[Link Text](https://url.com)', result: 'Hyperlink' },
  { syntax: '![Alt text](image-url.jpg)', result: 'Embedded image' },
  { syntax: '- Item\n- Item\n- Item', result: 'Bullet list' },
  { syntax: '1. First\n2. Second\n3. Third', result: 'Numbered list' },
  { syntax: '> Quoted text', result: 'Blockquote' },
  { syntax: '---', result: 'Horizontal rule / divider' },
  { syntax: '| Col 1 | Col 2 |\n|-------|-------|\n| A     | B     |', result: 'Table (GFM)' },
  { syntax: '- [x] Done\n- [ ] To do', result: 'Task list (GFM)' },
];

export default function MarkdownCheatSheet() {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
      <h3 className="font-semibold text-amber-800 mb-3 text-sm">Markdown Quick Reference</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {tips.map(({ syntax, result }) => (
          <div key={syntax} className="flex gap-2 items-start text-xs">
            <code className="bg-white border border-amber-300 rounded px-1.5 py-0.5 font-mono text-gray-700 whitespace-pre shrink-0 min-w-0 max-w-[50%] overflow-x-auto">
              {syntax}
            </code>
            <span className="text-amber-700 pt-0.5">{result}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-amber-600 mt-3">
        Tip: Press <kbd className="bg-white border border-amber-300 rounded px-1 font-mono">Tab</kbd> in the editor to indent with 2 spaces.
      </p>
    </div>
  );
}
