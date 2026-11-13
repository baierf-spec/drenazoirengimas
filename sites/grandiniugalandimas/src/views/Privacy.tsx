import { Link } from "@/components/Link";
import { BUSINESS } from "@/config/business";
import { SITE } from "@/lib/site";
import { GA_ID } from "@/lib/analytics";
import { operatorText, providerText, useLeadhub } from "@/lib/leadhub-client";

const title = `Privatumo politika | ${BUSINESS.businessName}`;
const description = `Kaip ${BUSINESS.businessName} tvarko užklausose pateiktus kontaktus: be paskyrų, be duomenų bazės, tik atsakymui į užklausą.`;

export const privacyHead = () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: `${SITE.url}/privatumo-politika` }],
  });

export default function PrivacyPage() {
  const b = BUSINESS;
  const lh = useLeadhub();
  const provider = providerText(lh.tenant);

  return (
    <>
      <div className="pt-24 sm:pt-28 pb-16 px-4 sm:px-8">
        <article className="max-w-3xl mx-auto text-neutral-300 text-sm sm:text-base leading-relaxed space-y-5">
          <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white font-['Montserrat',sans-serif]">
            Privatumo politika
          </h1>

          <p className="text-neutral-400">Atnaujinta 2026 m. spalio 29 d.</p>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">Kas tvarko duomenis</h2>
            <p>
              Svetainės valdytojas (duomenų valdytojas): {operatorText(lh.operator)} Bendrasis svetainės el. paštas:{" "}
              <a className="text-[#f95700] underline" href={`mailto:${b.email}`}>{b.email}</a>.
            </p>
            <p>
              Kai svetainėje nurodytas paslaugų teikėjas, jūsų užklausa siunčiama tiesiai jam. Jis atsako į užklausą ir teikia
              paslaugą kaip savarankiškas duomenų valdytojas, todėl dėl jau gautos užklausos galite kreiptis ir tiesiai į jį.
            </p>
            {provider && <p>{provider}</p>}
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">Kokius duomenis gauname</h2>
            <p>
              Tik tuos, kuriuos patys įrašote užklausos formoje: vardą, telefoną, el. paštą, miestą, grandinių kiekį ir
              informaciją, žinutę. Taip pat užklausoje nurodomas puslapis, iš kurio ji išsiųsta, ir laikas.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">Kam naudojame ir kokiu pagrindu</h2>
            <p>
              Kad paslaugų teikėjas galėtų jums atsakyti ir suderinti užsakymą – tai veiksmai jūsų prašymu prieš sudarant sutartį
              (BDAR 6 str. 1 d. b p.). Paskyra nekuriama. Užklausa el. laišku per Cloudflare el. pašto paslaugą siunčiama
              svetainėje nurodytam paslaugų teikėjui, o kai jis nenurodytas – svetainės valdytojui. Laiškai saugomi gavėjo
              el. pašte tiek, kiek reikia užsakymui įvykdyti ir apskaitai.
            </p>
            <p>
              Svetainės valdytojas gauna tos pačios užklausos kopiją el. paštu – kad galėtų patikrinti, ar užklausa tikra, ir pagrįsti paslaugų teikėjui išrašomą sąskaitą (teisėtas interesas, BDAR 6 str. 1 d. f p.). Kopija saugoma ne ilgiau kaip 12 mėnesių. Svetainės sistemoje lieka tik užklausos laikas ir trumpas aprašymas be kontaktų, kuris ištrinamas po 180 dienų.
            </p>
            {b.shipping.enabled && (
              <p>
                Siuntimui reikalingus duomenis (vardą, telefoną) perduodame suderintam siuntų vežėjui tiek, kiek būtina grąžinimo siuntai sukurti.
              </p>
            )}
            <p>Duomenų neparduodame ir nenaudojame rinkodarai be jūsų sutikimo.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">Analitika ir slapukai</h2>
            {GA_ID ? (
              <p>
                Su jūsų sutikimu naudojame Google Analytics lankomumo statistikai. Nesutikus analitikos skriptai neįkeliami.
                Sutikimą galite atšaukti išvalę naršyklės svetainės duomenis.
              </p>
            ) : (
              <p>Svetainėje lankomumo stebėjimo įrankiai nenaudojami ir slapukai sekimui nesaugomi.</p>
            )}
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">Jūsų teisės</h2>
            <p>
              Galite prašyti susipažinti su savo duomenimis, juos ištaisyti, ištrinti ar apriboti tvarkymą, nesutikti su
              tvarkymu – parašykite{" "}
              <a className="text-[#f95700] underline" href={`mailto:${b.email}`}>{b.email}</a> arba kreipkitės į paslaugų
              teikėją, gavusį jūsų užklausą. Taip pat turite teisę kreiptis į Valstybinę duomenų apsaugos inspekciją (vdai.lrv.lt).
            </p>
          </section>

          <p className="pt-4">
            <Link to="/" className="text-[#f95700] underline underline-offset-2">← Grįžti į pagrindinį puslapį</Link>
          </p>
        </article>
      </div>
    </>
  );
}


