'use client';
import { useRef, useState } from 'react';

/**
 * Tag input with autocomplete against an existing tag list.
 *
 * Suggestions are found by case-insensitive prefix match. Accepting a
 * suggestion uses the canonical capitalisation from the tag list, appends
 * ", " and places the cursor ready for the next tag.
 *
 * - Desktop: Tab to accept
 * - Mobile:  swipe right on the field to accept
 * - Esc:     dismiss suggestion
 */
export default function TagInput({ value, onChange, allTags = [], className = '' }) {
  const inputRef = useRef(null);
  const [suggestion, setSuggestion] = useState(null);
  const touchStartXRef = useRef(null);

  // Always reflects the latest value even inside stale closures.
  const latestValue = useRef(value);
  latestValue.current = value;

  // The fragment the user is currently typing (text after the last comma).
  function getFragment(val) {
    const i = val.lastIndexOf(',');
    return i === -1 ? val : val.slice(i + 1).trimStart();
  }

  // Case-insensitive prefix search; skips tags already present in the field.
  function findSuggestion(fragment, fullVal) {
    if (!fragment.trim()) return null;
    const lower = fragment.toLowerCase();
    const used = new Set(
      fullVal.split(',').map(t => t.trim().toLowerCase()).filter(Boolean)
    );
    return allTags.find(
      t => t.toLowerCase().startsWith(lower) && !used.has(t.toLowerCase())
    ) ?? null;
  }

  function accept(sug) {
    const cur = latestValue.current;
    const i = cur.lastIndexOf(',');
    // Replace the partial fragment after the last comma with the canonical tag.
    const prefix = i === -1 ? '' : cur.slice(0, i + 1) + ' ';
    onChange(prefix + sug + ', ');
    setSuggestion(null);
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  function handleChange(e) {
    const raw = e.target.value;
    onChange(raw);
    setSuggestion(findSuggestion(getFragment(raw), raw));
  }

  function handleKeyDown(e) {
    if (e.key === 'Tab' && suggestion) {
      e.preventDefault();
      accept(suggestion);
    } else if (e.key === 'Escape' && suggestion) {
      setSuggestion(null);
    }
  }

  function handleTouchStart(e) {
    touchStartXRef.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e) {
    if (!suggestion || touchStartXRef.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartXRef.current;
    touchStartXRef.current = null;
    if (dx > 50) accept(suggestion);
  }

  return (
    <div onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="lawn care, spring tips, North Huntingdon"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        className={`w-full border rounded px-3 py-1.5 text-sm outline-none focus:border-lime-500 transition-colors ${
          suggestion ? 'border-lime-400' : 'border-gray-300'
        } ${className}`}
      />
      {suggestion ? (
        <p className="text-xs mt-1 flex items-center gap-1.5 select-none">
          <span className="font-medium text-gray-700">{suggestion}</span>
          <span className="text-gray-300" aria-hidden="true">·</span>
          <span className="hidden sm:inline text-gray-400">
            <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-200 rounded font-mono text-[10px] text-gray-500 leading-none">
              tab
            </kbd>
            {' '}to accept
          </span>
          <span className="sm:hidden text-gray-400">swipe → to accept</span>
        </p>
      ) : null}
    </div>
  );
}
