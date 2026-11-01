"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { searchItems } from "@/lib/navigation-data";

export function NavbarSearch() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const term = query.trim().toLowerCase();
  const results = term
    ? searchItems.filter((item) => item.searchText.includes(term)).slice(0, 8)
    : [];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey &&
        !(
          e.target instanceof HTMLElement &&
          (e.target.isContentEditable ||
            /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName))
        )
      ) {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      } else if (e.key === "Escape") {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (!results.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const selected = results[selectedIndex];
      if (selected) {
        setIsOpen(false);
        setQuery("");
        router.push(selected.url);
      }
    }
  };

  return (
    <div className="navbar-search-wrapper" ref={containerRef}>
      <label className="navbar-search search-field">
        <Search size={14} aria-hidden="true" />
        <input
          ref={inputRef}
          aria-label="Search course lessons"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleInputKeyDown}
          placeholder="Search lessons… (/)"
        />
        {query ? (
          <button
            type="button"
            className="navbar-search-clear"
            aria-label="Clear search"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
          >
            <X size={13} />
          </button>
        ) : (
          <kbd className="navbar-search-kbd">/</kbd>
        )}
      </label>
      {isOpen && term && (
        <div className="navbar-search-dropdown" role="listbox">
          {results.length > 0 ? (
            results.map((item, idx) => (
              <Link
                key={item.url}
                href={item.url}
                className={`navbar-search-item ${idx === selectedIndex ? "selected" : ""}`}
                role="option"
                aria-selected={idx === selectedIndex}
                onClick={() => {
                  setIsOpen(false);
                  setQuery("");
                }}
              >
                <span className="navbar-search-item-badge">
                  {item.category}
                </span>
                <span className="navbar-search-item-title">{item.title}</span>
              </Link>
            ))
          ) : (
            <div className="navbar-search-empty">No matching lessons</div>
          )}
        </div>
      )}
    </div>
  );
}
