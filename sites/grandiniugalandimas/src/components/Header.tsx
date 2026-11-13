import type { MouseEvent } from 'react';
import { isEnabled } from '@/config/business';
import { Logo } from './Logo';

interface HeaderProps {
  onGoHome?: () => void;
}

export function Header({ onGoHome }: HeaderProps) {
  const handleLogoClick = (e: MouseEvent) => {
    if (onGoHome) {
      e.preventDefault();
      onGoHome();
    }
  };

  return (
    <header className="absolute top-0 left-0 right-0 z-30 w-full py-3.5 sm:py-5 px-3 sm:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        <a
          href="/"
          onClick={handleLogoClick}
          aria-label="Grandinių Galandimas - pradinis puslapis"
          className="focus:outline-none transition-transform hover:scale-102 flex-shrink-0"
        >
          <Logo />
        </a>

        <a href="/#uzsakyti" className="lg:hidden rounded-lg bg-[#c2410c] px-3 py-2.5 text-xs font-bold">Užklausa</a>
        {/* Desktop Quick Nav Links */}
        <nav className="hidden lg:flex items-center gap-4 lg:gap-6 text-xs font-semibold uppercase tracking-wider text-neutral-300 font-['Montserrat',sans-serif]">
          <a
            href={isEnabled("shipping") ? "/grandiniu-galandimas-pastomatu" : "/#kaip-veikia"}
            className="hover:text-[#f95700] transition-colors py-1"
          >
            Siuntimas
          </a>
          <a
            href="/kainos"
            className="hover:text-[#f95700] transition-colors py-1"
          >
            Kainos
          </a>
          <a
            href="/#uzsakyti"
            className="hover:text-[#f95700] transition-colors py-1"
          >
            Užsakyti galandimą
          </a>
          <a
            href="/#diagnostika"
            className="hover:text-[#f95700] transition-colors py-1"
          >
            Būklės testas
          </a>
          <a
            href="/#atsiliepimai"
            className="hover:text-[#f95700] transition-colors py-1"
          >
            Kodėl mes
          </a>
          <a
            href="/#duk"
            className="hover:text-[#f95700] transition-colors py-1"
          >
            DUK
          </a>
        </nav>

      </div>
    </header>
  );
}

