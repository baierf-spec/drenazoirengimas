import { Truck, Clock, ShieldCheck, Ruler } from 'lucide-react';
import type { ReactNode } from 'react';
import { isEnabled, turnaroundLabel } from '../config/business';

export function TrustBar() {
  const t = turnaroundLabel();
  const benefits: { id: string; icon: ReactNode; text: string; show: boolean }[] = [
    {
      id: 'shipping',
      icon: <Truck className="w-8 h-8 text-[#f95700] stroke-[1.8]" />,
      text: isEnabled('nationwide')
        ? `Siuntimas paštomatais visoje Lietuvoje`
        : `Siuntimas paštomatais`,
      show: isEnabled('shipping'),
    },
    {
      id: 'speed',
      icon: <Clock className="w-8 h-8 text-[#f95700] stroke-[1.8]" />,
      text: `Galandimas ir grąžinimas per ${t ?? ''} nuo gavimo`,
      show: t !== null,
    },
    {
      id: 'quality',
      icon: <ShieldCheck className="w-8 h-8 text-[#f95700] stroke-[1.8]" />,
      text: 'Nepatiks – pagaląsime iš naujo nemokamai',
      show: isEnabled('guarantee'),
    },
    {
      id: 'precision',
      icon: <Ruler className="w-8 h-8 text-[#f95700] stroke-[1.8]" />,
      text: 'Profesionalus galandimas pagal grandinės parametrus',
      show: true,
    },
  ];
  const shown = benefits.filter((b) => b.show);
  const cols = shown.length >= 4 ? 'lg:grid-cols-4' : shown.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2';

  return (
    <section className="w-full py-10 sm:py-12 px-4 sm:px-8 bg-[#121419] border-t border-neutral-800">
      <div className="max-w-6xl mx-auto">
        <div className={`grid grid-cols-1 xs:grid-cols-2 ${cols} gap-5 sm:gap-6`}>
          {shown.map((item) => (
            <div key={item.id} className="flex items-center gap-3.5 sm:gap-4">
              <div className="flex-shrink-0">{item.icon}</div>
              <span className="text-xs sm:text-sm lg:text-base font-semibold text-neutral-200 leading-snug">
                {item.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

