import { cn } from "@/lib/utils";
import React, { useCallback, useEffect, useRef, useState } from "react";

interface WheelColumnProps {
  values: number[];
  value: number;
  onChange: (value: number) => void;
  formatLabel?: (val: number) => string;
  unitLabel: string;
  ariaLabel: string;
}

const ITEM_HEIGHT = 44; // pixels
const VISIBLE_ITEMS = 5;
const PADDING_ITEMS = Math.floor(VISIBLE_ITEMS / 2); // 2 items top, 2 items bottom

export function WheelColumn({
  values,
  value,
  onChange,
  formatLabel = (v) => String(v),
  unitLabel,
  ariaLabel,
}: WheelColumnProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isUserScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPointerDownRef = useRef(false);
  const startYRef = useRef(0);
  const startScrollTopRef = useRef(0);
  const hasMovedRef = useRef(false);

  // Find index of current value (default to 0 if not found)
  const initialIndex = Math.max(0, values.indexOf(value));
  const [displayedIndex, setDisplayedIndex] = useState(
    initialIndex !== -1 ? initialIndex : 0,
  );

  // Keep displayedIndex in sync if external value changes while not scrolling
  useEffect(() => {
    const idx = values.indexOf(value);
    if (idx !== -1 && !isUserScrollingRef.current) {
      setDisplayedIndex(idx);
      if (containerRef.current) {
        const targetScrollTop = idx * ITEM_HEIGHT;
        if (Math.abs(containerRef.current.scrollTop - targetScrollTop) > 2) {
          containerRef.current.scrollTo({
            top: targetScrollTop,
            behavior: "smooth",
          });
        }
      }
    }
  }, [value, values]);

  // Initial scroll position on mount
  useEffect(() => {
    const idx = values.indexOf(value);
    const targetIdx = idx !== -1 ? idx : 0;
    if (containerRef.current) {
      containerRef.current.scrollTop = targetIdx * ITEM_HEIGHT;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const currentScroll = containerRef.current.scrollTop;
    const rawIndex = Math.round(currentScroll / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(values.length - 1, rawIndex));

    if (clampedIndex !== displayedIndex) {
      setDisplayedIndex(clampedIndex);
      // Optional subtle haptic
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        try {
          navigator.vibrate(5);
        } catch {
          // ignore
        }
      }
    }

    isUserScrollingRef.current = true;
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(() => {
      isUserScrollingRef.current = false;
      const finalScroll = containerRef.current?.scrollTop ?? currentScroll;
      const finalRawIndex = Math.round(finalScroll / ITEM_HEIGHT);
      const finalIndex = Math.max(0, Math.min(values.length - 1, finalRawIndex));

      if (values[finalIndex] !== undefined && values[finalIndex] !== value) {
        onChange(values[finalIndex]);
      }
    }, 90);
  }, [displayedIndex, values, value, onChange]);

  // Pointer drag support (desktop mouse / touch)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    isPointerDownRef.current = true;
    hasMovedRef.current = false;
    startYRef.current = e.clientY;
    startScrollTopRef.current = containerRef.current.scrollTop;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDownRef.current || !containerRef.current) return;
    const deltaY = e.clientY - startYRef.current;
    if (Math.abs(deltaY) > 4) {
      hasMovedRef.current = true;
    }
    containerRef.current.scrollTop = startScrollTopRef.current - deltaY;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDownRef.current) return;
    isPointerDownRef.current = false;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    // Snap to nearest item smoothly
    if (containerRef.current) {
      const currentScroll = containerRef.current.scrollTop;
      const targetIndex = Math.max(
        0,
        Math.min(values.length - 1, Math.round(currentScroll / ITEM_HEIGHT)),
      );
      containerRef.current.scrollTo({
        top: targetIndex * ITEM_HEIGHT,
        behavior: "smooth",
      });
      if (values[targetIndex] !== undefined && values[targetIndex] !== value) {
        onChange(values[targetIndex]);
      }
    }
  };

  const handleItemClick = (index: number) => {
    if (hasMovedRef.current) return;
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: index * ITEM_HEIGHT,
        behavior: "smooth",
      });
      if (values[index] !== undefined && values[index] !== value) {
        onChange(values[index]);
      }
    }
  };

  return (
    <div
      className="relative flex flex-1 flex-col items-center select-none"
      role="group"
      aria-label={ariaLabel}
    >
      {/* Scrollable Reel */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={cn(
          "w-full overflow-y-scroll scroll-smooth touch-pan-y cursor-grab active:cursor-grabbing",
          "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",
        )}
        style={{
          height: ITEM_HEIGHT * VISIBLE_ITEMS,
          scrollSnapType: "y mandatory",
        }}
      >
        {/* Top spacer */}
        <div style={{ height: ITEM_HEIGHT * PADDING_ITEMS }} />

        {/* Items */}
        {values.map((val, idx) => {
          const distance = Math.abs(idx - displayedIndex);
          const isSelected = distance === 0;
          const isNear = distance === 1;

          // 3D cylinder rotation effect
          const rotateAngle = (idx - displayedIndex) * 18;
          const scale = isSelected ? 1.08 : isNear ? 0.95 : 0.82;
          const opacity = isSelected ? 1 : isNear ? 0.6 : 0.25;

          return (
            <div
              key={`${val}-${idx}`}
              onClick={() => handleItemClick(idx)}
              className={cn(
                "flex items-center justify-center gap-1.5 transition-transform duration-100 ease-out",
                "snap-center select-none",
                "pt-3"
              )}
              style={{
                height: ITEM_HEIGHT,
                transform: `perspective(240px) rotateX(${-rotateAngle}deg) scale(${scale})`,
                opacity,
              }}
            >
              <span
                className={cn(
                  "tabular-nums tracking-tight transition-colors",
                  isSelected
                    ? "text-2xl font-bold text-foreground"
                    : isNear
                      ? "text-lg font-medium text-muted-foreground"
                      : "text-sm text-muted-foreground/60",
                )}
              >
                {formatLabel(val)}
              </span>
              <span
                className={cn(
                  "text-xs font-semibold uppercase tracking-wider transition-opacity",
                  isSelected
                    ? "text-primary opacity-100"
                    : isNear
                      ? "text-muted-foreground opacity-60"
                      : "text-muted-foreground/40 opacity-0",
                )}
              >
                {unitLabel}
              </span>
            </div>
          );
        })}

        {/* Bottom spacer */}
        <div style={{ height: ITEM_HEIGHT * PADDING_ITEMS }} />
      </div>
    </div>
  );
}

