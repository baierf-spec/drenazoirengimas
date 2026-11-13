import { BUSINESS, isEnabled } from '../config/business';

export function HowItWorks() {
  return (
    <section className="relative w-full py-20 px-4 sm:px-8 bg-[#0d0e12] border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        {/* Section Heading */}
        <div className="text-center mb-16">
          <h2 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-wider text-white font-['Montserrat',sans-serif]">
            Kaip tai veikia?
          </h2>
          <div className="w-16 h-1 bg-[#c2410c] mx-auto mt-3 rounded-full" />
        </div>

        {/* Steps Grid / Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 items-start relative">
          {/* Step 1 */}
          <div className="flex flex-col items-center text-center group">
            {/* Step 1 Illustration */}
            <div className="h-24 sm:h-28 flex items-center justify-center mb-4 sm:mb-6">
              <svg
                viewBox="0 0 100 100"
                className="w-20 h-20 sm:w-24 sm:h-24 stroke-neutral-200 fill-none"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {/* Document */}
                <rect x="18" y="14" width="46" height="62" rx="4" className="stroke-neutral-300" />
                <line x1="28" y1="28" x2="48" y2="28" className="stroke-neutral-400" />
                <line x1="28" y1="38" x2="44" y2="38" className="stroke-neutral-400" />
                <line x1="28" y1="48" x2="38" y2="48" className="stroke-neutral-400" />

                <circle cx="66" cy="62" r="20" className="fill-[#15171d] stroke-[#f95700]" />
                <path d="M56 62l7 7 13-15" className="stroke-[#f95700]" strokeWidth="3" />
              </svg>
            </div>

            {/* Step Number & Title */}
            <div className="flex items-center gap-2.5 mb-2 sm:mb-3">
              <div className="w-7 h-7 rounded-full bg-[#c2410c] text-white font-bold text-sm flex items-center justify-center shadow-md">
                1
              </div>
              <h3 className="font-extrabold text-base sm:text-lg uppercase tracking-wider text-white font-['Montserrat',sans-serif]">
                Pateikite užklausą
              </h3>
            </div>

            {/* Description */}
            <p className="text-neutral-300 text-xs sm:text-sm max-w-xs leading-relaxed px-2">
              Pasirinkite kiekį ir palikite kontaktus. Prieš siunčiant suderinsime kainą ir gavėjo duomenis.
            </p>

            {/* Mobile Vertical Arrow */}
            <div className="flex md:hidden items-center justify-center my-3 text-[#f95700]/50">
              <svg viewBox="0 0 12 20" className="w-3 h-5" fill="none">
                <path d="M6 2V18M6 18L2 13M6 18L10 13" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          {/* Dotted Arrow between 1 and 2 (Desktop only) */}
          <div className="hidden md:flex absolute top-14 left-[29%] w-[8%] justify-center items-center pointer-events-none">
            <svg viewBox="0 0 60 12" className="w-full text-orange-500/60" fill="none">
              <path
                d="M2 6H50M50 6L44 2M50 6L44 10"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="4 4"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center text-center group">
            {/* Step 2 Illustration - Parcel Locker */}
            <div className="h-24 sm:h-28 flex items-center justify-center mb-4 sm:mb-6">
              <svg
                viewBox="0 0 100 100"
                className="w-20 h-20 sm:w-24 sm:h-24 stroke-neutral-200 fill-none"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {/* Locker Outer Frame */}
                <rect x="18" y="16" width="64" height="68" rx="3" className="stroke-neutral-300" />
                {/* Top header row */}
                <line x1="18" y1="28" x2="82" y2="28" className="stroke-neutral-400" />
                {/* Vertical Divider */}
                <line x1="50" y1="28" x2="50" y2="84" className="stroke-neutral-400" />
                {/* Locker Compartments */}
                <line x1="18" y1="46" x2="50" y2="46" className="stroke-neutral-400" />
                <line x1="50" y1="46" x2="82" y2="46" className="stroke-neutral-400" />
                <line x1="18" y1="64" x2="50" y2="64" className="stroke-neutral-400" />
                <line x1="50" y1="64" x2="82" y2="64" className="stroke-neutral-400" />
                {/* Small locker handles */}
                <line x1="44" y1="36" x2="46" y2="36" strokeWidth="3" className="stroke-neutral-400" />
                <line x1="76" y1="36" x2="78" y2="36" strokeWidth="3" className="stroke-neutral-400" />
                <line x1="44" y1="74" x2="46" y2="74" strokeWidth="3" className="stroke-neutral-400" />
                <line x1="76" y1="74" x2="78" y2="74" strokeWidth="3" className="stroke-neutral-400" />

                {/* Highlighted open/filled locker compartment with parcel */}
                <rect
                  x="40"
                  y="48"
                  width="20"
                  height="14"
                  rx="1"
                  className="fill-[#f95700]/20 stroke-[#f95700]"
                  strokeWidth="2"
                />
                <path d="M47 53h6v4h-6z" className="fill-[#f95700] stroke-none" />
              </svg>
            </div>

            {/* Step Number & Title */}
            <div className="flex items-center gap-2.5 mb-2 sm:mb-3">
              <div className="w-7 h-7 rounded-full bg-[#c2410c] text-white font-bold text-sm flex items-center justify-center shadow-md">
                2
              </div>
              <h3 className="font-extrabold text-base sm:text-lg uppercase tracking-wider text-white font-['Montserrat',sans-serif]">
                Išsiųskite
              </h3>
            </div>

            {/* Description */}
            <p className="text-neutral-300 text-xs sm:text-sm max-w-xs leading-relaxed px-2">
              {isEnabled('shipping') ? `Gavę mūsų patvirtinimą, saugiai supakuokite grandines ir išsiųskite paštomatu. Siuntimą mums apmokate patys.` : 'Perduokite grandines suderintu laiku.'}
            </p>

            {/* Mobile Vertical Arrow */}
            <div className="flex md:hidden items-center justify-center my-3 text-[#f95700]/50">
              <svg viewBox="0 0 12 20" className="w-3 h-5" fill="none">
                <path d="M6 2V18M6 18L2 13M6 18L10 13" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          {/* Dotted Arrow between 2 and 3 (Desktop only) */}
          <div className="hidden md:flex absolute top-14 left-[63%] w-[8%] justify-center items-center pointer-events-none">
            <svg viewBox="0 0 60 12" className="w-full text-orange-500/60" fill="none">
              <path
                d="M2 6H50M50 6L44 2M50 6L44 10"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="4 4"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center text-center group">
            {/* Step 3 Illustration - Chainsaw Chain & Sparkles */}
            <div className="h-24 sm:h-28 flex items-center justify-center mb-4 sm:mb-6">
              <svg
                viewBox="0 0 100 100"
                className="w-24 h-20 sm:w-28 sm:h-24 stroke-neutral-200 fill-none"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {/* Chainsaw chain curved segment */}
                <path
                  d="M15 58 Q 35 48 55 52 T 85 58"
                  className="stroke-neutral-300"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
                {/* Chain links and teeth */}
                <circle cx="22" cy="55" r="4" className="fill-[#0d0e12] stroke-white" strokeWidth="2.5" />
                <path d="M22 51 L 28 42 L 35 44 L 32 54" className="stroke-white fill-[#1a1c22]" strokeWidth="2" />

                <circle cx="42" cy="52" r="4" className="fill-[#0d0e12] stroke-white" strokeWidth="2.5" />
                <path d="M42 48 L 48 39 L 55 41 L 52 51" className="stroke-white fill-[#1a1c22]" strokeWidth="2" />

                <circle cx="62" cy="53" r="4" className="fill-[#0d0e12] stroke-white" strokeWidth="2.5" />
                <path d="M62 49 L 68 40 L 75 42 L 72 52" className="stroke-white fill-[#1a1c22]" strokeWidth="2" />

                <circle cx="80" cy="57" r="4" className="fill-[#0d0e12] stroke-white" strokeWidth="2.5" />

                {/* Sparkling 4-point stars in orange */}
                <path
                  d="M74 24 L76 30 L82 32 L76 34 L74 40 L72 34 L66 32 L72 30 Z"
                  className="fill-[#f95700] stroke-none"
                />
                <path
                  d="M30 32 L31.5 36 L35.5 37.5 L31.5 39 L30 43 L28.5 39 L24.5 37.5 L28.5 36 Z"
                  className="fill-[#f95700] stroke-none"
                />
                <path
                  d="M58 20 L59 23 L62 24 L59 25 L58 28 L57 25 L54 24 L57 23 Z"
                  className="fill-[#f95700] stroke-none"
                />
              </svg>
            </div>

            {/* Step Number & Title */}
            <div className="flex items-center gap-2.5 mb-2 sm:mb-3">
              <div className="w-7 h-7 rounded-full bg-[#c2410c] text-white font-bold text-sm flex items-center justify-center shadow-md">
                3
              </div>
              <h3 className="font-extrabold text-base sm:text-lg uppercase tracking-wider text-white font-['Montserrat',sans-serif]">
                Atsiimkite
              </h3>
            </div>

            {/* Description */}
            <p className="text-neutral-300 text-xs sm:text-sm max-w-xs leading-relaxed px-2">
              {isEnabled('freeShipping') ? `Pagaląstas grandines grąžinsime į suderintą paštomatą. Nuo ${BUSINESS.shipping.freeShippingMinimumQuantity} vnt. grąžinimas nemokamas.` : 'Pagaląstas grandines perduosime sutartu būdu.'}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}


