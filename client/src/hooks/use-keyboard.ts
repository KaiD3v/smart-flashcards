"use client";

import { useEffect } from "react";

type KeyHandler = (event: KeyboardEvent) => void;

export function useKeyboardShortcut(
  keys: string[],
  handler: KeyHandler,
  options?: { enabled?: boolean; preventInInputs?: boolean }
) {
  useEffect(() => {
    if (options?.enabled === false) return;

    const normalized = keys.map((k) => k.toLowerCase());

    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (
        options?.preventInInputs !== false &&
        target &&
        ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)
      ) {
        return;
      }
      if (target?.isContentEditable) return;

      if (normalized.includes(event.key.toLowerCase())) {
        handler(event);
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [keys, handler, options?.enabled, options?.preventInInputs]);
}
