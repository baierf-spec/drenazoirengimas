import { X, FileText } from 'lucide-react';
import { BUSINESS } from '../config/business';

interface LegalModalProps {
  type: 'terms' | null;
  onClose: () => void;
}

export function LegalModals({ type, onClose }: LegalModalProps) {
  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#13151b] text-neutral-200 rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-white/10 relative max-h-[85vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Uždaryti"
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 text-[#f95700] flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white font-['Montserrat',sans-serif]">
                  Paslaugų Teikimo Taisyklės
                </h3>
                <p className="text-xs text-neutral-400">Paskutinį kartą atnaujinta: 2026 m.</p>
              </div>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-neutral-300 leading-relaxed">
              <h4 className="font-bold text-white text-sm">Bendrosios nuostatos</h4>
              <p>
                Šios taisyklės reglamentuoja grandininių pjūklų grandinių galandimo paslaugos užsakymo, siuntimo ir grąžinimo tvarką.
              </p>

              <h4 className="font-bold text-white text-sm">Siuntimas ir pakavimas</h4>
              <p>
                Klientas įsipareigoja grandines supakuoti saugiai (kiekvieną apsaugoti popieriumi ar kartonu ir įdėti į tvirtą dėžutę), kad aštrūs dantukai nepažeistų siuntos pakuotės transportavimo metu. {BUSINESS.shipping.enabled ? `Grandines siųskite paštomatu tik suderinę gavėjo duomenis. Siuntimą mums klientas užsako ir apmoka vežėjui atskirai; jis neįtrauktas į svetainėje rodomą sumą.` : ''}
              </p>

              {BUSINESS.shipping.enabled && <p>Grąžinimo kaina įtraukiama į užklausos suvestinę. {BUSINESS.shipping.freeShippingEnabled ? `Nuo ${BUSINESS.shipping.freeShippingMinimumQuantity} grandinių grąžinimas klientui nemokamas.` : ''} Grąžinimo paštomatą suderiname atskirai.</p>}
              <p>Formos pateikimas yra užklausa. Galutinę kainą, grandinių tinkamumą ir perdavimo sąlygas patvirtiname susisiekę prieš darbą.</p>
              {BUSINESS.claims.sharpeningGuarantee && (
                <>
                  <h4 className="font-bold text-white text-sm">Kokybės garantija</h4>
                  <p>
                    Jeigu pagaląsta grandinė pjauna netolygiai, ją pagaląsime iš naujo nemokamai.
                  </p>
                </>
              )}

              <h4 className="font-bold text-white text-sm">Kritiškai nusidėvėjusios grandinės</h4>
              <p>
                Jei meistras įvertina, kad grandinė yra pasiekusi kritinę nusidėvėjimo ribą (gamintojo nusidėvėjimo žymą) arba turi trūkusių narelių, apie tai klientas informuojamas telefonu arba el. paštu prieš pradedant darbus.
              </p>
            </div>
          </div>


        <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-6 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs uppercase tracking-wider transition-colors"
          >
            Uždaryti
          </button>
        </div>
      </div>
    </div>
  );
}


