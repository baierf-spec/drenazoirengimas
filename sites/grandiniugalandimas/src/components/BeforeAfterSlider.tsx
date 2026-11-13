import { useState, useRef, useCallback, type MouseEvent, type TouchEvent } from 'react';
import sharpSmall from '../assets/chain_macro_sharp_1788582601661-small.webp?url';
import dullSmall from '../assets/chain_macro_dull_1788582617864-small.webp?url';
import sharpImg from '../assets/chain_macro_sharp_1788582601661.webp?url';
import dullImg from '../assets/chain_macro_dull_1788582617864.webp?url';

export function BeforeAfterSlider() {
  const [sliderPosition, setSliderPosition] = useState(50); // percentage (0 to 100)
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, []);

  const handleTouchStart = (e: TouchEvent) => {
    setIsDragging(true);
    handleMove(e.touches[0].clientX);
  };

  const handleTouchMove = (e: TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  const handleTouchEnd = () => setIsDragging(false);

  const handleMouseDown = (e: MouseEvent) => {
    setIsDragging(true);
    handleMove(e.clientX);
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      handleMove(e.clientX);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div
        ref={containerRef}
        role="slider"
        tabIndex={0}
        aria-label="Iliustracinis grandinės ašmenų palyginimas"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(sliderPosition)}
        onKeyDown={(e) => {
          if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
            e.preventDefault();
            setSliderPosition(p => e.key === 'Home' ? 0 : e.key === 'End' ? 100 : Math.max(0, Math.min(100, p + (e.key === 'ArrowRight' ? 5 : -5))));
          }
        }}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={(e) => handleMove(e.clientX)}
        className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border border-white/10 select-none cursor-ew-resize group touch-pan-y"
      >
        {/* "PO" (After) Image - Background (sharp) */}
        <img
          src={sharpImg}
          srcSet={`${sharpSmall} 640w, ${sharpImg} 1200w`}
          sizes="(min-width: 1024px) 50vw, 100vw"
          alt="Pagaląsta grandinė - PO"
          className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
          width={1200}
          height={896}
          loading="lazy"
          decoding="async"
        />

        {/* "PRIEŠ" (Before) Image - Clipped using CSS clip-path (zero distortion) */}
        <div
          className="absolute inset-0 overflow-hidden select-none pointer-events-none"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        >
          <img
            src={dullImg}
            srcSet={`${dullSmall} 640w, ${dullImg} 1200w`}
            sizes="(min-width: 1024px) 50vw, 100vw"
            alt="Atšipusi grandinė - PRIEŠ"
            className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
            width={1200}
            height={896}
            loading="lazy"
            decoding="async"
          />
        </div>

        {/* Divider line */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_10px_rgba(0,0,0,0.6)] z-20 pointer-events-none"
          style={{ left: `${sliderPosition}%` }}
        >
          {/* Handle circle with < > arrows */}
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white text-neutral-800 shadow-xl flex items-center justify-center border border-neutral-300 pointer-events-none">
            <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
              <path d="M8.5 7L3.5 12L8.5 17L9.9 15.6L6.3 12L9.9 8.4L8.5 7ZM15.5 7L14.1 8.4L17.7 12L14.1 15.6L15.5 17L20.5 12L15.5 7Z" />
            </svg>
          </div>
        </div>

        {/* "PRIEŠ" Label Bar (Bottom-Left) */}
        <div className="absolute bottom-0 left-0 w-1/2 py-2 sm:py-2.5 text-center bg-neutral-900/90 backdrop-blur-sm z-10 border-t border-white/10">
          <span className="font-extrabold text-white text-sm sm:text-base tracking-widest uppercase font-['Montserrat',sans-serif]">
            Prieš
          </span>
        </div>

        {/* "PO" Label Bar (Bottom-Right) */}
        <div className="absolute bottom-0 right-0 w-1/2 py-2 sm:py-2.5 text-center bg-[#c2410c] z-10 border-t border-orange-400">
          <span className="font-extrabold text-white text-sm sm:text-base tracking-widest uppercase font-['Montserrat',sans-serif]">
            Po
          </span>
        </div>
      </div>

      <p className="mt-3 text-xs text-neutral-400">Iliustracinis ašmenų palyginimas, ne konkretaus užsakymo rezultato nuotraukos.</p>
      {/* Mobile-friendly interactive indicator */}
      <div className="mt-2 text-[11px] text-neutral-400 flex items-center gap-1.5 sm:hidden">
        <span>↔</span>
        <span>Braukite slankiklį, kad palygintumėte aštrumą</span>
      </div>
    </div>
  );
}

