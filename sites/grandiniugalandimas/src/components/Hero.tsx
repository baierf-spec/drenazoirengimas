import type { MouseEvent } from 'react';
import { ChevronRight, ShieldCheck, Star } from 'lucide-react';
import { BUSINESS, isEnabled, priceFromLabel, turnaroundLabel } from '../config/business';
import { Link } from './Link';
import { CITIES_DATA } from '../data/citiesData';
import heroSmall from '../assets/chainsaw_sharpening_hero_1788582583819-small.webp?url';
import heroImg from '../assets/chainsaw_sharpening_hero_1788582583819.webp?url';

interface HeroProps {
  onSelectCity?: (slug: string) => void;
}

export function Hero({ onSelectCity }: HeroProps) {
  const scrollToOrder = (e: MouseEvent) => {
    e.preventDefault();
    const orderSection = document.getElementById('uzsakyti');
    if (orderSection) {
      orderSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const t = turnaroundLabel();
  const price = priceFromLabel();
  const sp = BUSINESS.socialProof;
  const cities = Object.values(CITIES_DATA).map((c) => ({ slug: c.slug, name: c.name }));

  return (
    <section className="relative w-full min-h-[580px] sm:min-h-[640px] md:min-h-[720px] lg:min-h-[780px] flex items-center pt-24 sm:pt-28 pb-14 sm:pb-16 px-4 sm:px-8 overflow-hidden bg-black">
      <div className="absolute inset-0 z-0">
        <img
          src={heroImg}
          srcSet={`${heroSmall} 768w, ${heroImg} 1376w`}
          sizes="100vw"
          alt="Profesionalus pjūklų grandinių galandimas"
          className="w-full h-full object-cover object-[75%_center] md:object-right select-none"
          width={1376}
          height={768}
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
        <div className="absolute inset-0 bg-black/70 sm:bg-black/40 md:bg-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/95 sm:via-black/85 md:via-black/70 to-black/30 md:to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-28 sm:h-32 bg-gradient-to-t from-[#0d0e12] to-transparent" />
        <div className="absolute top-0 left-0 right-0 h-24 sm:h-28 bg-gradient-to-b from-black/85 to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto w-full">
        <div className="max-w-2xl text-left">
          <h1 className="font-extrabold uppercase tracking-tight text-[26px] xs:text-3xl sm:text-5xl lg:text-6xl leading-[1.15] sm:leading-[1.1] font-['Montserrat',sans-serif] drop-shadow-md">
            <span className="block text-white">Profesionalus pjūklų </span>
            <span className="block text-[#f95700] my-0.5">grandinių galandimas</span>
            
          </h1>

          <div className="mt-4 sm:mt-6 space-y-1.5 text-sm sm:text-lg text-neutral-200 leading-relaxed max-w-xl">
            <p>
              {isEnabled('shipping') ? `Atsiųskite grandines paštomatu` : 'Perduokite grandinę galąsti'}
              {t ? (
                <>
                  {' '}– <span className="text-[#f95700] font-semibold">per {t}</span> nuo gavimo pagaląsime ir grąžinsime.
                </>
              ) : (
                ' ir atsiimkite darbui paruoštą grandinę.'
              )}
            </p>
            {isEnabled('nationwide') && (
              <p className="text-neutral-300 font-medium">
                Sodybai, malkų ruošai ar kasdieniam darbui – priimame grandines iš visos Lietuvos. Prieš siųsdami pateikite užklausą ir sulaukite gavėjo duomenų.
              </p>
            )}
          </div>

          <div className="mt-7 sm:mt-10">
            <a
              href="#uzsakyti"
              onClick={scrollToOrder}
              id="hero-cta-button"
              className="inline-flex items-center justify-center gap-3 sm:gap-4 bg-[#c2410c] hover:bg-[#9a3412] text-white font-bold text-sm sm:text-lg px-6 sm:px-8 py-3.5 sm:py-4.5 rounded-xl shadow-[0_10px_25px_rgba(249,87,0,0.4)] hover:shadow-[0_12px_30px_rgba(249,87,0,0.6)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 group w-full sm:w-auto text-center"
            >
              <span className="uppercase tracking-wider font-['Montserrat',sans-serif]">
                {BUSINESS.ordersPaused ? 'Užklausų informacija' : 'Užsakyti galandimą'}
              </span>
              <ChevronRight className="w-5 h-5 flex-shrink-0 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          <div className="mt-5 text-sm text-neutral-300"><a href="/kainos" className="underline underline-offset-4 hover:text-orange-400">Visos galandimo ir grąžinimo kainos</a></div>

          <div className="mt-6 sm:mt-8 pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-2.5 sm:gap-8 text-neutral-300 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-[#f95700] flex-shrink-0" />
              <span className="font-medium">{isEnabled('noPrepayment') ? 'Už galandimą iš anksto mokėti nereikia' : 'Profesionalus grandinių galandimas'}</span>
            </div>
            {(price || (sp.enabled && sp.chainsSharpened > 0)) && (
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 sm:w-5 sm:h-5 text-[#f95700] fill-[#f95700]/20 flex-shrink-0" />
                <span className="font-medium">
                  {sp.enabled && sp.chainsSharpened > 0 ? `Daugiau nei ${sp.chainsSharpened} pagaląstų grandinių` : `Kaina ${price}`}
                </span>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center gap-2 text-xs">
            <span className="text-neutral-400 font-semibold whitespace-nowrap">Galandimas jūsų mieste:</span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 sm:flex-wrap -mx-1 px-1">
              {cities.map((c) => (
                <Link
                  key={c.slug}
                  to="/miestas/$slug"
                  params={{ slug: c.slug }}
                  onClick={() => onSelectCity?.(c.slug)}
                  title={`Grandinių galandimas ${c.name}`}
                  className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-orange-500/20 hover:text-orange-400 text-neutral-300 border border-white/10 transition-colors whitespace-nowrap cursor-pointer text-xs"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


