import React from 'react';

export default function StarRating({ value = 0, onChange, size = 'text-sm' }) {
  return (
    <div className={`flex items-center gap-1 ${size}`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange && onChange(n)}
          className={`${
            onChange ? 'cursor-pointer hover:scale-110' : 'cursor-default'
          } transition-all ${
            n <= Math.round(value) ? 'text-[#e3b341]' : 'text-[#30363d] hover:text-[#e3b341]/50'
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
