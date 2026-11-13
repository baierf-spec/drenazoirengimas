import { useState } from 'react';
import {
  Calculator,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Check,
  Sparkles,
  Package,
  HelpCircle,
} from 'lucide-react';
import { BUSINESS, isEnabled, quote, formatEur } from '../config/business';

interface BrandOption {
  id: string;
  name: string;
  series: string;
  avgNewPrice: number;
}

const BRANDS: readonly BrandOption[] = BUSINESS.comparisonBrands;

interface ProfileOption {
  id: string;
  label: string;
  count: number;
  subtitle: string;
  isPopular?: boolean;
}

const PROFILES: ProfileOption[] = [
  {
    id: 'homestead_1',
    label: 'Buitinis pjovėjas',
    count: 1,
    subtitle: '1 grandinė (retkarčiais sodyboje)',
  },
  {
    id: 'homestead_2',
    label: 'Sodybai / ūkeliui',
    count: 2,
    subtitle: '1–2 grandinės per metus (su atsargine)',
  },
  {
    id: 'heating',
    label: 'Malkų ruoša',
    count: 4,
    subtitle: '3–4 grandinės malkų sezonui',
    isPopular: true,
  },
  {
    id: 'heavy',
    label: 'Aktyvus ūkis',
    count: 5,
    subtitle: '5 grandinės sezonui',
  },
  {
    id: 'pro',
    label: 'Miško darbai',
    count: 10,
    subtitle: '10 grandinių didesniems darbams',
  },
];

interface SavingsCalculatorProps {
  onApplyQuantity?: (qty: number) => void;
}

