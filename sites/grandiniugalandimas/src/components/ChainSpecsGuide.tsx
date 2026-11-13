import { BUSINESS } from '@/config/business';
import { BookOpen, Check, Layers, Ruler } from 'lucide-react';

export function ChainSpecsGuide() {
  const steps = [
    {
      title: '1. Žingsnis (Pitch)',
      desc: 'Atstumas tarp pirmos ir trečios gretimų kniedžių centrų, padalintas iš dviejų. Pavyzdžiai: 1/4", .325", 3/8". Tikslų tipą tikrinkite pagal grandinės žymėjimą.',
      badge: '.325" / 3/8" / 1/4"',
    },
    {
      title: '2. Varančiųjų narelių skaičius',
      desc: 'Suskaičiuokite trikampius narelius, kurie įsistato į pjovimo juostos griovelį (pvz., 50, 52, 56, 64, 72 vnt.). Tai nusako tikslų grandinės ilgį.',
      badge: '50 – 84 nareliai',
    },
    {
      title: '3. Varančiojo narelio storis',
      desc: 'Varančiojo narelio storis turi atitikti juostos griovelį. Pavyzdžiai: 1,1 mm, 1,3 mm, 1,5 mm ar 1,6 mm. Nespręskite vien iš pjūklo modelio.',
      badge: '1,1 – 1,6 mm',
    },
  ];

  const brands = ['Stihl', 'Husqvarna', 'Oregon', 'Makita', 'Echo', 'Dewalt', 'Milwaukee', 'Parkside', 'Dolmar', 'Oleo-Mac'];

  return (
    <section id="gidas" className="w-full py-16 sm:py-20 px-4 sm:px-8 bg-[#0b0c0f] text-white border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-neutral-300 text-xs uppercase tracking-wider font-bold mb-3">
            <BookOpen className="w-3.5 h-3.5 text-[#f95700]" />
            <span>Pjūklų Meistro Gidas</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-wider text-white font-['Montserrat',sans-serif]">
            Kaip atpažinti savo pjūklo grandinę
          </h2>
          <div className="w-16 h-1 bg-[#c2410c] mx-auto mt-3 rounded-full" />
          <p className="mt-3.5 text-sm sm:text-base text-neutral-400 max-w-xl mx-auto">
            Šie trys parametrai padės tiksliau apibūdinti grandinę. Jos tinkamumą galandimui suderinsime prieš priimdami užsakymą.
          </p>
        </div>

        {/* 3 Technical criteria cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 mb-10">
          {steps.map((item, idx) => (
            <div key={idx} className="bg-[#13151b] border border-white/10 rounded-xl p-6 relative">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#f95700] bg-orange-500/10 px-2.5 py-1 rounded-md border border-orange-500/20">
                  {item.badge}
                </span>
                <Ruler className="w-4 h-4 text-neutral-500" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">{item.title}</h3>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Compatible Brands ticker / chips */}
        <div className="bg-[#121419] border border-white/5 rounded-2xl p-6 sm:p-8 text-center">
          <div className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-4 flex items-center justify-center gap-2">
            <Layers className="w-4 h-4 text-[#f95700]" />
            Dažniausiai sutinkami grandinių gamintojai:
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {brands.map((brand) => (
              <span
                key={brand}
                className="px-3.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs sm:text-sm font-semibold text-neutral-300 hover:text-white hover:border-orange-500/40 transition-colors"
              >
                {brand}
              </span>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-4 text-xs text-neutral-400">
            {BUSINESS.services.standardChains && (<span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-400" /> Standartinės plieninės grandinės
            </span>)}
            {BUSINESS.services.carbideChains && (<span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-400" /> Kietlydinio (karbido / Vidia) grandinės
            </span>)}
            {BUSINESS.services.rippingChains && (<span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-400" /> Išilginio pjovimo grandinės
            </span>)}
          </div>
        </div>
      </div>
    </section>
  );
}

