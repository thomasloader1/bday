import { useRef, useEffect, useState, useMemo, useId, type FC, type PointerEvent } from 'react';
import { useReducedMotion } from 'motion/react';

interface CurvedLoopProps {
  marqueeText?: string;
  speed?: number;
  className?: string;
  curveAmount?: number;
  direction?: 'left' | 'right';
  interactive?: boolean;
  /** Several waves instead of one curve: `count` full waves of `amplitude` (viewBox units). */
  wave?: { count: number; amplitude: number };
  /** Ribbon thickness in viewBox units (the viewBox is 1440 wide). */
  strokeWidth?: number;
  /** viewBox height for the wavy variant; sets the ribbon's aspect ratio. */
  viewHeight?: number;
  /** CSS colours (tokens) for the ribbon and its text. */
  ribbonColor?: string;
  inkColor?: string;
}

/** Screen pixels per second at speed 1 (what speed 1 gave on a 1440px desktop at 60 Hz). */
const BASE_PX_PER_SECOND = 60;

const CurvedLoop: FC<CurvedLoopProps> = ({
  marqueeText = '',
  speed = 2,
  className,
  curveAmount = 400,
  direction = 'left',
  interactive = true,
  wave,
  strokeWidth = 230,
  viewHeight = 260,
  ribbonColor = 'var(--color-ribbon)',
  inkColor = 'var(--color-marquee-ink)',
}) => {
  const text = useMemo(() => {
    const hasTrailing = /\s|\u00A0$/.test(marqueeText);
    return (hasTrailing ? marqueeText.replace(/\s+$/, '') : marqueeText) + '';
  }, [marqueeText]);

  const measureRef = useRef<SVGTextElement | null>(null);
  const textPathRef = useRef<SVGTextPathElement | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);
  const [spacing, setSpacing] = useState(0);
  const uid = useId();
  const pathId = `curve-${uid}`;
  // One wide curve by default; with `wave`, a sine-like run of quadratic segments centred on y=0.
  const pathD = wave
    ? (() => {
        const halfWave = 1640 / (wave.count * 2);
        let d = `M-100,0 Q${-100 + halfWave / 2},${wave.amplitude * 2} ${-100 + halfWave},0`;
        for (let x = -100 + 2 * halfWave; x <= 1540 + halfWave; x += halfWave) d += ` T${x},0`;
        return d;
      })()
    : `M-100,40 Q500,${40 + curveAmount} 1540,40`;

  const dragRef = useRef(false);
  const lastXRef = useRef(0);
  const dirRef = useRef<'left' | 'right'>(direction);
  const velRef = useRef(0);
  const reduce = useReducedMotion();
  // Pausa: hover y foco la detienen mientras duran; reduced motion la deja quieta.
  const hoverRef = useRef(false);
  const label = useMemo(() => marqueeText.replace(/✦/g, ' ').replace(/\s+/g, ' ').trim(), [marqueeText]);

  const textLength = spacing;
  const totalText = textLength
    ? Array(Math.ceil(1800 / textLength) + 2)
        .fill(text)
        .join('')
    : text;
  const ready = spacing > 0;

  useEffect(() => {
    const measure = () => {
      if (measureRef.current) setSpacing(measureRef.current.getComputedTextLength());
    };
    measure();
    // The display face loads async: measure again once it has, or the loop wraps at the fallback's width.
    let cancelled = false;
    document.fonts?.ready.then(() => {
      if (!cancelled) measure();
    });
    return () => {
      cancelled = true;
    };
  }, [text, className]);

  useEffect(() => {
    if (!spacing) return;
    if (textPathRef.current) {
      const initial = -spacing;
      textPathRef.current.setAttribute('startOffset', initial + 'px');
    }
  }, [spacing]);

  useEffect(() => {
    // Reduced motion: render the marquee static (no rAF loop).
    if (!spacing || !ready || reduce) return;
    let frame = 0;
    let last = performance.now();
    const step = (now: number) => {
      // Time-based (same pace at 60 and 120 Hz) and in screen pixels: the path is drawn in a 1440-wide
      // viewBox, so on a 390px phone one unit is ~0.27px and a per-unit speed would barely crawl.
      const dt = Math.min(now - last, 100);
      last = now;
      const svg = textPathRef.current?.ownerSVGElement;
      if (!dragRef.current && !hoverRef.current && textPathRef.current && svg) {
        const unitsPerPx = 1440 / Math.max(svg.getBoundingClientRect().width, 1);
        const pxPerMs = (speed * BASE_PX_PER_SECOND) / 1000;
        const delta = (dirRef.current === 'right' ? 1 : -1) * pxPerMs * dt * unitsPerPx;
        const currentOffset = parseFloat(textPathRef.current.getAttribute('startOffset') || '0');
        let newOffset = currentOffset + delta;
        const wrapPoint = spacing;
        if (newOffset <= -wrapPoint) newOffset += wrapPoint;
        if (newOffset > 0) newOffset -= wrapPoint;
        // Written straight to the DOM: a React state update per frame re-rendered the whole ribbon 60 times a second.
        textPathRef.current.setAttribute('startOffset', newOffset + 'px');
      }
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [spacing, speed, ready, reduce]);

  const onPointerDown = (e: PointerEvent) => {
    if (!interactive) return;
    dragRef.current = true;
    lastXRef.current = e.clientX;
    velRef.current = 0;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: PointerEvent) => {
    if (!interactive || !dragRef.current || !textPathRef.current) return;
    const dx = e.clientX - lastXRef.current;
    lastXRef.current = e.clientX;
    velRef.current = dx;
    const currentOffset = parseFloat(textPathRef.current.getAttribute('startOffset') || '0');
    let newOffset = currentOffset + dx;
    const wrapPoint = spacing;
    if (newOffset <= -wrapPoint) newOffset += wrapPoint;
    if (newOffset > 0) newOffset -= wrapPoint;
    textPathRef.current.setAttribute('startOffset', newOffset + 'px');
  };

  const endDrag = () => {
    if (!interactive) return;
    dragRef.current = false;
    dirRef.current = velRef.current > 0 ? 'right' : 'left';
  };

  const cursorStyle = interactive ? (dragRef.current ? 'grabbing' : 'grab') : 'auto';

  return (
    <div
      className={`flex items-center justify-center w-full ${className ?? ''}`}
      style={{ visibility: ready ? 'visible' : 'hidden', cursor: cursorStyle }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      // Only a mouse pauses it: on a phone a touch "enters" and would leave it stopped.
      onPointerEnter={(e) => { if (e.pointerType === 'mouse') hoverRef.current = true; }}
      onPointerLeave={() => { hoverRef.current = false; endDrag(); }}
      onFocus={() => { hoverRef.current = true; }}
      onBlur={() => { hoverRef.current = false; }}
    >
      <svg
        role="img"
        aria-label={label}
        className={`select-none w-full overflow-visible block font-display text-[6rem] uppercase leading-none ${wave ? '' : 'aspect-[100/25]'}`}
        style={wave ? { aspectRatio: `1440 / ${viewHeight}` } : undefined}
        viewBox={wave ? `0 ${-viewHeight / 2} 1440 ${viewHeight}` : '0 -90 1440 360'}
      >
        <text ref={measureRef} xmlSpace="preserve" style={{ visibility: 'hidden', opacity: 0, pointerEvents: 'none' }}>
          {text}
        </text>
        <defs>
          {/* No stroke here: the <use> below paints the ribbon, and a stroke on the source would override it. */}
          <path ref={pathRef} id={pathId} d={pathD} fill="none" />
        </defs>
        {ready && (
          <>
            {/* Cinta en la tinta de acento que sigue la misma curva del texto (var() solo resuelve en style) */}
            <use
              href={`#${pathId}`}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              fill="none"
              style={{ stroke: ribbonColor }}
            />
            <text xmlSpace="preserve" aria-hidden="true" dominantBaseline={wave ? 'central' : undefined} style={{ fill: inkColor }}>
              <textPath ref={textPathRef} href={`#${pathId}`} xmlSpace="preserve">
                {totalText}
              </textPath>
            </text>
          </>
        )}
      </svg>
    </div>
  );
};

export default CurvedLoop;
