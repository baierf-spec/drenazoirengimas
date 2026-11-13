import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { BUSINESS, formatEur, isEnabled, turnaroundLabel, getPriceRange } from '../config/business';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

function priceAnswer(): string {
  const p = BUSINESS.pricing;
  const s = BUSINESS.shipping;
  const free = isEnabled('freeShipping')
    ? ` Nuo ${s.freeShippingMinimumQuantity} vnt. grąžinimas nemokamas.`
    : '';
  const ship = s.enabled ? ` Grąžinimas jums – ${formatEur(s.price)}${s.priceForTwo != null ? ` (2 vnt. – ${formatEur(s.priceForTwo)})` : ''}. Siuntimą mums klientas apmoka vežėjui atskirai.` : '';
  if (p.mode === 'tiers') {
    const sorted = [...p.tiers].sort((a, b) => a.quantity - b.quantity);
    const parts = sorted
      .filter((t, i) => i === 0 || t.popular || i === sorted.length - 1)
      .map((t) => `${t.quantity} vnt. – po ${formatEur(t.total / t.quantity)}`);
    return `Kaina priklauso nuo kiekio: ${parts.join(', ')}.${ship}${free}`;
  }
  const r = getPriceRange();
  if (p.mode === 'fixed' && r) return `Vienos grandinės galandimas kainuoja ${formatEur(r.low)}.${ship}${free}`;
  if (p.mode === 'range' && r)
    return `Galandimo kaina – nuo ${formatEur(r.low)} iki ${formatEur(r.high)} už grandinę, priklausomai nuo grandinės tipo ir kiekio.${ship}${free}`;
  return 'Kaina priklauso nuo grandinių tipo ir kiekio. Užpildykite užklausą – atsakysime su tikslia kaina.';
}

export function getFaqs(): FaqItem[] {
  const s = BUSINESS.shipping;
  const t = turnaroundLabel();
  const items: (FaqItem | false)[] = [
    s.enabled && {
      id: 'packing',
      question: `Kaip saugiai supakuoti grandines siuntimui per paštomatą?`,
      answer: `Grandines suvyniokite į tvirtą popierių, kartoną ar burbulinę plėvelę, kad aštrūs dantukai nepradurtų pakuotės, ir įdėkite į tvirtą nedidelę dėžutę. Gavėjo duomenis pateiksime suderinę užklausą. Siuntą mums užsakote ir apmokate patys paštomatu. Grandinių nesiųskite, kol nepatvirtinome gavėjo duomenų.`,
    },
    t !== null && {
      id: 'timeline',
      question: 'Kiek laiko trunka grandinių galandimas?',
      answer: s.enabled
        ? `Galandimas ir grąžinimas paprastai užtrunka ${t} nuo grandinių gavimo. Siuntimo mums laikas į šį terminą neįtrauktas. Tikslų terminą patvirtinsime suderindami užsakymą.`
        : `Grandines paprastai pagalandame per ${t}. Tikslų terminą patvirtinsime suderindami užsakymą.`,
    },
    s.enabled && {
      id: 'carrier',
      question: 'Ar galiu siųsti per kitą paštomatų tinklą ar kitu būdu?',
      answer: 'Paštomatų tinklą ir gavėjo duomenis suderiname prieš išsiunčiant grandines. Jei patogiau siųsti per LP EXPRESS, DPD, Omniva ar kitu būdu, nurodykite tai užklausoje. Galimybę ir grąžinimo sąlygas patvirtinsime susisiekę.',
    },
    s.enabled && {
      id: 'shipping-cost',
      question: 'Kas apmoka siuntimą?',
      answer: `Siuntimą mums užsakote ir apmokate vežėjui patys. Svetainės suma apima galandimą ir grąžinimą jums.${isEnabled('freeShipping') ? ` Nuo ${s.freeShippingMinimumQuantity} grandinių grąžinimas jums nemokamas.` : ''} Grąžinimo paštomatą suderinsime susisiekę.`,
    },
    {
      id: 'price',
      question: 'Kokia yra pjūklo grandinės galandimo kaina?',
      answer: priceAnswer(),
    },
    {
      id: 'wear',
      question: 'Ką daryti, jei grandinė per daug nusidėvėjusi?',
      answer:
        'Prieš galandimą įvertiname grandinės būklę. Jei dantukai pasiekė gamintojo nusidėvėjimo žymą arba grandinė turi trūkusių narelių, susisieksime su jumis prieš atlikdami darbą ir pasiūlysime sprendimą.',
    },
    {
      id: 'types',
      question: 'Kokias grandines galandate?',
      answer: [
        'Galandame standartines benzininių ir elektrinių pjūklų grandines. Konkretų žingsnį ir grandinės tipą patiksliname pagal jūsų pateiktą informaciją.',
        isEnabled('carbide') && 'Taip pat galandame kietlydinio (karbido) grandines.',
        isEnabled('ripping') && 'Priimame ir išilginio pjovimo grandines.',
        'Jei turite nestandartinę grandinę – parašykite užklausoje, patikslinsime.',
      ]
        .filter(Boolean)
        .join(' '),
    },
  ];
  return items.filter(Boolean) as FaqItem[];
}

export function Faq() {
  const faqs = getFaqs();
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id ?? null);

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section id="duk" className="w-full py-14 sm:py-20 px-4 sm:px-8 bg-[#f4f5f8] text-neutral-900 scroll-mt-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-wide text-neutral-900 font-['Montserrat',sans-serif]">
            Dažniausiai užduodami klausimai
          </h2>
          <div className="w-16 h-1 bg-[#c2410c] mx-auto mt-2.5 sm:mt-3 rounded-full" />
        </div>

        <div className="space-y-3 sm:space-y-4">
          {faqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className="bg-white rounded-xl border border-neutral-200/90 overflow-hidden shadow-xs transition-shadow hover:shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => toggle(faq.id)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${faq.id}`}
                  className="w-full py-4 sm:py-4.5 px-4 sm:px-6 text-left flex items-center justify-between gap-3 sm:gap-4 cursor-pointer select-none"
                >
                  <span className="font-bold text-neutral-800 text-sm sm:text-lg pr-1 sm:pr-2 leading-snug">
                    {faq.question}
                  </span>
                  <div className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0 flex items-center justify-center text-[#f95700]">
                    {isOpen ? <Minus className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" /> : <Plus className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />}
                  </div>
                </button>

                {
                  <div hidden={!isOpen} id={`faq-answer-${faq.id}`} className="px-4 sm:px-6 pb-4 sm:pb-5 pt-1 text-neutral-600 text-xs sm:text-base leading-relaxed border-t border-neutral-100">
                    <p>{faq.answer}</p>
                  </div>
                }
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}


