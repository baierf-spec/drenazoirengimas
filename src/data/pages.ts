import { publicProjects } from "./projects";
import { articles } from "./articles";
import { reviewedLocationArticles } from "./locations";
export interface PageMeta {
  path: string;
  title: string;
  description: string;
  indexable: boolean;
}
const suffix = " | drenazoirengimas.lt";
const articleTitles: Record<string, string> = {
  "pamatu-drenazas": "Pamatų drenažas aplink namą",
  "sklypo-drenazas": "Sklypo drenažas ir užmirkusio kiemo sausinimas",
  "lietaus-vandens-nuvedimas": "Lietaus vandens surinkimas ir nuvedimas",
  "vanduo-sklype": "Vanduo sklype: priežastys ir galimi sprendimai",
  "drenazas-ar-lietaus-nuotekos": "Drenažas ir lietaus nuotekos: kuo skiriasi?",
};
export const pages: PageMeta[] = [
  {
    path: "/",
    title: "Drenažo įrengimas sklypui ir pamatams",
    description:
      "Sklypo ir pamatų drenažas, lietaus vandens nuvedimas. Aprašykite problemą Vilniuje, Kaune ar kitoje Lietuvos vietovėje ir pateikite užklausą.",
    indexable: true,
  },
  ...[...articles, ...reviewedLocationArticles()].map((a) => ({
    path: `/${a.slug}/`,
    title: articleTitles[a.slug] || a.title,
    description: a.description,
    indexable: true,
  })),
  {
    path: "/drenazo-kaina/",
    title: "Drenažo įrengimo kaina ir skaičiuoklė",
    description:
      "Kas lemia drenažo įrengimo kainą? Palyginkite darbų apimtį, kasimo sąlygas, medžiagas ir atkūrimą. Išbandykite paaiškintą orientacinę skaičiuoklę.",
    indexable: true,
  },
  {
    path: "/duk/",
    title: "Dažniausi klausimai apie drenažą",
    description:
      "Kada reikalingas drenažas, ar jis tinka molingam gruntui, kur nuvedamas vanduo ir kas lemia kainą? Trumpi atsakymai prieš tariantis su rangovu.",
    indexable: true,
  },
  {
    path: "/privatumo-politika/",
    title: "Privatumo ir slapukų informacija",
    description:
      "Kaip tvarkomi užklausos kontaktai, aprašymas ir nuotraukos. Duomenų gavėjai, saugojimas, analitikos pasirinkimas bei jūsų teisės.",
    indexable: true,
  },
  {
    path: "/projektai/",
    title: "Drenažo projektai ir darbų galerija",
    description:
      "Drenažo ir lietaus vandens nuvedimo projektai: darbų nuotraukos, pradinė situacija ir pasirinkti sprendimai.",
    indexable: publicProjects.length > 0,
  },
  {
    path: "/gauti-pasiulyma/",
    title: "Gauti drenažo pasiūlymą",
    description:
      "Nurodykite objekto vietą, vandens problemą ir kontaktus. Jei galite, pridėkite nuotraukų. Užklausą pateikite per trijų žingsnių formą.",
    indexable: false,
  },
  {
    path: "/diagnostika/",
    title: "Ar reikia drenažo? Situacijos klausimynas",
    description:
      "Pasirinkite vandens problemą ir atsakykite į kelis klausimus. Rezultatas padės pasiruošti pokalbiui, bet neatstos objekto apžiūros.",
    indexable: false,
  },
  {
    path: "/aciu/",
    title: "Užklausos patvirtinimas",
    description:
      "Informacija apie pateiktos drenažo užklausos gavimą ir kitą žingsnį. Atidarius puslapį savaime užklausa nėra pateikiama.",
    indexable: false,
  },
  {
    path: "/404.html",
    title: "Puslapis nerastas",
    description:
      "Šio puslapio nėra. Grįžkite į pradžią ir raskite informaciją apie sklypo, pamatų drenažą bei lietaus vandens nuvedimą.",
    indexable: false,
  },
  ...publicProjects.map((p) => ({
    path: `/projektai/${p.slug}/`,
    title: p.title,
    description: (p.title + ". " + p.description)
      .replace(/\s+/g, " ")
      .slice(0, 155),
    indexable: true,
  })),
].map((p) => ({ ...p, title: p.title + suffix }));
export const pageMeta = (path: string) =>
  pages.find((page) => page.path === path);
export const indexablePaths = () =>
  pages.filter((page) => page.indexable).map((page) => page.path);
