"use client";
import { FC, ReactNode, useRef, useState, KeyboardEvent } from 'react';
import { motion, useMotionValue, useTransform, animate, useReducedMotion, type PanInfo } from 'motion/react';
import { cn } from '@/lib/cn';

interface InvitationDeckProps {
  slides: ReactNode[];
  total: number;
  guestName: string;
}

const SWIPE_THRESHOLD = 100; // px
const VELOCITY_THRESHOLD = 500; // px/s
const DRAG_THRESHOLD_PX = 8; // px before a gesture counts as a drag, not a tap
const EXIT_X = 600; // px off-screen target
const MAX_BEHIND_CARDS = 2;

const InvitationDeck: FC<InvitationDeckProps> = ({ slides, total, guestName }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const x = useMotionValue(0);
  const tilt = useTransform(x, [-300, 300], [-8, 8]);
  const reduce = useReducedMotion();
  // Reduced motion: plain slide — no rotation.
  const rotate = reduce ? 0 : tilt;
  const didDragRef = useRef(false);
  const startXRef = useRef(0);

  const goTo = (index: number) => {
    // Circular: wrapping past the ends back to the first/last slide.
    const next = ((index % total) + total) % total;
    if (next === activeIndex) return;
    x.set(0);
    setActiveIndex(next);
  };

  const animateAway = (target: number, onDone: () => void) => {
    if (reduce) {
      animate(x, target, { duration: 0.2, ease: 'linear' }).then(onDone);
    } else {
      animate(x, target, { type: 'spring', stiffness: 300, damping: 30 }).then(onDone);
    }
  };

  const springBack = () => {
    if (reduce) {
      animate(x, 0, { duration: 0.15, ease: 'linear' });
    } else {
      animate(x, 0, { type: 'spring', stiffness: 400, damping: 40 });
    }
  };

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const { offset, velocity } = info;
    const flingLeft = offset.x < -SWIPE_THRESHOLD || velocity.x < -VELOCITY_THRESHOLD;
    const flingRight = offset.x > SWIPE_THRESHOLD || velocity.x > VELOCITY_THRESHOLD;

    if (flingLeft) {
      animateAway(-EXIT_X, () => goTo(activeIndex + 1));
    } else if (flingRight) {
      animateAway(EXIT_X, () => goTo(activeIndex - 1));
    } else {
      springBack();
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      goTo(activeIndex + 1);
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goTo(activeIndex - 1);
    }
  };

  return (
    <div
      className="deck relative pb-2"
      role="region"
      aria-label={`Invitaciones de ${guestName}`}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onClickCapture={(e) => {
        // A gesture that moved beyond the drag threshold is not a tap: never
        // let it fire card CTAs (calendar/maps).
        if (didDragRef.current) {
          e.preventDefault();
          e.stopPropagation();
          didDragRef.current = false;
        }
      }}
    >
      {/* Behind stack: up to 2 next cards (circular), fixed offsets (design: -8*i px, scale 1-0.04*i). */}
      {Array.from({ length: MAX_BEHIND_CARDS }, (_, i) => i + 1).map((i) => {
        const slideIndex = (activeIndex + i) % total;
        return (
          <div
            key={`behind-${slideIndex}`}
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 z-10 rounded-xl shadow-md"
            style={{ transform: `translateY(${-8 * i}px) scale(${1 - 0.04 * i})` }}
          >
            {slides[slideIndex]}
          </div>
        );
      })}

      {/* Active card: axis-locked drag, rotation from drag offset. */}
      <motion.div
        className="deck-card relative z-20 rounded-xl shadow-lg"
        drag="x"
        dragMomentum={false}
        style={{ x, rotate }}
        onPointerDown={(e) => {
          didDragRef.current = false;
          startXRef.current = e.clientX;
        }}
        onPointerMove={(e) => {
          if (!didDragRef.current && Math.abs(e.clientX - startXRef.current) > DRAG_THRESHOLD_PX) {
            didDragRef.current = true;
          }
        }}
        onDragEnd={handleDragEnd}
      >
        {slides[activeIndex]}
      </motion.div>

      {/* Pill dots indicator. */}
      <div
        className="deck-dots mt-4 flex justify-center gap-2"
        role="group"
        aria-label="Paginación de invitaciones"
      >
        {slides.map((_, i) => (
          <span
            key={i}
            aria-current={i === activeIndex ? 'step' : undefined}
            className={cn(
              'deck-dot h-2 rounded-full transition-colors duration-base ease-party',
              i === activeIndex ? 'w-6 bg-primary-700' : 'w-2 bg-neutral-300'
            )}
          />
        ))}
      </div>
    </div>
  );
};

export default InvitationDeck;
