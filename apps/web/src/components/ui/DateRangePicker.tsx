'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  format, addMonths, subMonths, startOfMonth, endOfMonth,
  eachDayOfInterval, isSameMonth, isSameDay, isWithinInterval,
  isBefore, isAfter, startOfWeek, endOfWeek,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DateRangePickerProps {
  startDate: string; // yyyy-MM-dd
  endDate: string;   // yyyy-MM-dd
  onChangeStart: (v: string) => void;
  onChangeEnd: (v: string) => void;
  placeholderStart?: string;
  placeholderEnd?: string;
  className?: string;
}

function fmt(d: Date) {
  return format(d, 'yyyy-MM-dd');
}

function displayFmt(d: Date) {
  return format(d, 'd MMM yyyy', { locale: fr });
}

export function DateRangePicker({
  startDate,
  endDate,
  onChangeStart,
  onChangeEnd,
  placeholderStart = 'Departure',
  placeholderEnd = 'Back',
  className,
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState<Date | null>(null);
  const [leftMonth, setLeftMonth] = useState(() => {
    return startDate ? startOfMonth(new Date(startDate)) : startOfMonth(new Date());
  });
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const triggerRef = useRef<HTMLButtonElement>(null);

  const start = startDate ? new Date(startDate + 'T00:00:00') : null;
  const end = endDate ? new Date(endDate + 'T00:00:00') : null;
  const rightMonth = addMonths(leftMonth, 1);

  // Helper function to get today at midnight
  const getTodayAtMidnight = (): Date => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  };

  // selecting: null = nothing, 'end' = start chosen waiting for end
  const selecting = start && !end ? 'end' : null;

  useEffect(() => {
    if (!open || !triggerRef.current) return;
    function updatePos() {
      if (!triggerRef.current) return;
      const rect = triggerRef.current.getBoundingClientRect();
      const calWidth = window.innerWidth < 640 ? window.innerWidth - 32 : 640;
      let left = rect.left;
      if (left + calWidth > window.innerWidth - 8) left = window.innerWidth - calWidth - 8;
      setDropdownStyle({
        position: 'fixed',
        top: rect.bottom + 6,
        left: Math.max(8, left),
        width: calWidth,
        zIndex: 9999,
      });
    }
    updatePos();
    window.addEventListener('scroll', updatePos, true);
    window.addEventListener('resize', updatePos);
    return () => {
      window.removeEventListener('scroll', updatePos, true);
      window.removeEventListener('resize', updatePos);
    };
  }, [open]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node) &&
        !(e.target as Element).closest('[data-datepicker-popup]')
      ) {
        setOpen(false);
        setHovered(null);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  function handleDayClick(day: Date) {
    const today = new Date(); today.setHours(0,0,0,0);
    if (isBefore(day, today)) return;

    if (!start || (start && end)) {
      // Start fresh
      onChangeStart(fmt(day));
    } else {
      // start chosen, pick end
      if (isBefore(day, start)) {
        onChangeStart(fmt(day));
      } else if (isSameDay(day, start)) {
        // do nothing
      } else {
        onChangeEnd(fmt(day));
        setOpen(false);
        setHovered(null);
      }
    }
  }

  function isInRange(day: Date) {
    if (!start) return false;
    const rangeEnd = end ?? hovered;
    if (!rangeEnd) return false;
    const [s, e2] = isBefore(start, rangeEnd) ? [start, rangeEnd] : [rangeEnd, start];
    return isWithinInterval(day, { start: s, end: e2 });
  }

  function isRangeStart(day: Date) {
    return !!start && isSameDay(day, start);
  }

  function isRangeEnd(day: Date) {
    const rangeEnd = end ?? (hovered && start && isAfter(hovered, start) ? hovered : null);
    return !!rangeEnd && isSameDay(day, rangeEnd);
  }

  function renderMonth(month: Date) {
    const today = new Date(); today.setHours(0,0,0,0);
    const firstDay = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
    const lastDay = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: firstDay, end: lastDay });
    const weekDays = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'];

    return (
      <div className="flex-1 min-w-0">
        <p className="text-center text-xs font-semibold mb-3 capitalize">
          {format(month, 'MMMM yyyy', { locale: fr })}
        </p>
        <div className="grid grid-cols-7 mb-1">
          {weekDays.map(d => (
            <div key={d} className="text-center text-[10px] text-muted-foreground font-medium py-1">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((day, i) => {
            const isCurrentMonth = isSameMonth(day, month);
            const isPast = isBefore(day, today);
            const isStart = isRangeStart(day);
            const isEnd = isRangeEnd(day);
            const inRange = isInRange(day);
            const isToday = isSameDay(day, today);

            return (
              <button
                key={i}
                type="button"
                onPointerEnter={() => { if (selecting === 'end') setHovered(day); }}
                onPointerLeave={() => setHovered(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  if (isCurrentMonth && !isPast) handleDayClick(day);
                }}
                className={cn(
                  'relative h-8 text-xs transition-colors select-none',
                  !isCurrentMonth && 'invisible',
                  isPast && 'text-muted-foreground/30 cursor-not-allowed',
                  !isPast && isCurrentMonth && 'hover:bg-primary/10 cursor-pointer',
                  isToday && !isStart && !isEnd && 'font-bold',
                  inRange && !isStart && !isEnd && 'bg-primary/10 rounded-none',
                  (isStart || isEnd) && 'bg-primary text-primary-foreground rounded-full z-10',
                  isStart && inRange && 'rounded-r-none rounded-l-full',
                  isEnd && inRange && 'rounded-l-none rounded-r-full',
                )}
              >
                {format(day, 'd')}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const popup = open
    ? createPortal(
        <div
          data-datepicker-popup
          style={dropdownStyle}
          className="bg-popover border border-border rounded-xl shadow-xl p-4"
        >
          {/* Nav */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => setLeftMonth(m => subMonths(m, 1))}
              className="p-1.5 rounded-md hover:bg-muted transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <div className="flex gap-6 flex-1 px-2">
              {renderMonth(leftMonth)}
              {renderMonth(rightMonth)}
            </div>
            <button
              type="button"
              onClick={() => setLeftMonth(m => addMonths(m, 1))}
              className="p-1.5 rounded-md hover:bg-muted transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-border pt-3 mt-1">
            <p className="text-[11px] text-muted-foreground">
              {!start
                ? 'Select the departure date'
                : !end
                ? 'Select the return date'
                : `${displayFmt(start)} → ${displayFmt(end)}`}
            </p>
            {(start || end) && (
              <button
                type="button"
                onClick={() => { onChangeStart(''); onChangeEnd(''); }}
                className="text-[11px] text-muted-foreground hover:text-destructive transition-colors"
              >
                Erase
              </button>
            )}
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <div className={cn('w-full', className)}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(o => !o)}
        className={cn(
          'relative w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-md bg-muted border text-xs outline-none transition-colors',
          open ? 'border-primary/60' : 'border-border hover:border-primary/40'
        )}
      >
        <CalendarDays className="absolute left-2.5 w-3.5 h-3.5 shrink-0 text-muted-foreground" />
        {start ? (
          <span className="font-medium">{displayFmt(start)}</span>
        ) : (
          <span className="text-muted-foreground">{placeholderStart}</span>
        )}
        <span className="text-muted-foreground">→</span>
        {end ? (
          <span className="font-medium">{displayFmt(end)}</span>
        ) : (
          <span className="text-muted-foreground">{placeholderEnd}</span>
        )}
      </button>
      {popup}
    </div>
  );
}