interface TimeWheelPickerProps {
  minutes: number;
  seconds: number;
  onMinutesChange: (m: number) => void;
  onSecondsChange: (s: number) => void;
  minuteOptions?: number[];
  secondOptions?: number[];
}

const DEFAULT_MINUTES = [0, 1, 2, 3, 4, 5];
const DEFAULT_SECONDS = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

export function TimeWheelPicker({
  minutes,
  seconds,
  onMinutesChange,
  onSecondsChange,
  minuteOptions = DEFAULT_MINUTES,
  secondOptions = DEFAULT_SECONDS,
}: TimeWheelPickerProps) {
  return (
    <div className="relative w-full rounded-2xl border border-border/60 bg-muted/20 p-2 shadow-inner backdrop-blur-sm">
      {/* Active Row Highlight Capsule / Pill spanning across columns */}
      <div
        className="pointer-events-none absolute left-3 right-3 top-1/2 -translate-y-1/2 rounded-xl border border-primary/25 bg-primary/10 shadow-sm"
        style={{ height: ITEM_HEIGHT }}
      />

      {/* Top and bottom fade masks for the cylindrical drum look */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-16 rounded-t-2xl bg-gradient-to-b from-card via-card/80 to-transparent z-10" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 rounded-b-2xl bg-gradient-to-t from-card via-card/80 to-transparent z-10" />

      {/* Dual Wheel Columns */}
      <div className="relative flex items-center justify-center divide-x divide-border/20">
        {/* Minutes Wheel */}
        <WheelColumn
          values={minuteOptions}
          value={minutes}
          onChange={onMinutesChange}
          formatLabel={(m) => String(m)}
          unitLabel="min"
          ariaLabel="Selecionar minutos"
        />

        {/* Seconds Wheel */}
        <WheelColumn
          values={secondOptions}
          value={seconds}
          onChange={onSecondsChange}
          formatLabel={(s) => s.toString().padStart(2, "0")}
          unitLabel="seg"
          ariaLabel="Selecionar segundos"
        />
      </div>

      {/* Visual drag hints */}
      <div className="mt-1 flex items-center justify-center gap-1 text-[11px] text-muted-foreground/60">
        <span>Deslize verticalmente para ajustar</span>
      </div>
    </div>
  );
}
