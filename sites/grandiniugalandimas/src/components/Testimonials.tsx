import { ShieldCheck, Ruler, Timer, RefreshCw, PackageCheck, Wrench } from 'lucide-react';
import { BUSINESS, formatEur, getPriceRange, isEnabled, visible, type FeatureFlag } from '../config/business';

interface PromiseItem {
  id: string;
  icon: typeof ShieldCheck;
  title: string;
  text: string;
  requires?: FeatureFlag[];
}

function priceText(): string {
  const r = getPriceRange();
  const s = BUSINESS.shipping;
  const parts: string[] = [];
  if (r) parts.push(r.low === r.high ? `${formatEur(r.low)} už grandinę.` : `Nuo ${formatEur(r.low)} už grandinę.`);
  if (s.enabled && s.price > 0) parts.push(`Grąžinimas jums ${formatEur(s.price)}${s.priceForTwo != null ? ` (2 vnt. – ${formatEur(s.priceForTwo)})` : ''}.`);
  if (isEnabled('freeShipping')) parts.push(`Nuo ${s.freeShippingMinimumQuantity} vnt. grąžinimas nemokamas.`);
  if (s.enabled) parts.push('Siuntimą mums apmokate vežėjui atskirai.');
  return parts.join(' ');
}

export function Testimonials() {
  const s = BUSINESS.shipping;
  const promises: PromiseItem[] = visible<PromiseItem>([
    {
      id: 'kokybe',
      icon: Ruler,
      title: 'Tikslus galandimas pagal grandinės parametrus',
      text: 'Įvertiname grandinės parametrus ir dantukų būklę, kad galandimas būtų tolygus ir grandinė pjautų stabiliai.',
    },
    {
      id: 'ribotuvai',
      icon: Wrench,
      title: 'Koreguojame gylio ribotuvus',
      text: 'Tai dažnai praleidžiamas žingsnis. Be jo grandinė net ir aštri „nekanda“ medienos. Patikriname ir pakoreguojame ribotuvus kiekvienoje grandinėje.',
      requires: ['depthGauge'],
    },
    {
      id: 'terminis',
      icon: Timer,
      title: 'Metalo neperkaitiname',
      text: 'Galandame su aušinimu ir kontroliuojamu tempu, kad neatleistume metalo. Perkaitinta grandinė atšimpa greičiau.',
      requires: ['cooledMachine'],
    },
    {
      id: 'siuntimas',
      icon: PackageCheck,
      title: `Viskas paštomatais`,
      text: `Nereikia niekur važiuoti. Grandines įdedate į artimiausią paštomatą, o pagaląstas atsiimate suderintame paštomate. Siuntimą mums apmokate patys.${
        isEnabled('freeShipping') ? ` Nuo ${s.freeShippingMinimumQuantity} vnt. grąžinimas nemokamas.` : ''
      }`,
      requires: ['shipping'],
    },
    {
      id: 'garantija',
      icon: RefreshCw,
      title: 'Nepatiko – pagaląsime iš naujo',
      text: 'Jei grandinė pjaus prasčiau nei tikėjotės, pagaląsime pakartotinai be papildomo mokesčio.',
      requires: ['guarantee'],
    },
    {
      id: 'kaina',
      icon: ShieldCheck,
      title: 'Aiški kaina be netikėtumų',
      text: priceText(),
      requires: ['prices'],
    },
  ]);

  const sp = BUSINESS.socialProof;

  return (
    <section
      id="atsiliepimai"
      className="w-full py-16 sm:py-24 px-4 sm:px-8 bg-[#0b0c0f] text-white border-t border-white/5"
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-[#f95700] text-xs uppercase tracking-wider font-bold mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Mūsų pažadas jums</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold uppercase tracking-wider text-white font-['Montserrat',sans-serif]">
            Kodėl galite mumis pasitikėti?
          </h2>
          <div className="w-16 h-1 bg-[#c2410c] mx-auto mt-3 rounded-full" />
          <p className="mt-4 text-sm sm:text-base text-neutral-400 max-w-xl mx-auto">
            Konkretūs įsipareigojimai, pagal kuriuos galite mus vertinti.
          </p>
          {sp.enabled && (sp.chainsSharpened > 0 || sp.customersServed > 0) && (
            <p className="mt-3 text-sm text-neutral-300">
              {sp.chainsSharpened > 0 && <strong>{sp.chainsSharpened}+ pagaląstų grandinių</strong>}
              {sp.chainsSharpened > 0 && sp.customersServed > 0 && ' · '}
              {sp.customersServed > 0 && <strong>{sp.customersServed}+ klientų</strong>}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {promises.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="bg-[#13151b] border border-white/10 hover:border-orange-500/40 rounded-2xl p-6 sm:p-7 transition-all duration-300 shadow-xl hover:-translate-y-1"
              >
                <div className="w-11 h-11 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-[#f95700]" />
                </div>
                <h3 className="font-bold text-white text-base mb-2">{item.title}</h3>
                <p className="text-neutral-400 text-sm leading-relaxed">{item.text}</p>
              </div>
            );
          })}
        </div>

        {(isEnabled('guarantee') || isEnabled('noPrepayment')) && (
          <div className="mt-10 sm:mt-12 text-center">
            <div className="inline-flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 px-4 sm:px-6 py-3 sm:py-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs sm:text-sm text-neutral-300 max-w-2xl mx-auto">
              {isEnabled('guarantee') && (
                <span className="flex items-center gap-2 text-center">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                  <span>
                    <strong>Pasitenkinimo garantija:</strong> jei nepjaus kaip reikia – pagaląsime iš naujo
                  </span>
                </span>
              )}
              {isEnabled('guarantee') && isEnabled('noPrepayment') && (
                <span className="text-neutral-500 hidden sm:inline">•</span>
              )}
              {isEnabled('noPrepayment') && <span className="text-neutral-400">Iš anksto mokėti nereikia</span>}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}


