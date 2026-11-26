import { useRef, useEffect, useState, useMemo, useId, type FC, type PointerEvent } from 'react';
import { useReducedMotion } from 'motion/react';

interface CurvedLoopProps {
  marqueeText?: string;
  speed?: number;
  className?: string;
  curveAmount?: number;
  direction?: 'left' | 'right';
  interactive?: boolean;
}

const CurvedLoop: FC<CurvedLoopProps> = ({
  marqueeText = '',
  speed = 2,
  className,
  curveAmount = 400,
  direction = 'left',
  interactive = true
}) => {
  const text = useMemo(() => {
    const hasTrailing = /\s|\u00A0$/.test(marqueeText);
    return (hasTrailing ? marqueeText.replace(/\s+$/, '') : marqueeText) + '';
  }, [marqueeText]);

  const measureRef = useRef<SVGTextElement | null>(null);
  const textPathRef = useRef<SVGTextPathElement | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);
  const [spacing, setSpacing] = useState(0);
  const [offset, setOffset] = useState(0);
  const uid = useId();
  const pathId = `curve-${uid}`;
  const pathD = `M-100,40 Q500,${40 + curveAmount} 1540,40`;

  const dragRef = useRef(false);
  const lastXRef = useRef(0);
  const dirRef = useRef<'left' | 'right'>(direction);
  const velRef = useRef(0);
  const reduce = useReducedMotion();
  // Pausa: hover/foco la detienen temporalmente; el botón la detiene hasta reanudar.
  const hoverRef = useRef(false);
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);
  pausedRef.current = paused;
  const label = useMemo(() => marqueeText.replace(/✦/g, ' ').replace(/\s+/g, ' ').trim(), [marqueeText]);

  const textLength = spacing;
  const totalText = textLength
    ? Array(Math.ceil(1800 / textLength) + 2)
        .fill(text)
        .join('')
    : text;
  const ready = spacing > 0;

  useEffect(() => {
    if (measureRef.current) setSpacing(measureRef.current.getComputedTextLength());
  }, [text, className]);

  useEffect(() => {
    if (!spacing) return;
    if (textPathRef.current) {
      const initial = -spacing;
      textPathRef.current.setAttribute('startOffset', initial + 'px');
      setOffset(initial);
    }
  }, [spacing]);

  useEffect(() => {
    // Reduced motion: render the marquee static (no rAF loop).
    if (!spacing || !ready || reduce) return;
    let frame = 0;
    const step = () => {
      if (!dragRef.current && !hoverRef.current && !pausedRef.current && textPathRef.current) {
        const delta = dirRef.current === 'right' ? speed : -speed;
        const currentOffset = parseFloat(textPathRef.current.getAttribute('startOffset') || '0');
        let newOffset = currentOffset + delta;
        const wrapPoint = spacing;
        if (newOffset <= -wrapPoint) newOffset += wrapPoint;
        if (newOffset > 0) newOffset -= wrapPoint;
        textPathRef.current.setAttribute('startOffset', newOffset + 'px');
        setOffset(newOffset);
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
    setOffset(newOffset);
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
      onPointerEnter={() => { hoverRef.current = true; }}
      onPointerLeave={() => { hoverRef.current = false; endDrag(); }}
      onFocus={() => { hoverRef.current = true; }}
      onBlur={() => { hoverRef.current = false; }}
    >
      <svg
        role="img"
        aria-label={label}
        className="select-none w-full overflow-visible block aspect-[100/25] text-[6rem] font-bold uppercase leading-none"
        viewBox="0 -90 1440 360"
      >
        <text ref={measureRef} xmlSpace="preserve" style={{ visibility: 'hidden', opacity: 0, pointerEvents: 'none' }}>
          {text}
        </text>
        <defs>
          <path ref={pathRef} id={pathId} d={pathD} fill="none" stroke="transparent" />
        </defs>
        {ready && (
          <>
            {/* Cinta blanca que sigue la misma curva del texto */}
            <use
              href={`#${pathId}`}
              stroke="var(--color-ribbon)"
              strokeWidth={230}
              strokeLinecap="round"
              fill="none"
              style={{ filter: 'drop-shadow(0 8px 16px var(--color-ribbon-shadow))' }}
            />
            <text xmlSpace="preserve" aria-hidden="true" style={{ fill: 'var(--color-marquee-ink)' }}>
              <textPath ref={textPathRef} href={`#${pathId}`} startOffset={offset + 'px'} xmlSpace="preserve">
                {totalText}
              </textPath>
            </text>
          </>
        )}
      </svg>
      {!reduce && ready && (
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          onPointerDown={(e) => e.stopPropagation()}
          aria-pressed={paused}
          className="absolute bottom-0 right-4 z-10 rounded-full bg-card-default px-3 py-1 text-sm text-neutral-700 shadow-md transition-colors duration-base hover:bg-neutral-100 active:bg-neutral-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2"
        >
          {paused ? 'Reanudar' : 'Pausar'}
        </button>
      )}
    </div>
  );
};

export default CurvedLoop;
