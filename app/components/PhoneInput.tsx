// app/components/PhoneInput.tsx
//
// Segmented phone number input. 4 fixed boxes ("+", "9", "8", "9") + 9
// editable boxes.
//
// Three distinct behaviors, matched to three real situations:
// - Typing into an EMPTY box with nothing after it (normal forward fill)
//   → places the digit and auto-advances to the next box.
// - Typing into an EMPTY box that has digits after it (a skipped/missed
//   digit) → inserts and shifts everything after it right, then advances.
// - Typing into a box that ALREADY has a digit (fixing a wrong digit)
//   → replaces it in place and does NOT auto-advance. This is the key
//   fix: auto-advancing after a correction used to auto-select the next
//   box's existing digit, so a coincidentally-matching next keystroke
//   would silently overwrite a digit that didn't need touching.

"use client";

import { useRef } from "react";

type PhoneInputProps = {
  value: string;
  onChange: (digits: string) => void;
};

const FIXED_PREFIX = ["+", "9", "8", "9"];
const BOX_COUNT = 9;

export default function PhoneInput({ value, onChange }: PhoneInputProps) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const digits = value
    .split("")
    .concat(Array(BOX_COUNT - value.length).fill(""))
    .slice(0, BOX_COUNT);

  function handleChange(index: number, e: React.ChangeEvent<HTMLInputElement>) {
    const char = e.target.value.replace(/\D/g, "").slice(-1);
    if (!char) return;

    const wasEmpty = !digits[index];
    const hasDigitsAfter = digits.slice(index + 1).some((d) => d !== "");

    const next = [...digits];

    if (wasEmpty && hasDigitsAfter) {
      // Missed-digit case: shift everything right to make room, then insert.
      for (let i = BOX_COUNT - 1; i > index; i--) {
        next[i] = next[i - 1];
      }
      next[index] = char;
    } else {
      // Either a normal empty-box fill, or a correction of an existing digit.
      next[index] = char;
    }

    onChange(next.join(""));

    // FIX: only auto-advance when we were filling an empty box (forward
    // fill or missed-digit insert). A correction (box wasn't empty) stays
    // put, so the person can review before moving on themselves.
    if (wasEmpty && index < BOX_COUNT - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  }

  function handlePaste(index: number, e: React.ClipboardEvent<HTMLInputElement>) {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!pasted) return;
    e.preventDefault();

    const next = [...digits];
    let cursor = index;
    for (const char of pasted) {
      if (cursor > BOX_COUNT - 1) break;
      next[cursor] = char;
      cursor++;
    }
    onChange(next.join(""));
    inputsRef.current[Math.min(cursor, BOX_COUNT - 1)]?.focus();
  }

  function handleFocus(e: React.FocusEvent<HTMLInputElement>) {
    e.target.select();
  }

  return (
    <div dir="ltr" className="flex gap-1 justify-center flex-nowrap overflow-x-auto px-1">
      {FIXED_PREFIX.map((char, i) => (
        <div
          key={`fixed-${i}`}
          className="shrink-0 w-6 h-9 flex items-center justify-center rounded-md border border-gray-300 bg-gray-50 text-gray-500 text-xs font-medium select-none"
        >
          {char}
        </div>
      ))}

      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputsRef.current[index] = el;
          }}
          type="tel"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={(e) => handlePaste(index, e)}
          onFocus={handleFocus}
          className="shrink-0 w-6 h-9 text-center border border-gray-300 rounded-md text-xs focus:border-green-700 focus:outline-none"
        />
      ))}
    </div>
  );
}