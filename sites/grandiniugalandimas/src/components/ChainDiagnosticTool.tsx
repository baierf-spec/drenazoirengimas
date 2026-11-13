import { useState } from 'react';
import { AlertCircle, Wrench, CheckCircle2, ArrowRight, Sparkles, HelpCircle } from 'lucide-react';
import { BUSINESS, isEnabled, priceFromLabel, turnaroundLabel } from '../config/business';

interface Symptom {
  id: string;
  shortTitle: string;
  iconText: string;
  problem: string;
  consequences: string;
  solution: string;
  verdict: 'Patikrinti aštrumą' | 'Patikrinti reguliavimą' | 'Patikrinti nusidėvėjimą' | 'Sustabdyti ir patikrinti';
  verdictColor: string;
  savings: string;
}

const symptoms: Symptom[] = [
  {
    id: 'dust',
    shortTitle: 'Dulkės vietoj drožlių',
    iconText: '💨',
    problem: 'Pjaunant kyla smulkios medienos dulkės, o ne stambios, ilgos drožlės.',
    consequences: 'Tai gali rodyti atšipusius dantukus. Darbas tampa lėtesnis ir reikalauja daugiau pastangų. Prieš tęsdami patikrinkite grandinę pagal pjūklo gamintojo instrukciją.',
    solution: 'Galandimo kampas parenkamas pagal konkrečios grandinės gamintojo nurodymus. Prieš galandant įvertinama grandinės būklė.',
    verdict: 'Patikrinti aštrumą',
    verdictColor: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
    savings: 'Galandimo ir keitimo kainą palyginkite skaičiuoklėje',
  },
  {
    id: 'crooked',
    shortTitle: 'Pjūvis krypsta į šoną',
    iconText: '📐',
    problem: 'Pjūklą savaime traukia į kairę arba dešinę pusę, pjūvis gaunasi lanku.',
    consequences: 'Galimos priežastys – nevienodai pagaląsti ar pažeisti dantukai, taip pat nusidėvėjusi arba pažeista pjovimo juosta. Vien iš pjūvio krypties priežasties nustatyti negalima.',
    solution: 'Reikia patikrinti abiejų pusių dantukų ilgį ir galandimo kampus, taip pat juostos griovelio ir kraštų nusidėvėjimą.',
    verdict: 'Patikrinti reguliavimą',
    verdictColor: 'text-orange-400 bg-orange-400/10 border-orange-400/30',
    savings: 'Laiku pastebėtas nusidėvėjimas padeda išvengti papildomų gedimų',
  },
  {
    id: 'pressure',
    shortTitle: 'Reikia stipriai spausti',
    iconText: '🏋️',
    problem: 'Pjūklas sunkiai skverbiasi į medieną, pjovimui reikia vis daugiau spaudimo.',
    consequences: 'Priežastis gali būti atšipę dantukai ar netinkamas gylio ribotuvų aukštis. Nebandykite problemos kompensuoti stipriau spausdami pjūklą.',
    solution: 'Gylio ribotuvų aukštis tikrinamas pagal konkrečios grandinės gamintojo nurodymus. Per žemai nuleisti ribotuvai gali padidinti atatrankos riziką.',
    verdict: 'Patikrinti reguliavimą',
    verdictColor: 'text-orange-400 bg-orange-400/10 border-orange-400/30',
    savings: 'Pirmiausia nustatykite, kodėl pjovimui reikia daugiau jėgos',
  },
  {
    id: 'smoke',
    shortTitle: 'Dūmai ir degėsių kvapas',
    iconText: '🔥',
    problem: 'Pjaunant jaučiamas dūmų ar apdegusios medienos kvapas, pjūvis pajuodęs.',
    consequences: 'Sustabdykite darbą. Dūmai gali atsirasti dėl atšipusios grandinės, nepakankamo tepimo ar netinkamo įtempimo. Patikrinkite pjūklą pagal gamintojo instrukciją.',
    solution: 'Pirmiausia patikrinkite grandinės tepimą, įtempimą ir grandinės bei juostos būklę. Vien galandimas tepimo ar įtempimo problemos neišspręs.',
    verdict: 'Sustabdyti ir patikrinti',
    verdictColor: 'text-red-400 bg-red-400/10 border-red-400/30',
    savings: 'Sustabdę darbą ir patikrinę tepimą galite išvengti didesnio nusidėvėjimo',
  },
  {
    id: 'tooth-length',
    shortTitle: 'Mažas dantuko likutis',
    iconText: '🔍',
    problem: 'Pjovimo dantukai stipriai sutrumpėję arba priartėję prie nusidėvėjimo žymų.',
    consequences: 'Vien likusio dantuko ilgio nepakanka spręsti apie saugumą. Reikia patikrinti nusidėvėjimo žymas, įtrūkimus ir kitus grandinės pažeidimus.',
    solution: 'Tinkamumas toliau naudoti vertinamas pagal gamintojo nusidėvėjimo žymas ir visos grandinės būklę. Pasiekus ribą ar radus pažeidimų grandinę reikia pakeisti.',
    verdict: 'Patikrinti nusidėvėjimą',
    verdictColor: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
    savings: 'Pasiekus gamintojo ribą reikia keitimo, o ne papildomo galandimo',
  },
];

