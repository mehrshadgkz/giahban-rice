// Path: /app/components
// File: StarRatingInput.tsx
// Version: 1.0.0
//
// Interactive 1-5 star picker for submitting a review. Hovering shows
// a preview of what clicking would set; the actual selected rating
// stays highlighted once clicked.

"use client";

import { useState } from "react";

type StarRatingInputProps = {
  value: number;
  onChange: (rating: number) => void;
};

export default function StarRatingInput({ value, onChange }: StarRatingInputProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="flex gap-1" dir="ltr">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= (hovered ?? value);
        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(null)}
            aria-label={`${star} ستاره`}
            className={`text-2xl transition ${
              isFilled ? "text-yellow-500" : "text-gray-300"
            }`}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}