import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, MapPin, Search, Truck } from 'lucide-react';
import { Link } from './Link';
import { type CityInfo, CITIES_DATA } from '../data/citiesData';
import type { CityLocker } from '../data/cityLockers';
import { OrderCalculator } from './OrderCalculator';
import { BUSINESS, isEnabled, priceFromLabel, turnaroundLabel } from '../config/business';

interface CityLandingPageProps {
  citySlug: string;
  onBackToHome: () => void;
  onSelectCity: (slug: string) => void;
}

function normalize(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function CityLandingPage({ citySlug, onBackToHome, onSelectCity }: CityLandingPageProps) {
  const city: CityInfo = CITIES_DATA[citySlug] || CITIES_DATA['vilnius'];
  const [searchTerm, setSearchTerm] = useState('');
  useEffect(() => setSearchTerm(''), [citySlug]);
  const turnaround = turnaroundLabel();
  const price = priceFromLabel();
  const showLockers = BUSINESS.shipping.enabled && BUSINESS.shipping.showCityLockers;
  const [cityLockers, setCityLockers] = useState<CityLocker[]>([]);
  useEffect(() => {
    if (!showLockers) return;
    let active = true;
    void import('../data/cityLockers').then(module => {
      if (active) setCityLockers(module.CITY_LOCKERS[city.slug] ?? []);
    }).catch(() => { if (active) setCityLockers([]); });
    return () => { active = false; };
  }, [city.slug, showLockers]);

  const filteredLockers = useMemo(() => {
    if (!searchTerm.trim()) return cityLockers;
    const q = normalize(searchTerm);
    return cityLockers.filter((locker) => normalize(locker.name).includes(q) || normalize(locker.address).includes(q));
  }, [cityLockers, searchTerm]);

  const allCityKeys = Object.keys(CITIES_DATA);
  const benefits = [
    'Prieš galandimą įvertiname grandinės būklę ir pateiktus parametrus.',
    isEnabled('depthGauge') ? 'Prireikus koreguojame gylio ribotuvus.' : null,
    isEnabled('shipping') ? `Grandines galima patogiai perduoti paštomatais.` : null,
    isEnabled('freeShipping') ? `Nuo ${BUSINESS.shipping.freeShippingMinimumQuantity} vnt. grąžinimas nemokamas.` : null,
    isEnabled('guarantee') ? 'Jei rezultatas netenkins, grandinę pagaląsime pakartotinai be papildomo mokesčio.' : null,
    price ? `Vieša galandimo kaina: ${price}` : 'Tikslią kainą patvirtinsime gavę užklausą.',
  ].filter(Boolean) as string[];

  const cityFaqs = [
    isEnabled('shipping')
      ? {
          q: `Kaip perduoti grandines galandimui ${city.locative}?`,
          a: `Užpildykite užklausą ir suderinsime siuntimą. Gavę mūsų patvirtinimą, grandines galėsite išsiųsti paštomatu ${city.locative}. Siuntimą mums apmokate patys.`,
        }
      : {
          q: `Kaip užsakyti grandinių galandimą ${city.locative}?`,
          a: 'Užpildykite užklausą ir susisieksime dėl grandinių perdavimo bei darbų sąlygų.',
        },
    turnaround
      ? {
          q: 'Kiek laiko trunka galandimas?',
          a: `Galandimo ir grąžinimo terminas – ${turnaround} nuo grandinių gavimo. Tikslų terminą patvirtinsime suderindami užsakymą.`,
        }
      : null,
    {
      q: 'Kokią informaciją pateikti užklausoje?',
      a: 'Nurodykite grandinių kiekį ir, jei žinote, žingsnį, storį ar kitą ant grandinės / pjūklo nurodytą informaciją. Jei nežinote, parašykite tai žinutėje.',
    },
  ].filter(Boolean) as { q: string; a: string }[];

  return (
    <div className="w-full bg-[#0d0e12] text-white min-h-screen">
      <div className="bg-[#12141a] border-b border-white/5 py-2.5 sm:py-3 px-4 sm:px-8 sticky top-0 z-20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <Link
            to="/"
            onClick={onBackToHome}
            className="inline-flex items-center gap-1.5 text-neutral-400 hover:text-white transition-colors group cursor-pointer py-1 self-start"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Grįžti į pagrindinį puslapį</span>
          </Link>

          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 max-w-full -mx-1 px-1">
            <span className="text-neutral-500 mr-1 hidden sm:inline whitespace-nowrap">Kiti miestai:</span>
            {allCityKeys.map((slug) => {
              const c = CITIES_DATA[slug];
              const isActive = slug === city.slug;
              return (
                <Link
                  key={slug}
                  to="/miestas/$slug"
                  params={{ slug }}
                  onClick={() => onSelectCity(slug)}
                  title={`Grandinių galandimas ${c.locative}`}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                    isActive ? 'bg-[#c2410c] text-white font-bold' : 'bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {c.name}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <section className="relative py-14 sm:py-20 px-4 sm:px-8 bg-gradient-to-b from-[#161821] to-[#0d0e12] border-b border-white/5 overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-[#f95700] text-xs uppercase tracking-wider font-bold mb-4">
            <MapPin className="w-3.5 h-3.5" />
            <span>{isEnabled('shipping') ? `Siuntimas paštomatu • ` : ''}{city.region}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white font-['Montserrat',sans-serif] max-w-4xl mx-auto leading-tight">
            Grandinių galandimas {city.locative}
          </h1>

          <p className="mt-4 sm:mt-6 text-sm sm:text-lg text-neutral-300 max-w-2xl mx-auto leading-relaxed">
            {isEnabled('shipping') ? `Jei esate ${city.locative}, grandines galite atsiųsti galandimui. Tai siuntimo paslauga, o ne dirbtuvių ${city.locative} adresas.` : `Grandinių perdavimą klientams iš ${city.genitive} suderiname individualiai.`}
            {isEnabled('shipping') && ' Pirmiausia užpildykite užklausą – patvirtinsime gavėją ir tinkamą paštomatų tinklą.'}
          </p>

          {(turnaround || isEnabled('freeShipping')) && (
            <div className="mt-6 sm:mt-8 flex flex-wrap justify-center gap-3 sm:gap-4 text-xs sm:text-sm">
              {turnaround && (
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3.5 py-2 rounded-xl text-neutral-200">
                  <Truck className="w-4 h-4 text-[#f95700]" />
                  <span>Nuo gavimo: <strong>per {turnaround}</strong></span>
                </div>
              )}
              {isEnabled('freeShipping') && (
                <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-2 rounded-xl text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Nuo {BUSINESS.shipping.freeShippingMinimumQuantity} vnt. grąžinimas <strong>nemokamas</strong></span>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-12 space-y-16">
        {isEnabled('shipping') && <section className="max-w-3xl">
          <h2 className="text-xl font-bold mb-4">Siuntimas iš {city.genitive} ir aplinkinių vietovių</h2>
          <p className="text-neutral-300 leading-relaxed">Šio puslapio aptarnavimo teritorija: {city.region}. Užklausoje miestas jau parinktas – jei siunčiate iš rajono, įrašykite savo gyvenvietę. Grąžinimo vieta gali skirtis nuo išsiuntimo paštomato.</p>
          {city.slug === 'utena' && <p className="text-neutral-300 leading-relaxed mt-3">Gyvenant Anykščiuose ar Molėtuose nereikia pirmiausia vežti grandinių į Uteną. Siuntimą iš savo vietovės galima suderinti tiesiogiai; užklausoje pakeiskite miestą ir nurodykite pageidaujamą tinklą.</p>}
          <div className="flex flex-wrap gap-5 mt-5 text-orange-400 text-sm">
            <a href="/kainos" className="underline underline-offset-4">Galandimo ir grąžinimo kainos</a>
            <a href="/grandiniu-galandimas-pastomatu" className="underline underline-offset-4">Kaip veikia paslauga paštomatu</a><a href="/kaip-issiusti-grandine" className="underline underline-offset-4">Kaip supakuoti grandines</a>
          </div>
        </section>}
        {showLockers && cityLockers.length > 0 && (
          <div className="bg-[#12141a] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 font-['Montserrat',sans-serif]">
                  <MapPin className="w-5 h-5 text-[#f95700]" />
                  Omniva paštomatai {city.locative}
                </h2>
                <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                  Sąraše – {cityLockers.length} šio tinklo paštomatų. Galima tartis ir dėl kito tinklo. Tai galimos siuntimo vietos, ne mūsų dirbtuvės. Gavėjo duomenis ir grąžinimo paštomatą suderinsime po užklausos.
                </p>
              </div>

              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Ieškoti gatvės, PC, adreso..."
                  aria-label={`Ieškoti paštomato ${city.locative}`}
                  className="w-full min-h-[44px] pl-9 pr-4 py-2 bg-[#181b22] border border-white/10 rounded-xl text-base sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#f95700]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-80 overflow-y-auto pr-1 overscroll-contain">
              {filteredLockers.length > 0 ? (
                filteredLockers.map((locker) => (
                  <div key={locker.id} className="p-3.5 rounded-xl border text-left bg-[#181a22] border-white/5 flex flex-col justify-between gap-1">
                    <span className="block text-xs font-bold text-white leading-snug">{locker.name}</span>
                    <span className="text-[11px] text-neutral-400 mt-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-neutral-500 flex-shrink-0" />
                      <span>{locker.address}</span>
                    </span>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-8 text-neutral-400 text-xs">
                  {searchTerm ? `Pagal paiešką „${searchTerm}“ paštomatų nerasta.` : 'Paštomatų nerasta.'}
                </div>
              )}
            </div>

            <p className="mt-4 text-xs text-neutral-500">
              Paštomatų sąrašas gali keistis. Jei nerandate tinkamos vietos, užpildykite užklausą ir suderinsime kitą variantą.
            </p>
          </div>
        )}

        <div className="bg-[#12141a] border border-white/10 rounded-2xl p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-5 font-['Montserrat',sans-serif]">
            Ką gaunate užsakę galandimą {city.locative}
          </h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-start gap-2.5 text-neutral-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        <div id="city-order-section">
          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-white font-['Montserrat',sans-serif]">
              Užsakykite grandinių galandimą {city.locative}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1">
              Pasirinkite kiekį ir užpildykite kontaktus{BUSINESS.responseTime ? ` – susisieksime ${BUSINESS.responseTime}` : ''}
            </p>
          </div>
          <OrderCalculator defaultCity={city.name} />
        </div>

        <div className="bg-[#12141a] border border-white/10 rounded-2xl p-6 sm:p-8">
          <h2 className="text-lg sm:text-xl font-bold text-white mb-4 font-['Montserrat',sans-serif]">
            Dažniausi klausimai apie galandimą {city.locative}
          </h2>
          <div className="space-y-4">
            {cityFaqs.map((faq) => (
              <div key={faq.q} className="border-b border-white/5 pb-4 last:border-b-0 last:pb-0">
                <h3 className="text-sm font-bold text-white mb-1.5">{faq.q}</h3>
                <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


