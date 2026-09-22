// Path: /app/components
// File: OtpInput.tsx
// Version: 1.0.0
//
// Segmented 6-box OTP code entry. Same insert-on-gap vs overwrite-on-existing
// behavior as PhoneInput — see comments there for the reasoning.

"use client";

import { useRef } from "react";

type OtpInputProps = {
  value: string;
  onChange: (code: string) => void;
};

const BOX_COUNT = 6;

export default function OtpInput({ value, onChange }: OtpInputProps) {
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
      for (let i = BOX_COUNT - 1; i > index; i--) {
        next[i] = next[i - 1];
      }
      next[index] = char;
    } else {
      next[index] = char;
    }

    onChange(next.join(""));

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
    <div dir="ltr" className="flex gap-2 justify-center">
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
          className="w-10 h-12 text-center text-lg border border-gray-300 rounded-md focus:border-green-700 focus:outline-none"
        />
      ))}
    </div>
  );
}