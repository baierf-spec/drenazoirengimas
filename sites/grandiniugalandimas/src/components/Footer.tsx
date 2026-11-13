import type { MouseEvent } from 'react';
import { Mail, MapPin, Phone } from 'lucide-react';
import { BUSINESS, isEnabled } from '../config/business';
import { Link } from './Link';
import { contentNavigation } from '@/lib/content-navigation';
import { Logo } from './Logo';
import { telHref, trackContact, useLeadhub } from '@/lib/leadhub-client';
import { CITIES_DATA } from '../data/citiesData';

interface FooterProps {
  onOpenTerms?: () => void;
  onSelectCity?: (slug: string) => void;
}

export function Footer({ onOpenTerms, onSelectCity }: FooterProps) {
  const { tenant } = useLeadhub();
  const s = BUSINESS.shipping;
  const social = BUSINESS.social;
  const scrollTo = (id: string) => (e: MouseEvent) => {
    const el = document.getElementById(id);
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="w-full bg-[#08090b] text-neutral-400 pt-12 sm:pt-16 pb-8 sm:pb-10 px-4 sm:px-8 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 sm:gap-10 mb-10 sm:mb-14">
          {/* Col 1: Brand & Logo */}
          <div className="sm:col-span-2 lg:col-span-3">
            <Logo />
            <p className="mt-3.5 text-xs sm:text-sm text-neutral-400 max-w-sm leading-relaxed">
              Preciziškas pjūklų grandinių galandimas staklėmis{isEnabled('nationwide') ? ' visoje Lietuvoje' : ''}{s.enabled ? ` paštomatais` : ''}.
            </p>
          </div>

          {/* Col 2: INFORMACIJA */}
          <div className="lg:col-span-3">
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white mb-3 sm:mb-4 font-['Montserrat',sans-serif]">
              Informacija & Gidai
            </h2>
            <ul className="space-y-2 text-xs sm:text-sm">
              {contentNavigation().map(p => <li key={p.slug}><a href={`/${p.slug}`} className="hover:text-white py-1 inline-block">{p.label}</a></li>)}
              <li>
                <a
                  href="/#uzsakyti"
                  onClick={scrollTo('uzsakyti')}
                  className="hover:text-white transition-colors py-0.5 inline-block"
                >
                  Užsakyti galandimą
                </a>
              </li>
              <li>
                <a
                  href="/#skaiciuokle"
                  onClick={scrollTo('skaiciuokle')}
                  className="hover:text-white transition-colors py-0.5 inline-block text-emerald-400 font-medium"
                >
                  Sutaupymo skaičiuoklė
                </a>
              </li>
              <li>
                <a
                  href="/#diagnostika"
                  onClick={scrollTo('diagnostika')}
                  className="hover:text-white transition-colors py-0.5 inline-block text-orange-400 font-medium"
                >
                  Grandinės būklės testas
                </a>
              </li>
              <li>
                <a
                  href="/#gidas"
                  onClick={scrollTo('gidas')}
                  className="hover:text-white transition-colors py-0.5 inline-block"
                >
                  Grandinių parametrų gidas
                </a>
              </li>
              <li>
                <a
                  href="/#atsiliepimai"
                  onClick={scrollTo('atsiliepimai')}
                  className="hover:text-white transition-colors py-0.5 inline-block"
                >
                  Kodėl pasitikėti
                </a>
              </li>
              <li>
                <a
                  href="/#kaip-veikia"
                  onClick={scrollTo('kaip-veikia')}
                  className="hover:text-white transition-colors py-0.5 inline-block"
                >
                  Kaip tai veikia?
                </a>
              </li>
              <li>
                <a
                  href="/#duk"
                  onClick={scrollTo('duk')}
                  className="hover:text-white transition-colors py-0.5 inline-block"
                >
                  DUK
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: MIESTAI (Local SEO) */}
          <div className="lg:col-span-3">
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white mb-3 sm:mb-4 font-['Montserrat',sans-serif]">
              Galandimas Miestuose
            </h2>
            <ul className="space-y-2 text-xs sm:text-sm">
              {Object.values(CITIES_DATA).map((c) => (
                <li key={c.slug}>
                  <Link
                    to="/miestas/$slug"
                    params={{ slug: c.slug }}
                    onClick={() => onSelectCity?.(c.slug)}
                    className="block transition-colors py-0.5 text-left text-neutral-400 hover:text-orange-400"
                  >
                    Grandinių galandimas {c.locative}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: KONTAKTAI & SEKITE */}
          <div id="kontaktai" className="lg:col-span-3 scroll-mt-10">
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white mb-3 sm:mb-4 font-['Montserrat',sans-serif]">
              Kontaktai
            </h2>
            <ul className="space-y-2.5 text-xs sm:text-sm mb-4">
              {/* Kontaktai rodomi tik kol svetainė išnuomota (LeadHub); kitaip – tik užklausos forma. */}
              {tenant?.company_name && <li className="font-bold text-white">{tenant.company_name}</li>}
              {tenant?.email && (
                <li className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-[#f95700] flex-shrink-0" />
                  <a href={`mailto:${tenant.email}`} onClick={() => trackContact('email_click')} className="hover:text-white transition-colors py-0.5 break-all">
                    {tenant.email}
                  </a>
                </li>
              )}
              {tenant?.phone && (
                <li className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-[#f95700] flex-shrink-0" />
                  <a href={telHref(tenant.phone)} onClick={() => trackContact('phone_click')} className="hover:text-white transition-colors py-0.5">
                    {tenant.phone}
                  </a>
                </li>
              )}
              <li className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-[#f95700] flex-shrink-0" />
                <span>{tenant?.address || BUSINESS.address || (isEnabled('nationwide') ? `Visoje Lietuvoje${s.enabled ? ` paštomatais` : ''}` : BUSINESS.city)}</span>
              </li>
              {!tenant && (
                <li>
                  <a href="/#uzsakyti" className="font-bold text-orange-400 hover:text-white">Pateikti užklausą</a>
                </li>
              )}
            </ul>

            {(social.facebook || social.instagram) && (
            <div className="pt-2">
              <div className="text-xs font-bold uppercase tracking-wider text-white mb-2 font-['Montserrat',sans-serif]">
                Sekite mus
              </div>
              <div className="flex items-center gap-3">
                {social.facebook && (
                <a
                  href={social.facebook}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Facebook"
                  className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-[#c2410c] text-white flex items-center justify-center transition-colors"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                  </svg>
                </a>
                )}
                {social.instagram && (
                <a
                  href={social.instagram}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                  className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-[#c2410c] text-white flex items-center justify-center transition-colors"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                )}
              </div>
            </div>
            )}
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="pt-6 sm:pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-400 gap-3 sm:gap-4 text-center sm:text-left">
          <p>© {new Date().getFullYear()} {BUSINESS.legalBusinessName || BUSINESS.businessName}. Visos teisės saugomos.</p>
          <div className="flex items-center gap-6">
            <Link to="/privatumo-politika" className="hover:text-white transition-colors py-1 text-xs text-neutral-400">
              Privatumo politika
            </Link>
            {onOpenTerms && <button
              type="button"
              onClick={onOpenTerms}
              className="hover:text-white transition-colors py-1 text-xs text-neutral-400"
            >
              Taisyklės
            </button>}
          </div>
        </div>
      </div>
    </footer>
  );
}


