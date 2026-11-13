import { useState, useEffect, useRef, type FormEvent } from 'react';
import { Link } from './Link';
import { ChevronRight, Lock, Clock, CheckCircle, Loader2 } from 'lucide-react';
import {
  BUSINESS,
  formatEur,
  isEnabled,
  isFreeShipping,
  quantityOptions,
  quote,
  inboundShippingLabel,
  normalizeQuantity,
} from '../config/business';
import { gaHeaders, trackConfirmedLead } from '../lib/analytics';
import { leadSchema } from '../lib/lead/schema';

interface OrderCalculatorProps {
  initialQuantity?: number;
  selectionVersion?: number;
  /** Miesto puslapyje – iš anksto įrašomas miestas. */
  defaultCity?: string;
}

const inputCls =
  'w-full min-h-[44px] px-3.5 py-2.5 rounded-lg border border-neutral-300 focus:border-[#f95700] focus:ring-2 focus:ring-[#f95700]/20 text-neutral-800 text-base sm:text-sm outline-none transition-colors disabled:bg-neutral-100';

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:grid sm:grid-cols-[140px_1fr] sm:items-start sm:gap-3">
      <label htmlFor={id} className="text-xs sm:text-sm font-semibold text-neutral-700 mb-1 sm:mb-0 sm:pt-3">
        {label}
      </label>
      <div>
        {children}
        {error && <p role="alert" className="text-xs text-rose-500 mt-1">{error}</p>}
      </div>
    </div>
  );
}

