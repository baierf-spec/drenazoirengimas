import { BUSINESS, formatEur, quote, isEnabled } from '@/config/business';
import { getServicePages, type ServicePage } from '@/data/servicePages';
import { SITE, schemaBusiness, schemaOffer } from '@/lib/site';

export function contentHead(page: ServicePage) {
  const url = `${SITE.url}/${page.slug}`;
  return {
    meta: [
      { title: page.title }, { name: 'description', content: page.description },
      { property: 'og:title', content: page.title }, { property: 'og:description', content: page.description },
      { property: 'og:url', content: url }, { property: 'og:type', content: 'website' },
      { property: 'og:locale', content: 'lt_LT' }, { property: 'og:image', content: SITE.ogImage },
      { name: 'twitter:card', content: 'summary_large_image' }, { name: 'twitter:image', content: SITE.ogImage },
    ],
    links: [{ rel: 'canonical', href: url }],
    scripts: [{ type: 'application/ld+json', children: JSON.stringify({
      '@context': 'https://schema.org', '@graph': [schemaBusiness(),
        { '@type': 'WebPage', '@id': url, url, name: page.h1, description: page.description, inLanguage: 'lt', about: { '@id': `${SITE.url}/#service` } },
        ...(page.kind === 'service' || page.kind === 'pricing' ? [{ '@type': 'Service', '@id': `${SITE.url}/#service`, name: 'Pjūklų grandinių galandimas', url: `${SITE.url}/`, provider: { '@id': `${SITE.url}/#business` }, areaServed: { '@type': 'Country', name: BUSINESS.serviceArea }, ...(schemaOffer() ? { offers: schemaOffer() } : {}) }] : []),
        { '@type': 'BreadcrumbList', itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Pradžia', item: `${SITE.url}/` },
          { '@type': 'ListItem', position: 2, name: page.label, item: url },
        ] },
      ],
    }).replaceAll('<', '\\u003c') }],
  };
}

export function PricingExamples() {
  if (BUSINESS.pricing.mode === 'hidden') return null;
  const quantities = [...new Set([1, 2, 3, 4, 5, 10, ...BUSINESS.pricing.tiers.map(t => t.quantity)])].sort((a, b) => a - b);
  return <div className="my-8 overflow-x-auto rounded-2xl border border-white/15">
    <table className="w-full min-w-[480px] text-left text-sm">
      <caption className="p-4 text-left text-neutral-300 bg-white/5">{isEnabled('shipping') ? 'Galandimas ir grąžinimas pagal kiekį. Siunta mums mokama atskirai.' : 'Galandimo kaina pagal kiekį.'}</caption>
      <thead className="bg-white/10 text-white"><tr><th scope="col" className="p-4">Kiekis</th><th scope="col" className="p-4">Galandimas</th>{isEnabled('shipping') && <th scope="col" className="p-4">Grąžinimas</th>}<th scope="col" className="p-4">Suma mums</th></tr></thead>
      <tbody>{quantities.map(q => { const value = quote(q); if (!value) return null; return <tr key={q} className="border-t border-white/10"><th scope="row" className="p-4 font-medium">{q} vnt.</th><td className="p-4">{value.approximate && 'iki '}{formatEur(value.chainPrice)}</td>{isEnabled('shipping') && <td className="p-4">{formatEur(value.shippingPrice)}</td>}<td className="p-4 text-orange-400 font-bold">{value.approximate && 'iki '}{formatEur(value.total)}</td></tr>; })}</tbody>
    </table>
  </div>;
}

