import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import { BUSINESS } from '@/config/business';
import { telHref, trackContact, useLeadhub } from '@/lib/leadhub-client';

/**
 * Kas galanda grandines. Kol svetainė išnuomota – nuomininko kortelė ir darbų nuotraukos iš LeadHub;
 * kitaip – tik tikri savininko duomenys iš konfigūracijos (jei jų nėra, sekcija nerodoma).
 */
export function OperatorDetails() {
  const { tenant, gallery } = useLeadhub();
  if (tenant) {
    return <section id="teikejas" className="px-4 sm:px-8 py-14 border-t border-white/10">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold mb-5">Kas galanda jūsų grandines</h2>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
          <div>
            <p className="text-lg font-bold">{tenant.company_name}</p>
            {tenant.about && <p className="text-neutral-300 leading-relaxed mt-3 whitespace-pre-line">{tenant.about}</p>}
            <ul className="mt-5 space-y-2.5 text-sm">
              {tenant.phone && <li><a href={telHref(tenant.phone)} onClick={() => trackContact('phone_click')} className="inline-flex min-h-11 items-center gap-2.5 font-bold text-white hover:text-orange-400"><Phone className="w-4 h-4 text-[#f95700]" />{tenant.phone}</a></li>}
              {tenant.email && <li><a href={`mailto:${tenant.email}`} onClick={() => trackContact('email_click')} className="inline-flex min-h-11 items-center gap-2.5 hover:text-white break-all"><Mail className="w-4 h-4 text-[#f95700]" />{tenant.email}</a></li>}
              {tenant.hours && <li className="flex items-center gap-2.5 text-neutral-300"><Clock className="w-4 h-4 text-[#f95700]" />{tenant.hours}</li>}
              {tenant.address && <li className="flex items-center gap-2.5 text-neutral-300"><MapPin className="w-4 h-4 text-[#f95700]" />{tenant.address}</li>}
            </ul>
            {(tenant.company_code || tenant.vat_code) && <p className="text-xs text-neutral-500 mt-4">{[tenant.company_code && `Įm. k. ${tenant.company_code}`, tenant.vat_code && `PVM k. ${tenant.vat_code}`].filter(Boolean).join(' · ')}</p>}
          </div>
          {gallery.length > 0 && <ul className="grid grid-cols-2 lg:grid-cols-3 gap-4">{gallery.map(p => <li key={p.id}><figure><img src={p.src} srcSet={p.srcSet} sizes="(min-width: 1024px) 240px, 50vw" alt={p.caption || 'Atliktas darbas'} loading="lazy" decoding="async" className="w-full aspect-[4/3] object-cover rounded-xl" />{p.caption && <figcaption className="text-sm text-neutral-400 mt-2">{p.caption}</figcaption>}</figure></li>)}</ul>}
        </div>
      </div>
    </section>;
  }
  const b = BUSINESS;
  const photos = b.workshopPhotos.filter(p => p.src && p.alt);
  if (!b.operatorName && !b.legalBusinessName && !b.address && !photos.length) return null;
  return <section className="px-4 sm:px-8 py-14 border-t border-white/10">
    <div className="max-w-6xl mx-auto"><h2 className="text-2xl font-bold mb-5">Kas galanda jūsų grandines</h2>
      {b.operatorName && <p className="text-lg font-bold">{b.operatorName}</p>}
      {b.legalBusinessName && <p className="text-neutral-300 mt-2">{b.legalBusinessName}{b.companyCode ? `, kodas ${b.companyCode}` : ''}</p>}
      {b.operatorBio && <p className="text-neutral-300 leading-relaxed max-w-3xl mt-4">{b.operatorBio}</p>}
      {b.address && <p className="text-neutral-300 mt-4">{b.address}. Prieš vykdami suderinkite priėmimą.</p>}
      {photos.length > 0 && <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">{photos.map(photo => <figure key={photo.src}><img src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} loading="lazy" decoding="async" className="w-full h-auto rounded-xl" /><figcaption className="text-sm text-neutral-400 mt-2">{photo.alt}</figcaption></figure>)}</div>}
    </div>
  </section>;
}
