export function Logo({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 select-none ${className}`}>
      {/* Gear / Chain Sharpening Icon */}
      <div className="relative w-9 h-9 sm:w-11 sm:h-11 flex-shrink-0 flex items-center justify-center">
        <svg
          viewBox="0 0 48 48"
          fill="none"
          className="w-full h-full text-orange-500 drop-shadow-[0_2px_8px_rgba(249,87,0,0.4)]"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer Cog teeth */}
          <path
            d="M24 4L27 9H33L35 14L40 16L39 22L44 26L41 31L43 37L37 39L35 44L29 43L24 47L19 43L13 44L11 39L5 37L7 31L4 26L9 22L8 16L13 14L15 9H21L24 4Z"
            fill="currentColor"
          />
          {/* Inner dark circle cutout */}
          <circle cx="24" cy="25" r="13" fill="#0d0e12" />
          {/* Chainsaw cutter tooth silhouette */}
          <path
            d="M17 29L21 21L28 20L31 23L27 28L29 31H20L17 29Z"
            fill="#f97316"
          />
          {/* Sparkle spark */}
          <circle cx="31" cy="18" r="2" fill="#fff" />
        </svg>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col leading-tight">
        <div className="font-extrabold text-white text-[13px] sm:text-[17px] tracking-wider uppercase font-['Montserrat',sans-serif]">
          Grandinių
        </div>
        <div className="font-extrabold text-white text-[13px] sm:text-[17px] tracking-wider uppercase -mt-0.5 sm:-mt-1 font-['Montserrat',sans-serif]">
          Galandimas
        </div>
        <div className="text-[8px] sm:text-[10px] tracking-widest text-orange-400 uppercase font-semibold">
          Aštrumas, kurį pajusi
        </div>
      </div>
    </div>
  );
}
