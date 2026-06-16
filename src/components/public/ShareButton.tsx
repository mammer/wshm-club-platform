"use client";

import { useState } from "react";
import { IconLink, IconCheck } from "@tabler/icons-react";

export default function ShareButton({ copiedLabel, label }: { copiedLabel: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API unavailable — silently ignore
    }
  };

  return (
    <button
      onClick={copy}
      className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-[#CC0000] border border-gray-200 hover:border-[#CC0000]/30 rounded-full px-3 py-1.5 transition-colors"
    >
      {copied ? <IconCheck size={14} className="text-green-600" /> : <IconLink size={14} />}
      {copied ? copiedLabel : label}
    </button>
  );
}
