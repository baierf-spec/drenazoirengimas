import { Check } from 'lucide-react';
import { BeforeAfterSlider } from './BeforeAfterSlider';
import { visible, type FeatureFlag } from '../config/business';

const FEATURES: { id: string; text: string; requires?: FeatureFlag[] }[] = [
  { id: 'cooling', text: 'Neperkaitiname metalo (staklės su aušinimu)', requires: ['cooledMachine'] },
  {
    id: 'depth-gauge',
    text: 'Nuleidžiame gylio ribotuvus – grandinė „kąs“ medį, o ne slys paviršiumi',
    requires: ['depthGauge'],
  },
  { id: 'angles', text: 'Įvertiname dantukų būklę ir galandimo kampą' },
  { id: 'carbide', text: 'Galandame ir kietlydinio (karbido) grandines', requires: ['carbide'] },
];

export function WhyUs() {
  const features = visible(FEATURES).slice(0, 4);

  return (
    <section className="w-full py-14 sm:py-20 px-4 sm:px-8 bg-[#0e1014] text-white border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-wider text-white font-['Montserrat',sans-serif]">
            Kodėl verta galąsti pas mus?
          </h2>
          <div className="w-16 h-1 bg-[#c2410c] mx-auto mt-2.5 sm:mt-3 rounded-full" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-14 items-center">
          <div className="lg:col-span-6 w-full max-w-lg mx-auto lg:max-w-none">
            <BeforeAfterSlider />
          </div>

          <div className="lg:col-span-6 space-y-4 sm:space-y-6">
            {features.map((item) => (
              <div key={item.id} className="flex items-start gap-3.5 sm:gap-4 group">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#c2410c]/15 text-[#f95700] border border-[#f95700]/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.5]" />
                </div>
                <p className="text-sm sm:text-lg text-neutral-200 font-medium leading-relaxed group-hover:text-white transition-colors">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