export function SavingsCalculator({ onApplyQuantity }: SavingsCalculatorProps) {
  // Synchronized count state
  const [chainCount, setChainCount] = useState<number>(4);
  const [inboundCost, setInboundCost] = useState('');
  const [selectedBrandId, setSelectedBrandId] = useState<string>('stihl');

  const selectedBrand = BRANDS.find((b) => b.id === selectedBrandId) || BRANDS[0];

  const q = quote(chainCount);
  const chainPrice = q?.chainPrice ?? 0;
  const shippingPrice = q?.shippingPrice ?? 0;
  const inboundEstimate = BUSINESS.shipping.enabled ? Math.min(100, Math.max(0, Number(inboundCost) || 0)) : 0;
  const totalOurCost = chainPrice + shippingPrice + inboundEstimate;
  const freeMin = BUSINESS.shipping.freeShippingMinimumQuantity;
  const freeOn = isEnabled('freeShipping');
  const provider = BUSINESS.shipping.provider;

  // Buying new chains retail price
  const costBuyingNew = chainCount * selectedBrand.avgNewPrice;

  // Immediate savings for this exact count
  const immediateSavings = costBuyingNew - totalOurCost;
  const percentSaved = Math.round((immediateSavings / costBuyingNew) * 100);

  const handleApply = () => {
    if (onApplyQuantity) {
      onApplyQuantity(chainCount);
    }
    const el = document.getElementById('uzsakyti');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Be viešų kainų palyginimas neturi prasmės – sekcija nerodoma.
  if (!q) return null;

  return (
    <section id="skaiciuokle" className="w-full py-16 sm:py-24 px-4 sm:px-8 bg-[#0d0e13] text-white border-t border-white/5 relative">
      <div className="max-w-6xl mx-auto">
        {/* Section Heading */}
        <div className="text-center mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs uppercase tracking-wider font-bold mb-3">
            <Calculator className="w-3.5 h-3.5" />
            <span>Ekonominis palyginimas</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold uppercase tracking-wider text-white font-['Montserrat',sans-serif]">
            Kiek sutaupote galąsdami, o ne pirkdami naują?
          </h2>
          <div className="w-16 h-1 bg-[#c2410c] mx-auto mt-3 rounded-full" />
          <p className="hidden lg:block mt-4 text-sm sm:text-base text-neutral-400 max-w-2xl mx-auto leading-relaxed">
            Pasirinkite savo ūkio poreikį ir grandinės gamintoją. Pamatysite orientacinį palyginimą – kiek kainuotų pirkti naujas grandines ir kiek sutaupote jas pagaląsdami profesionaliomis staklėmis.
          </p>
        </div>

        {/* Calculator Main Box */}
        <div className="bg-[#13151c] border border-white/10 rounded-2xl p-5 sm:p-9 shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* Left Column: Interactive Controls */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-7">
              
              {/* Step 1: Usage Profile / Chain count */}
              <div>
                <div className="flex justify-between items-center mb-2.5">
                  <label htmlFor="chainCountSlider" className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-300 font-['Montserrat',sans-serif] flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#c2410c]/20 text-[#f95700] flex items-center justify-center text-xs font-black">1</span>
                    <span>Kiek grandinių turite ar planuojate galąsti?</span>
                  </label>
                  <span className="text-base sm:text-lg font-extrabold text-[#f95700] bg-orange-500/10 px-3 py-0.5 rounded-lg border border-orange-500/20 font-['Montserrat',sans-serif]">
                    {chainCount} vnt.
                  </span>
                </div>

                {/* Profile selection buttons - fully synchronized with count */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                  {PROFILES.map((p) => {
                    const isSelected = chainCount === p.count;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setChainCount(p.count)}
                        className={`p-3 rounded-xl text-left border transition-all cursor-pointer relative ${
                          isSelected
                            ? 'bg-[#1e222c] border-[#f95700] text-white shadow-md shadow-orange-500/15 ring-1 ring-[#f95700]'
                            : 'bg-[#111317] border-white/5 text-neutral-400 hover:text-neutral-200 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-white text-xs sm:text-sm">{p.label}</span>
                          <span className={`text-xs font-extrabold px-2 py-0.5 rounded-md ${
                            isSelected ? 'bg-[#c2410c] text-white' : 'bg-white/5 text-neutral-400'
                          }`}>
                            {p.count} vnt.
                          </span>
                        </div>
                        <div className="text-[11px] text-neutral-400 mt-1">{p.subtitle}</div>
                        {p.isPopular && (
                          <span className="absolute -top-2 right-3 text-[9px] font-black uppercase px-2 py-0.5 rounded-full tracking-tight bg-amber-400 text-neutral-950 shadow">
                            ★ Rekomenduojame
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Fine tuning slider */}
                <div className="hidden lg:block pt-2">
                  <div className="flex justify-between text-xs text-neutral-400 mb-1.5">
                    <span>Arba nustatykite tikslų kiekį slankikliu:</span>
                    <span className="text-[#f95700] font-bold">{chainCount} grandinės (-ių)</span>
                  </div>
                  <input
                    id="chainCountSlider"
                    type="range"
                    min="1"
                    max="12"
                    step="1"
                    value={chainCount}
                    onChange={(e) => setChainCount(Number(e.target.value))}
                    className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-[#f95700]"
                  />
                  <div className="flex justify-between text-[11px] text-neutral-400 mt-1">
                    <span>1 vnt.</span>
                    {freeOn ? <span className="text-orange-400 font-semibold">Nuo {freeMin} vnt. – grąžinimas 0,00 €</span> : <span />}
                    <span>12 vnt.</span>
                  </div>
                </div>
              </div>

              {/* Step 2: Brand selector */}
              <div>
                <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-300 font-['Montserrat',sans-serif] mb-2.5 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#c2410c]/20 text-[#f95700] flex items-center justify-center text-xs font-black">2</span>
                  <span>Kokio gamintojo grandines naudojate?</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {BRANDS.map((b) => {
                    const isSelected = b.id === selectedBrandId;
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setSelectedBrandId(b.id)}
                        className={`p-2.5 sm:p-3 rounded-xl text-left border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#1e222c] border-[#f95700] text-white shadow-md shadow-orange-500/10 ring-1 ring-[#f95700]'
                            : 'bg-[#111317] border-white/5 text-neutral-400 hover:text-neutral-200 hover:border-white/20'
                        }`}
                      >
                        <div className="font-extrabold text-white text-xs sm:text-sm">{b.name}</div>
                        <div className="text-[10px] sm:text-[11px] text-neutral-400 truncate mt-0.5">{b.series}</div>
                        <div className="hidden lg:block text-[11px] sm:text-xs text-orange-400 font-bold mt-1.5">
                          Nauja: ~{b.avgNewPrice} €
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {BUSINESS.shipping.enabled && <div className="rounded-xl border border-white/10 p-4 space-y-2">
                <label htmlFor="inbound-shipping-cost" className="block text-sm font-semibold">Siuntimo mums kaina (€)</label>
                <input id="inbound-shipping-cost" type="number" min={0} max={100} step="0.01" value={inboundCost} onChange={(e) => setInboundCost(e.target.value)} placeholder="Įrašykite vežėjo kainą" className="w-full min-h-[44px] rounded-lg bg-neutral-900 border border-white/20 px-3 text-white" />
                <p className="text-xs text-neutral-400">Šią siuntą užsakote ir apmokate patys. {inboundCost === '' ? 'Kol kainos neįrašėte, ji į palyginimą neįtraukta.' : 'Įrašyta kaina įtraukta tik į šį palyginimą, ne į sumą mums.'}</p>
              </div>}
              {/* Explanatory Box on Why 4 chains is popular */}
              <div className="hidden lg:block p-3.5 bg-white/[0.03] border border-white/10 rounded-xl text-xs text-neutral-300 space-y-2">
                <div className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-[#f95700] flex-shrink-0 mt-0.5" />
                  <span className="leading-relaxed">
                    <strong>Vertinkite grandinės būklę.</strong> Galandimų skaičius priklauso nuo nusidėvėjimo ir pažeidimų. Naujų grandinių kainos šiame palyginime yra orientacinės, ne parduotuvės pasiūlymas.
                  </span>
                </div>

                {freeOn && chainCount < freeMin && (
                  <div className="pt-2 border-t border-white/5 flex items-start gap-2 text-neutral-400">
                    <HelpCircle className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-orange-400">Patarimas sodybos šeimininkui:</strong> Jei turite tik {chainCount} grandinę (-es), pridėkite kaimyno ar giminaičio atšipusias grandines iki <strong>{freeMin} vnt.</strong> – tuomet {provider} grąžinimas jums taps <strong>nemokamas (0,00 €)</strong>!
                    </span>
                  </div>
                )}
              </div>

            </div>

            {/* Right Column: High-Impact Comparison Card */}
            <div className="lg:col-span-5 bg-gradient-to-br from-[#161922] to-[#101217] border border-orange-500/30 rounded-2xl p-5 sm:p-7 flex flex-col justify-between shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

              <div>
                {/* Header */}
                <div className="flex items-center justify-between gap-2 pb-3 border-b border-white/10">
                  <span className="text-xs font-bold uppercase tracking-wider text-orange-400 flex items-center gap-1.5 font-['Montserrat',sans-serif]">
                    <TrendingUp className="w-4 h-4 flex-shrink-0" />
                    Orientacinis palyginimas
                  </span>
                  <span className="text-[11px] text-neutral-300 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10 font-bold">
                    {chainCount} vnt. • {selectedBrand.name}
                  </span>
                </div>

                {/* Big Savings Metric */}
                <div className="my-5">
                  <div className="text-xs uppercase tracking-wider text-neutral-400 font-semibold">
                    Orientacinis kainų skirtumas:
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-4xl sm:text-5xl font-black text-emerald-400 font-['Montserrat',sans-serif] tracking-tight">
                      {immediateSavings >= 0 ? '+' : ''}{formatEur(immediateSavings)}
                    </span>
                    <span className="text-xs font-bold text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                      {percentSaved >= 0 ? `${percentSaved}% mažiau` : `${Math.abs(percentSaved)}% daugiau`}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">
                    Palyginimas pagal pasirinktas orientacines kainas. {BUSINESS.shipping.enabled && inboundCost === '' ? 'Siuntimo mums išlaidos dar neįtrauktos.' : 'Įtrauktos aukščiau nurodytos išlaidos.'}
                  </p>
                </div>

                {/* Mobile compact summary */}
                <div className="lg:hidden space-y-2 py-3 border-y border-white/10">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-neutral-400">{chainCount} naujos {selectedBrand.name} kainuotų:</span>
                    <span className="font-bold text-neutral-300 line-through">{formatEur(costBuyingNew)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-white flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      Galandimas ir įtrauktos išlaidos:
                    </span>
                    <span className="font-extrabold text-[#f95700]">{formatEur(totalOurCost)}</span>
                  </div>
                  {!BUSINESS.shipping.enabled ? null : shippingPrice === 0 ? (
                    <div className="flex items-center gap-1 text-xs font-bold text-emerald-400">
                      <Check className="w-3.5 h-3.5" />
                      Grąžinimas nemokamas
                    </div>
                  ) : (
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-neutral-400">Grąžinimas:</span>
                      <span className="font-semibold text-neutral-200">{formatEur(shippingPrice)}</span>
                    </div>
                  )}
                </div>

                {/* Visual Comparison Bars */}
                <div className="hidden lg:block space-y-3 pt-2 pb-4 border-y border-white/10">
                  {/* Option A: Buying new */}
                  <div>
                    <div className="flex justify-between text-xs text-neutral-400 mb-1">
                      <span>{chainCount} naujos {selectedBrand.name} grandinės:</span>
                      <span className="font-extrabold text-neutral-300 line-through">
                        {formatEur(costBuyingNew)}
                      </span>
                    </div>
                    <div className="w-full h-3 bg-neutral-800 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-500/80 rounded-full w-full" />
                    </div>
                  </div>

                  {/* Option B: Our sharpening */}
                  <div>
                    <div className="flex justify-between text-xs text-neutral-200 mb-1">
                      <span className="font-semibold text-white flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        Galandimas ir įtrauktos išlaidos:
                      </span>
                      <span className="font-extrabold text-[#f95700] text-sm">
                        {formatEur(totalOurCost)}
                      </span>
                    </div>
                    <div className="w-full h-3 bg-neutral-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#c2410c] rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(100, Math.max(12, Math.round((totalOurCost / costBuyingNew) * 100)))}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Cost breakdown items */}
                <div className="hidden lg:block py-3.5 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-neutral-300">
                    <span className="text-neutral-400">Galandimo kaina ({chainCount} vnt.):</span>
                    <span className="text-white font-bold">{formatEur(chainPrice)}</span>
                  </div>

                  <div className="flex justify-between items-center text-neutral-300">
                    <span className="flex items-center gap-1.5 text-neutral-400">
                      <Package className="w-3.5 h-3.5 text-neutral-400" />
                      Grąžinimas paštomatu:
                    </span>
                    <span className={shippingPrice === 0 ? 'text-emerald-400 font-bold' : 'text-neutral-200 font-semibold'}>
                      {shippingPrice === 0 ? (BUSINESS.shipping.enabled ? 'NEMOKAMAS' : '—') : `${formatEur(shippingPrice)}`}
                    </span>
                  </div>

                  {BUSINESS.shipping.enabled && <div className="flex justify-between gap-3 text-neutral-300 pt-2 border-t border-white/5"><span>Siuntimas mums (mokate vežėjui):</span><span>{inboundCost === '' ? 'Neįtrauktas' : formatEur(inboundEstimate)}</span></div>}
                </div>
              </div>

              {/* Action Button & Guarantee */}
              <div className="pt-2">
                <button
                  type="button"
                  id="savings-calc-apply-btn"
                  onClick={handleApply}
                  className="w-full py-3.5 sm:py-4 px-4 bg-[#c2410c] hover:bg-[#9a3412] text-white font-extrabold text-sm uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 group cursor-pointer font-['Montserrat',sans-serif]"
                >
                  <span>{BUSINESS.ordersPaused ? `Pritaikyti ${chainCount} vnt.` : `Pritaikyti ${chainCount} vnt. užklausai`}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                </button>
                {isEnabled('guarantee') && (
                  <div className="flex items-center justify-center gap-1.5 text-[11px] text-neutral-400 mt-2.5 text-center">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span>Garantija – jei nepjaus kaip reikia, pagaląsime iš naujo</span>
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      </div>
    </section>
  );
}