export function ServiceContentPage({ page }: { page: ServicePage }) {
  const related = getServicePages().filter(p => p.slug !== page.slug);
  return <>
    <article className="pt-28 sm:pt-36 pb-16 px-4 sm:px-8 max-w-6xl mx-auto">
      <nav aria-label="Puslapio vieta" className="text-sm text-neutral-400 mb-8"><a href="/" className="hover:text-white">Pradžia</a><span aria-hidden="true" className="mx-3">/</span><span>{page.label}</span></nav>
      <div className="grid lg:grid-cols-[minmax(0,1fr)_260px] gap-10 lg:gap-14">
        <div className="min-w-0">
          <p className="uppercase text-orange-400 font-bold tracking-widest text-xs mb-4">{page.kind === 'guide' ? 'Praktinis gidas' : 'Paslauga ir sąlygos'}</p>
          <h1 className="font-['Montserrat',sans-serif] font-extrabold text-3xl sm:text-5xl leading-tight tracking-tight">{page.h1}</h1>
          <p className="text-lg text-neutral-200 leading-relaxed mt-6">{page.intro}</p>
          <a href="/#uzsakyti" className="inline-flex bg-[#c2410c] hover:bg-[#9a3412] text-white font-bold rounded-xl px-6 py-4 mt-7">{BUSINESS.ordersPaused ? 'Peržiūrėti užklausų informaciją' : 'Užsakyti galandimą'}</a>
          {page.kind === 'guide' && isEnabled('shipping') && <p className="mt-6 text-neutral-300 leading-relaxed">Jei grandinė tinkama galąsti, <a href="/grandiniu-galandimas-pastomatu" className="text-orange-400 underline underline-offset-4">galite ją atsiųsti galandimui paštomatu</a>. Prieš siųsdami peržiūrėkite <a href="/kainos" className="text-orange-400 underline underline-offset-4">galandimo ir grąžinimo kainas</a>.</p>}
          {page.kind === 'pricing' && <PricingExamples />}
          <nav aria-label="Šiame puslapyje" className="my-9 border-y border-white/10 py-5 flex flex-wrap gap-x-5 gap-y-3 text-sm text-orange-400">{page.sections.map(s => <a key={s.id} href={`#${s.id}`} className="underline underline-offset-4">{s.title}</a>)}</nav>
          {page.sections.map(section => <section key={section.id} id={section.id} className="mt-10 scroll-mt-8">
            <h2 className="text-xl sm:text-2xl font-bold font-['Montserrat',sans-serif] mb-4">{section.title}</h2>
            {section.paragraphs?.map(p => <p key={p} className="text-neutral-300 leading-relaxed mt-4">{p}</p>)}
            {section.steps && <ol className="space-y-4 mt-5">{section.steps.map((step, index) => <li key={step} className="flex gap-4 text-neutral-300 leading-relaxed"><span aria-hidden="true" className="flex-shrink-0 h-7 w-7 flex items-center justify-center rounded-full bg-orange-500/15 text-orange-400 text-sm font-bold">{index + 1}</span><span>{step}</span></li>)}</ol>}
          </section>)}
          {page.sources && <section className="mt-10 border-t border-white/10 pt-6 text-sm text-neutral-400"><h2 className="font-bold text-white mb-3">Gamintojų informacija</h2><p>Konkrečios grandinės ribas ir priežiūrą tikrinkite jos gamintojo instrukcijoje.</p><ul className="mt-3 space-y-2">{page.sources.map(s => <li key={s.url}><a href={s.url} className="underline underline-offset-4 hover:text-white">{s.label}</a></li>)}</ul></section>}
          <div className="mt-12 p-6 sm:p-8 rounded-2xl bg-[#181b22] border border-orange-500/30"><h2 className="text-2xl font-bold">Pradėkime nuo jūsų grandinių</h2><p className="text-neutral-300 mt-3">Nurodykite kiekį ir būklę. Pirmiausia suderinsime kainą bei perdavimą. Grandinių dar nesiųskite.</p><a href="/#uzsakyti" className="inline-flex bg-[#c2410c] text-white font-bold px-6 py-3 rounded-xl mt-5">{BUSINESS.ordersPaused ? 'Peržiūrėti užklausų informaciją' : 'Užsakyti galandimą'}</a></div>
        </div>
        <aside className="lg:pt-2"><div className="lg:sticky lg:top-8 rounded-2xl bg-white/5 border border-white/10 p-5"><h2 className="font-bold mb-4">Prieš siunčiant</h2><ul className="space-y-4 text-sm">{related.map(p => <li key={p.slug}><a href={`/${p.slug}`} className="text-neutral-300 hover:text-orange-400 underline underline-offset-4">{p.label}</a></li>)}</ul><a href="/#skaiciuokle" className="block mt-5 pt-5 border-t border-white/10 text-orange-400 text-sm">Palyginti su naujos grandinės kaina</a></div></aside>
      </div>
    </article>
  </>;
}
