"use client";

import React, { useState } from "react";
import { addMonths, eachDayOfInterval, endOfMonth, format, getDay, startOfMonth } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DateRange, fromISO, rangesOverlap, toISO, todayISO } from "@/lib/dates";

interface Props {
  start: string;
  end: string;
  onChange: (start: string, end: string) => void;
  /** nights that are already taken (shown crossed out, not selectable) */
  blocked?: DateRange[];
  months?: 1 | 2;
}

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

export default function DateRangePicker({ start, end, onChange, blocked = [], months = 2 }: Props) {
  const today = todayISO();
  const [cursor, setCursor] = useState(() => startOfMonth(start ? fromISO(start) : new Date()));

  const isTaken = (iso: string) => blocked.some((b) => iso >= b.start_date && iso < b.end_date);

  const pick = (iso: string) => {
    const choosingEnd = start && !end && iso > start;
    if (choosingEnd && !blocked.some((b) => rangesOverlap(start, iso, b))) {
      onChange(start, iso);
    } else {
      onChange(iso, ""); // (re)start the selection
    }
  };

  const disabled = (iso: string) => {
    if (iso < today) return true;
    const choosingEnd = start && !end && iso > start;
    if (choosingEnd) return blocked.some((b) => rangesOverlap(start, iso, b));
    return isTaken(iso);
  };

  const month = (offset: number) => {
    const first = addMonths(cursor, offset);
    const days = eachDayOfInterval({ start: first, end: endOfMonth(first) });
    return (
      <div key={offset} className="min-w-[250px] flex-1">
        <p className="mb-2 text-center text-sm font-bold text-gray-900">{format(first, "MMMM yyyy")}</p>
        <div className="grid grid-cols-7 gap-y-1 text-center text-xs">
          {WEEKDAYS.map((w, i) => (
            <span key={i} className="pb-1 font-semibold text-gray-400">{w}</span>
          ))}
          {Array.from({ length: getDay(first) }).map((_, i) => <span key={`pad${i}`} />)}
          {days.map((d) => {
            const iso = toISO(d);
            const off = disabled(iso);
            const isStart = iso === start;
            const isEnd = iso === end;
            const inRange = start && end && iso > start && iso < end;
            return (
              <button
                key={iso}
                type="button"
                disabled={off}
                aria-label={format(d, "EEEE, MMMM d, yyyy") + (isTaken(iso) ? " (booked)" : "")}
                aria-pressed={isStart || isEnd}
                onClick={() => pick(iso)}
                className={[
                  "mx-auto h-9 w-9 rounded-full text-xs font-semibold transition",
                  isStart || isEnd ? "bg-black text-white" : "",
                  inRange ? "bg-gray-100 rounded-none w-full" : "",
                  off ? "cursor-not-allowed text-gray-300" : "hover:ring-1 hover:ring-black cursor-pointer",
                  isTaken(iso) && iso >= today ? "line-through" : "",
                ].join(" ")}
              >
                {d.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          aria-label="Previous month"
          disabled={startOfMonth(new Date()) >= cursor}
          onClick={() => setCursor(addMonths(cursor, -1))}
          className="rounded-full p-1.5 hover:bg-gray-100 disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Next month"
          onClick={() => setCursor(addMonths(cursor, 1))}
          className="rounded-full p-1.5 hover:bg-gray-100"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div className="flex flex-wrap gap-8">
        {Array.from({ length: months }).map((_, i) => month(i))}
      </div>
    </div>
  );
}