export function OrderCalculator({ initialQuantity, selectionVersion, defaultCity = '' }: OrderCalculatorProps) {
  const options = quantityOptions();
  const popular = options.find((o) => o.popular)?.quantity;
  const [selectedCount, setSelectedCount] = useState<number>(popular ?? options[0]?.quantity ?? 1);
  const [form, setForm] = useState({
    name: '',
    phone: '+370 ',
    email: '',
    city: defaultCity,
    chainInfo: '',
    message: '',
    website: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  // One id per enquiry: a double click or a retry after a network error is delivered once.
  const requestId = useRef(typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : '00000000-0000-4000-8000-000000000000');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [serverError, setServerError] = useState<string | null>(null);

  const paused = BUSINESS.ordersPaused;
  const s = BUSINESS.shipping;

  useEffect(() => {
    if (!initialQuantity) return;
    setSelectedCount(normalizeQuantity(initialQuantity));
    setStatus('idle');
  }, [initialQuantity, selectionVersion]);

  useEffect(() => { setForm((f) => ({ ...f, city: defaultCity })); }, [defaultCity]);

  const q = quote(selectedCount);
  const set = (k: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (paused || status === 'sending' || status === 'sent') return;

    const payload = {
      ...form,
      phone: form.phone.replace(/\D/g, '').length > 3 ? form.phone : '',
      quantity: selectedCount,
      estimatedTotal: q ? q.total : null,
      pageUrl: typeof window !== 'undefined' ? window.location.href : '',
    };
    const parsed = leadSchema.safeParse(payload);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? 'form');
        if (!errs[key]) errs[key] = issue.message;
      }
      setErrors(errs);
      const field = Object.keys(errs)[0];
      document.getElementById(field === "chainInfo" ? "order-chain" : `order-${field}`)?.focus();
      return;
    }
    setErrors({});
    setStatus('sending');
    setServerError(null);
    try {
      const body = new FormData();
      for (const [key, value] of Object.entries(payload)) if (value !== null && value !== undefined) body.append(key, String(value));
      body.append('requestId', requestId.current);
      const res = await fetch('/api/leads', { method: 'POST', headers: gaHeaders(), body });
      const data = (await res.json().catch(() => null)) as { status?: string; tracked?: boolean; error?: string } | null;
      if (!res.ok || data?.status !== 'sent') {
        setServerError(data?.error ?? 'Nepavyko išsiųsti. Bandykite dar kartą po kelių minučių.');
        setStatus('error');
        return;
      }
      setStatus('sent');
      trackConfirmedLead(res.ok, { ok: true, emailSent: true, tracked: data.tracked });
    } catch {
      setServerError('Nepavyko išsiųsti – patikrinkite interneto ryšį ir bandykite dar kartą.');
      setStatus('error');
    }
  };

  const submitLabel = paused ? 'Užsakymai laikinai sustabdyti' : q ? 'Siųsti užklausą' : 'Sužinoti kainą';

  return (
    <section id="uzsakyti" className="w-full py-16 sm:py-20 px-4 sm:px-8 bg-[#f4f5f8] text-neutral-900 scroll-mt-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-wide text-neutral-900 font-['Montserrat',sans-serif]">
            {q ? 'Pasirinkite grandinių kiekį' : 'Sužinokite galandimo kainą'}
          </h2>
          <div className="w-14 h-1 bg-[#c2410c] mx-auto mt-2.5 rounded-full" />
        </div>

        {/* Kiekio pasirinkimas */}
        <div className="w-full max-w-2xl mx-auto mb-8 sm:mb-10">
          <div
            className="grid gap-1.5 xs:gap-2 sm:gap-3"
            style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
          >
            {options.map((opt) => {
              const isSelected = selectedCount === opt.quantity;
              const unit = quote(opt.quantity);
              return (
                <button
                  key={opt.quantity}
                  type="button"
                  id={`quantity-btn-${opt.quantity}`}
                  disabled={status === 'sending' || status === 'sent'}
                  onClick={() => setSelectedCount(opt.quantity)}
                  aria-pressed={isSelected}
                  className={`relative min-h-[52px] py-2.5 sm:py-3.5 px-1 sm:px-3 rounded-xl font-bold transition-all duration-200 border cursor-pointer text-center flex flex-col items-center justify-center ${
                    isSelected
                      ? 'bg-[#c2410c] text-white border-[#f95700] shadow-[0_4px_14px_rgba(249,87,0,0.35)] scale-[1.02]'
                      : 'bg-white text-neutral-800 border-neutral-300 hover:border-neutral-400 hover:bg-neutral-50'
                  }`}
                >
                  {opt.popular && (
                    <span className={`text-[9px] font-black uppercase tracking-tight ${isSelected ? 'text-white' : 'text-[#f95700]'}`}>
                      ★ Siūlome
                    </span>
                  )}
                  <span className="text-xs xs:text-sm sm:text-lg font-extrabold font-['Montserrat',sans-serif]">
                    {opt.quantity} vnt
                  </span>
                  {unit && (
                    <span className={`text-[9px] xs:text-[10px] sm:text-xs mt-0.5 ${isSelected ? 'text-orange-100' : 'text-neutral-500'}`}>
                      {unit.approximate ? 'iki ' : ''}
                      {unit.unitPrice.toFixed(2).replace(".", ",")} €/vnt.
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-center gap-3">
            <label htmlFor="order-quantity" className="text-sm text-neutral-700">Kitas kiekis:</label>
            <input id="order-quantity" type="number" min={1} max={500} step={1} value={selectedCount} disabled={status === 'sending' || status === 'sent'} onChange={(e) => setSelectedCount(normalizeQuantity(Number(e.target.value)))} className="w-24 min-h-[44px] rounded-lg border border-neutral-300 px-3 text-neutral-900" />
          </div>

          {isEnabled('freeShipping') && (
            <div className="mt-3.5 flex items-center justify-center text-center px-2">
              {isFreeShipping(selectedCount) ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                  ✓ Grąžinimas jums NEMOKAMAS
                </span>
              ) : (
                <span className="text-xs text-neutral-600 bg-white/70 px-3 py-1 rounded-full border border-neutral-200">
                  Patarimas: nuo <strong>{s.freeShippingMinimumQuantity} vnt.</strong> grąžinimas nemokamas
                </span>
              )}
            </div>
          )}
        </div>

        {paused && (
          <div className="max-w-2xl mx-auto mb-6 sm:mb-8 p-4 sm:p-5 rounded-2xl bg-orange-50 border-2 border-[#f95700]/40 text-center">
            <p className="text-sm sm:text-base font-extrabold text-neutral-900 uppercase tracking-wide font-['Montserrat',sans-serif]">
              Laikinai nepriimame naujų užsakymų
            </p>
            <p className="mt-1.5 text-xs sm:text-sm text-neutral-700 leading-relaxed">
              Šiuo metu užsakymai sustabdyti. Klausimams rašykite{' '}
              <a href={`mailto:${BUSINESS.email}`} className="font-bold text-[#f95700] underline underline-offset-2">
                {BUSINESS.email}
              </a>
            </p>
          </div>
        )}

        <div className="mt-4 sm:mt-6 bg-white rounded-2xl shadow-sm border border-neutral-200/90 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-neutral-200">
            {/* Suvestinė */}
            <div className="lg:col-span-5 p-5 sm:p-8 flex flex-col justify-between bg-neutral-50/50">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3 font-['Montserrat',sans-serif]">
                  1. Užklausos suvestinė
                </div>
                {q ? (
                  <div className="space-y-3.5 sm:space-y-4 pt-1 sm:pt-2">
                    <div className="flex items-center justify-between text-sm sm:text-lg text-neutral-700">
                      <span>Galandimas ({selectedCount} vnt.):</span>
                      <span className="font-extrabold text-neutral-900 text-base sm:text-xl">
                        {q.approximate ? 'iki ' : ''}
                        {formatEur(q.chainPrice)}
                      </span>
                    </div>
                    {s.enabled && (
                      <div className="flex items-start justify-between text-xs sm:text-base text-neutral-700">
                        <span>Grąžinimas paštomatu:</span>
                        {q.shippingPrice === 0 ? (
                          <span className="font-extrabold text-emerald-700 text-sm sm:text-lg uppercase tracking-wide">
                            Nemokamas
                          </span>
                        ) : (
                          <span className="font-bold text-neutral-900 text-sm sm:text-base">{formatEur(q.shippingPrice)}</span>
                        )}
                      </div>
                    )}
                    {s.enabled && <p className="text-xs text-neutral-600 leading-relaxed">{inboundShippingLabel()}</p>}
                    <div className="pt-2 border-b border-neutral-200" />
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-base sm:text-xl font-extrabold tracking-wide text-neutral-900 uppercase font-['Montserrat',sans-serif]">
                        {q.approximate ? 'Orientacinė suma mums:' : 'Suma mums:'}
                      </span>
                      <span className="text-2xl sm:text-3xl font-black text-[#f95700] font-['Montserrat',sans-serif]">
                        {formatEur(q.total)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-neutral-700 leading-relaxed">
                    Pasirinkite kiekį ir užpildykite užklausą – atsakysime su tikslia kaina pagal jūsų grandinių tipą.
                  </p>
                )}
              </div>

              <div className="mt-6 sm:mt-10 pt-5 sm:pt-6 border-t border-neutral-200/80">
                {isEnabled('noPrepayment') && (
                  <div className="flex items-start gap-2 text-xs sm:text-sm text-neutral-600 mb-3">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-neutral-200/80 flex items-center justify-center text-neutral-700 flex-shrink-0">
                      <Lock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </div>
                    <div>
                      <span className="font-bold text-neutral-800">Už galandimą iš anksto mokėti nereikia</span>{' '}
                      <span className="text-neutral-500">– apmokėsite tik suderinę užsakymą.</span>
                    </div>
                  </div>
                )}
                <ul className="space-y-1.5 text-xs text-neutral-600">
                  <li>• Galandimas staklėmis, vienodas kampas visiems dantukams</li>
                  {s.enabled && (
                    <li>
                      • Siuntimas paštomatais{isEnabled('nationwide') ? ' visoje Lietuvoje' : ''}
                    </li>
                  )}
                  <li>• Jūsų duomenys naudojami tik užklausai atsakyti</li>
                </ul>
              </div>
            </div>

            {/* Forma */}
            <div className="lg:col-span-7 p-5 sm:p-8">
              <div className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3 font-['Montserrat',sans-serif]">
                2. Kontaktai atsakymui
              </div>

              {status === 'sent' ? (
                <div className="text-center py-8" role="status">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-wide font-['Montserrat',sans-serif]">Užklausa išsiųsta</h3>
                  <p className="text-sm text-neutral-600 mt-2 max-w-sm mx-auto">
                    Ačiū! Susisieksime {BUSINESS.responseTime || 'artimiausiu metu'} ir suderinsime kainą bei grandinių perdavimą. Grandinių dar nesiųskite – palaukite mūsų atsakymo.
                  </p>
                  <button type="button" onClick={() => { setStatus('idle'); setServerError(null); }} className="mt-5 text-sm font-semibold text-orange-700 underline">Pateikti kitą užklausą</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} aria-busy={status === 'sending'} noValidate className="space-y-3.5 sm:space-y-4">
                  <input
                    type="text"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    value={form.website}
                    onChange={set('website')}
                    aria-hidden="true"
                    className="absolute -left-[9999px] w-px h-px opacity-0"
                  />
                  <p className="text-xs text-neutral-600">Visi žvaigždute (*) pažymėti laukai privalomi. Jei nežinote grandinės parametrų, įrašykite „Nežinau“.</p>
                  <Field id="order-name" label="Vardas *:" error={errors['name']}>
                    <input id="order-name" type="text" required aria-required="true" autoComplete="name" disabled={paused || status === 'sending'} value={form.name} onChange={set('name')} maxLength={120} placeholder="Jūsų vardas" className={inputCls} />
                  </Field>
                  <Field id="order-phone" label="Telefonas *:" error={errors['phone']}>
                    <input id="order-phone" type="tel" required aria-required="true" inputMode="tel" autoComplete="tel" disabled={paused || status === 'sending'} value={form.phone} onChange={set('phone')} placeholder="+370 600 00000" className={inputCls} />
                  </Field>
                  <Field id="order-email" label="El. paštas *:" error={errors['email']}>
                    <input id="order-email" type="email" required aria-required="true" inputMode="email" autoComplete="email" disabled={paused || status === 'sending'} value={form.email} onChange={set('email')} placeholder="jusu@pastas.lt" className={inputCls} />
                  </Field>
                  <Field id="order-city" label="Miestas *:" error={errors['city']}>
                    <input id="order-city" type="text" required aria-required="true" autoComplete="address-level2" disabled={paused || status === 'sending'} value={form.city} onChange={set('city')} placeholder="Pvz. Kaunas" className={inputCls} />
                  </Field>
                  <Field id="order-chain" label="Grandinės *:" error={errors['chainInfo']}>
                    <input id="order-chain" type="text" required aria-required="true" disabled={paused || status === 'sending'} value={form.chainInfo} onChange={set('chainInfo')} placeholder="Pvz. Stihl 3/8, 1,3 mm arba „Nežinau“" className={inputCls} />
                  </Field>
                  <Field id="order-message" label="Žinutė *:" error={errors['message']}>
                    <textarea id="order-message" rows={3} required aria-required="true" disabled={paused || status === 'sending'} value={form.message} onChange={set('message')} placeholder="Parašykite, ką turėtume žinoti apie jūsų užklausą" className={`${inputCls} resize-y`} />
                  </Field>

                  {serverError && (
                    <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2" role="alert">
                      {serverError}
                    </p>
                  )}

                  <div className="pt-2 sm:pt-3">
                    <button
                      type="submit"
                      id="order-submit-btn"
                      disabled={paused || status === 'sending'}
                      className="w-full py-3.5 sm:py-4 px-4 sm:px-6 rounded-xl bg-[#c2410c] hover:bg-[#9a3412] text-white font-extrabold text-sm sm:text-base uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_6px_20px_rgba(249,87,0,0.3)] transition-all cursor-pointer group font-['Montserrat',sans-serif] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#c2410c]"
                    >
                      {status === 'sending' ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                      <span>{status === 'sending' ? 'Siunčiama…' : submitLabel}</span>
                      {status !== 'sending' && <ChevronRight className="w-5 h-5 flex-shrink-0 group-hover:translate-x-1 transition-transform" />}
                    </button>
                  </div>

                  <p className="text-[11px] text-neutral-500 leading-relaxed">
                    Tai užklausa, o ne patvirtintas užsakymas. Grandines siųskite tik suderinę gavėjo duomenis ir sąlygas. Kontaktai naudojami užklausai atsakyti.{' '}
                    <Link to="/privatumo-politika" className="underline underline-offset-2 hover:text-neutral-700">
                      Privatumo politika
                    </Link>
                  </p>

                  {BUSINESS.responseTime && (
                    <div className="flex items-center gap-2 text-xs text-neutral-500">
                      <Clock className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                      <span>Susisieksime {BUSINESS.responseTime} dėl siuntimo ir kitų detalių.</span>
                    </div>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


