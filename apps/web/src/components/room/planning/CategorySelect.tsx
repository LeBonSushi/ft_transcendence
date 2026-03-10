'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';

const ACTIVITY_CATEGORY_LABELS: Record<string, string> = {
  RESTAURANT: '🍽️ Restaurant',
  MUSEUM: '🏛️ Museum',
  NIGHTLIFE: '🎉 Night',
  OUTDOOR: '🌿 Outdoor',
  OTHER: '✨ Other',
};

export function CategorySelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [style, setStyle] = useState<React.CSSProperties>({});
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setStyle({ position: 'fixed', top: rect.bottom + 4, left: rect.left, minWidth: rect.width, zIndex: 9999 });
  }, [open]);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target as Node) &&
        !(e.target as Element).closest('[data-category-popup]')
      ) setOpen(false);
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  const label = ACTIVITY_CATEGORY_LABELS[value] ?? value;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1 text-[11px] px-1.5 py-1 rounded-md bg-background border transition-colors outline-none shrink-0 ${open ? 'border-primary/60' : 'border-border hover:border-primary/40'}`}
      >
        {label}
        <ChevronDown className="w-2.5 h-2.5 text-muted-foreground" />
      </button>
      {open && createPortal(
        <div data-category-popup className="rounded-lg border border-border bg-popover shadow-lg overflow-hidden" style={style}>
          {Object.entries(ACTIVITY_CATEGORY_LABELS).map(([k, l]) => (
            <button
              key={k}
              type="button"
              onPointerDown={e => { e.preventDefault(); onChange(k); setOpen(false); }}
              className={`w-full text-left text-[11px] px-3 py-1.5 transition-colors ${k === value ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted'}`}
            >
              {l}
            </button>
          ))}
        </div>,
        document.body
      )}
    </>
  );
}
