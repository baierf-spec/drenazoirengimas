import { contentNavigation } from '@/lib/content-navigation';

export function ServiceLinks() {
  return <section aria-labelledby="service-guides-heading" className="px-4 sm:px-8 py-10 border-y border-white/10 bg-[#12141a]">
    <div className="max-w-6xl mx-auto"><h2 id="service-guides-heading" className="font-bold text-xl mb-5">Kaina, siuntimas ir grandinės būklė</h2>
      <div className="flex flex-wrap gap-3">{contentNavigation().map(p => <a key={p.slug} href={`/${p.slug}`} className="rounded-xl border border-white/15 px-4 py-3 text-sm text-neutral-200 hover:border-orange-500 hover:text-orange-400 transition-colors">{p.label} <span aria-hidden="true">→</span></a>)}</div>
    </div>
  </section>;
}