export function ChainDiagnosticTool() {
  const [selectedId, setSelectedId] = useState<string>('dust');

  const currentSymptom = symptoms.find((s) => s.id === selectedId) || symptoms[0];

  const scrollToCalculator = () => {
    const el = document.getElementById('uzsakyti');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="diagnostika" className="w-full py-16 sm:py-24 px-4 sm:px-8 bg-[#0e1014] text-white border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        {/* Title */}
        <div className="text-center mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-[#f95700] text-xs uppercase tracking-wider font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interaktyvus įrankis</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold uppercase tracking-wider text-white font-['Montserrat',sans-serif]">
            Grandinės Būklės Testas: Kada laikas galąsti?
          </h2>
          <div className="w-16 h-1 bg-[#c2410c] mx-auto mt-3 rounded-full" />
          <p className="mt-4 text-sm sm:text-base text-neutral-400 max-w-2xl mx-auto">
            Pasirinkite pastebėtą požymį ir sužinokite, ką verta patikrinti. Tai orientacinis gidas; galutinai būklė įvertinama apžiūrėjus grandinę ir pjūklą.
          </p>
        </div>

        {/* Symptoms Selector Tabs - Mobile horizontal scroll / Desktop grid */}
        <div className="flex sm:grid sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 mb-6 sm:mb-8 overflow-x-auto pb-2 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0">
          {symptoms.map((item) => {
            const isSelected = item.id === selectedId;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedId(item.id)}
                aria-pressed={isSelected}
                className={`min-w-[140px] xs:min-w-[155px] sm:min-w-0 flex-shrink-0 sm:flex-shrink p-3 sm:p-4 rounded-xl text-left transition-all border flex flex-col justify-between gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-[#1b1e26] border-[#f95700] shadow-lg shadow-orange-500/10 ring-1 ring-[#f95700]'
                    : 'bg-[#121419] border-white/5 hover:border-white/20 text-neutral-400 hover:text-white'
                }`}
              >
                <div className="text-xl sm:text-2xl">{item.iconText}</div>
                <div className="text-xs sm:text-sm font-bold text-white leading-snug">
                  {item.shortTitle}
                </div>
              </button>
            );
          })}
        </div>

        <p className="mb-6 text-sm text-neutral-300">Plačiau: <a href="/kaip-zinoti-kad-grandine-buka" className="text-orange-400 underline underline-offset-4">atšipusios grandinės požymiai</a> ir <a href="/kiek-kartu-galima-galasti-grandine" className="text-orange-400 underline underline-offset-4">kada grandinę jau reikia keisti</a>.</p>
        {/* Diagnostic Result Card */}
        <div className="bg-[#13151b] border border-white/10 rounded-2xl p-5 sm:p-9 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-60 h-60 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Col: Problem description & Consequence */}
            <div className="lg:col-span-7 space-y-5">
              <div className="flex flex-wrap items-center gap-3">
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${currentSymptom.verdictColor}`}>
                  {currentSymptom.verdict}
                </span>
                <span className="text-xs text-neutral-400 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-neutral-500" />
                  Simptomas: <strong className="text-neutral-200">{currentSymptom.shortTitle}</strong>
                </span>
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                  Kas vyksta su grandine?
                </h3>
                <p className="mt-2 text-sm text-neutral-300 leading-relaxed">
                  {currentSymptom.problem}
                </p>
              </div>

              <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 text-xs sm:text-sm text-neutral-300 leading-relaxed">
                <strong className="text-red-400 block mb-1">⚠️ Pavojus įrankiui ir saugumui:</strong>
                {currentSymptom.consequences}
              </div>

              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-[#f95700]" />
                  Ką reikėtų patikrinti:
                </h4>
                <p className="mt-1.5 text-sm text-neutral-300 leading-relaxed">
                  {currentSymptom.solution}
                </p>
              </div>
            </div>

            {/* Right Col: Solution summary & Direct CTA */}
            <div className="lg:col-span-5 bg-[#181b22] border border-white/10 rounded-xl p-6 flex flex-col justify-between h-full space-y-5">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-[#f95700] mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Prieš perduodant grandinę
                </div>
                <div className="text-base sm:text-lg font-bold text-white leading-snug">
                  {isEnabled('shipping') ? `Galandimas staklėmis paštomatu` : 'Galandimas staklėmis'}
                </div>
                <p className="mt-2 text-xs text-neutral-400 leading-relaxed">
                  {isEnabled('shipping') ? `Siuntimo ir galandimo detales suderinsime prieš priimdami užsakymą.${turnaroundLabel() ? ` Orientacinis terminas – per ${turnaroundLabel()}.` : ''}` : 'Grandinės perdavimo ir galandimo detales suderinsime prieš priimdami užsakymą.'}
                </p>
              </div>

              <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                <div className="text-xs font-bold text-emerald-400">Ką įvertinti:</div>
                <div className="text-xs text-neutral-200 mt-0.5">{currentSymptom.savings}</div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={scrollToCalculator}
                  className="w-full py-3.5 px-4 bg-[#c2410c] hover:bg-[#9a3412] text-white font-bold text-sm uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 group"
                >
                  <span>{BUSINESS.ordersPaused ? 'Užklausų informacija' : 'Užsakyti galandimą'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                {(priceFromLabel() || isEnabled('freeShipping')) && (
                  <p className="text-center text-[11px] text-neutral-500 mt-2">
                    {[priceFromLabel() && `Kaina ${priceFromLabel()}`, isEnabled('freeShipping') && `Nuo ${BUSINESS.shipping.freeShippingMinimumQuantity} vnt. grąžinimas nemokamas`].filter(Boolean).join(' • ')}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


