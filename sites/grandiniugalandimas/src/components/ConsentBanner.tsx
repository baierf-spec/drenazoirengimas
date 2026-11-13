import { useEffect, useState } from 'react';
import { Link } from './Link';
import { GA_ID, getConsent, loadAnalytics, setConsent, type ConsentValue } from '../lib/analytics';

/**
 * Slapukų sutikimas rodomas TIK kai business.ts nustatytas analytics.measurementId.
 * Be analitikos ID nieko nekraunama ir juosta nerodoma.
 */
export function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!GA_ID) return;
    const consent = getConsent();
    if (consent === 'granted') loadAnalytics();
    else if (!consent) setVisible(true);
  }, []);

  if (!GA_ID || !visible) return null;

  const choose = (value: ConsentValue) => {
    setConsent(value);
    setVisible(false);
    if (value === 'granted') loadAnalytics();
  };

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 p-3 sm:p-4">
      <div className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-[#15171d]/95 backdrop-blur p-4 sm:p-5 shadow-2xl">
        <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
          Su jūsų sutikimu naudojame Google Analytics lankomumo statistikai.{' '}
          <Link to="/privatumo-politika" className="underline underline-offset-2">
            Daugiau
          </Link>
        </p>
        <div className="mt-3 flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => choose('granted')}
            className="flex-1 min-h-[44px] rounded-xl bg-[#c2410c] hover:bg-[#9a3412] text-white font-bold text-xs uppercase tracking-wider transition-colors"
          >
            Sutinku
          </button>
          <button
            onClick={() => choose('denied')}
            className="flex-1 min-h-[44px] rounded-xl border border-white/15 text-neutral-200 hover:bg-white/5 font-semibold text-xs uppercase tracking-wider transition-colors"
          >
            Atsisakyti
          </button>
        </div>
      </div>
    </div>
  );
}

