import React from 'react';

export default function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center p-4 bg-black/75 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[#161b22] border border-[#30363d] rounded-lg p-5 shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#30363d]">
          <h2 className="text-sm font-bold text-[#f0f6fc]">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#21262d] transition-colors text-xs"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
