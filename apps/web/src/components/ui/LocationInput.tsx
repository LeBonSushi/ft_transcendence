'use client';

import { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MapPin, Loader2 } from 'lucide-react';
import { useLocationSearch } from '@/hooks/useLocationSearch';
import { cn } from '@/lib/utils';

interface LocationInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  autoFocus?: boolean;
}

export function LocationInput({
  value,
  onChange,
  placeholder = 'Destination',
  className,
  inputClassName,
  autoFocus,
}: LocationInputProps) {
  const { results, loading, setQuery } = useLocationSearch();
  // inputText is what's displayed — fully independent from `value`
  const [inputText, setInputText] = useState(value);
  const [open, setOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // track whether the current inputText came from a confirmed selection
  const isConfirmed = useRef(!!value);

  // Only sync when value resets to empty (form reset)
  const prevValueRef = useRef(value);
  useEffect(() => {
    if (prevValueRef.current !== '' && value === '') {
      setInputText('');
      setQuery('');
      isConfirmed.current = false;
    }
    prevValueRef.current = value;
  }, [value]);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        if (!isConfirmed.current) {
          setInputText('');
          setQuery('');
          onChange('');
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onChange]);

  // Dropdown position
  useEffect(() => {
    if (!open || !containerRef.current) return;
    function updatePosition() {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setDropdownStyle({ position: 'fixed', top: rect.bottom + 4, left: rect.left, width: rect.width, zIndex: 9999 });
    }
    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [open]);

  function handleSelect(displayValue: string) {
    isConfirmed.current = true;
    setInputText(displayValue);
    setQuery('');
    setOpen(false);
    onChange(displayValue);
    inputRef.current?.blur();
  }

  const showDropdown = open && (results.length > 0 || loading);

  const dropdown = showDropdown
    ? createPortal(
        <div style={dropdownStyle} className="rounded-lg border border-border bg-popover shadow-lg overflow-hidden">
          {loading && results.length === 0 ? (
            <div className="flex items-center justify-center py-3">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            results.map((r, i) => (
              <button
                key={i}
                type="button"
                onPointerDown={e => {
                  e.preventDefault();
                  handleSelect(`${r.shortName}${r.country ? ', ' + r.country : ''}`);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-muted transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                <p className="text-xs font-medium truncate">
                  {r.shortName}
                  {r.country && <span className="text-muted-foreground font-normal">, {r.country}</span>}
                </p>
              </button>
            ))
          )}
        </div>,
        document.body
      )
    : null;

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div className="relative flex items-center">
        <MapPin className="absolute left-2.5 w-3.5 h-3.5 text-muted-foreground pointer-events-none shrink-0" />
        <input
          ref={inputRef}
          autoFocus={autoFocus}
          value={inputText}
          placeholder={placeholder}
          onChange={e => {
            isConfirmed.current = false;
            setInputText(e.target.value);
            setQuery(e.target.value);
            onChange('');
            setOpen(true);
          }}
          onFocus={() => {
            if (inputText.length >= 2 && !isConfirmed.current) setOpen(true);
          }}
          onKeyDown={e => {
            if (e.key === 'Escape') {
              setOpen(false);
              if (!isConfirmed.current) {
                setInputText('');
                setQuery('');
                onChange('');
              }
              inputRef.current?.blur();
            }
          }}
          className={cn(
            'w-full pl-7 pr-2.5 py-1.5 text-xs rounded-md bg-muted border outline-none transition-colors',
            isConfirmed.current && value
              ? 'border-primary/60'
              : inputText.length > 0
              ? 'border-amber-400/60'
              : 'border-border',
            inputClassName
          )}
        />
        {loading && (
          <Loader2 className="absolute right-2.5 w-3 h-3 animate-spin text-muted-foreground" />
        )}
      </div>
      {dropdown}
    </div>
  );
}
