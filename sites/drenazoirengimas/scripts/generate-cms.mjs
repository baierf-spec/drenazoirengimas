import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import { build } from "esbuild";
import { stringify } from "yaml";
const json = async (p) => JSON.parse(await readFile(p, "utf8"));
const site = await json("site.config.json"),
  cms = await json("cms.config.json");
if (
  !/^[\w.-]+\/[\w.-]+$/.test(cms.repository) ||
  !/^[\w./-]+$/.test(cms.branch) ||
  cms.scope !== "public_repo"
)
  throw Error("Invalid protected CMS configuration");
const field = (name, label, widget = "string", rest = {}) => ({
  name,
  label,
  widget,
  ...rest,
});
const hidden = (name, value) =>
  field(name, "", "hidden", value === undefined ? {} : { default: value });
const text = (name, label, rest = {}) => field(name, label, "text", rest);
const list = (name, label, fields, rest = {}) =>
  field(
    name,
    label,
    "list",
    fields
      ? { fields, ...rest }
      : { field: field("value", "Tekstas"), ...rest },
  );
const object = (name, label, fields, rest = {}) =>
  field(name, label, "object", { fields, ...rest });
const bool = (name, label) => field(name, label, "boolean", { default: true });
const integer = (name, label, rest = {}) =>
  field(name, label, "number", { value_type: "int", ...rest });
const img = (name, label, rest = {}) =>
  field(name, label, "image", {
    allow_multiple: false,
    choose_url: false,
    media_library: { config: { max_file_size: 20 * 1024 * 1024 } },
    ...rest,
  });
const file = (name, label, path, fields, rest = {}) => ({
  name,
  label,
  file: path,
  fields,
  ...rest,
});
const fileCollection = (name, label, files) => ({
  name,
  label,
  files,
  delete: false,
  editor: { preview: false },
});
const home = await json("src/content/home.json");
const labels = [
  "Problemų skilties įžanga",
  "Problemų skilties antraštė",
  "Problemų skilties aprašymas",
  "Klausimyno kvietimas",
  "Klausimyno aprašymas",
  "Veikimo skilties įžanga",
  "Veikimo skilties antraštė",
  "Kaip sistema veikia",
  "Privalumų įžanga",
  "Privalumų antraštė",
  "Paslaugų įžanga",
  "Paslaugų antraštė",
  "Paslaugų aprašymas",
  "Darbų eigos įžanga",
  "Darbų eigos antraštė",
  "Darbų eigos aprašymas",
  "Kainos skilties įžanga",
  "Kainos skilties antraštė",
  "Kainos skilties aprašymas",
  "Teritorijos įžanga",
  "Teritorijos antraštė",
  "Teritorijos aprašymas",
  "Nuotraukų kvietimo antraštė",
  "Nuotraukų kvietimo tekstas",
  "DUK įžanga",
  "DUK antraštė",
  "DUK aprašymas",
  "Kontaktų skilties įžanga",
  "Kontaktų skilties antraštė",
  "Kontaktų skilties tekstas",
  "Pastaba prie užklausos mygtuko",
];
const copyFields = Object.keys(home)
  .filter((k) => /^text\d+$/.test(k))
  .map((key, i) =>
    Array.isArray(home[key])
      ? list(key, labels[i], null, {
          min: home[key].length,
          max: home[key].length,
        })
      : text(key, labels[i]),
  );
const fixedCards = (name, label, fields) =>
  list(name, label, fields, {
    min: home[name].length,
    max: home[name].length,
    allow_add: false,
    summary: "{{fields.title}}{{fields.text}}",
  });
const sectionFields = [
  field("title", "Antraštė"),
  list("text", "Pastraipos", null, { min: 1 }),
  list("list", "Sąrašas", null, { required: false }),
  hidden("id"),
];
const articleFiles = [];
for (const name of (await readdir("src/content/articles"))
  .filter((v) => v.endsWith(".json"))
  .sort()) {
  const a = await json("src/content/articles/" + name);
  articleFiles.push(
    file(name.slice(0, -5), a.title, "src/content/articles/" + name, [
      hidden("slug", a.slug),
      hidden("enabled", true),
      hidden("service", a.service),
      hidden("image", a.image),
      hidden("imageAlt", a.imageAlt),
      field("title", "Puslapio antraštė"),
      text("description", "Trumpas aprašymas"),
      text("intro", "Įvadinis tekstas"),
      list("sections", "Turinio skyriai", sectionFields, {
        min: a.sections.length,
        max: a.sections.length,
        allow_add: false,
        summary: "{{fields.title}}",
      }),
      list(
        "sources",
        "Techninės informacijos šaltiniai",
        [field("label", "Pavadinimas"), field("url", "Nuoroda", {}, {})],
        { required: false },
      ),
    ]),
  );
}
// Fix the string widget above explicitly (labels contain no implementation terms).
for (const f of articleFiles)
  f.fields.find((v) => v.name === "sources").fields[1].widget = "string";
const projectFields = [field("title", "Projekto pavadinimas", {}, {})];
projectFields[0].widget = "string";
projectFields.push(
  text("description", "Trumpas aprašymas", {
    hint: "Tik realus atliktas darbas. Nurodykite pradinę situaciją ir rezultatą.",
  }),
  field("location", "Vietovė", {}, { required: false }),
);
projectFields.at(-1).widget = "string";
projectFields.push(
  field("project_type", "Darbų tipas", "select", {
    required: false,
    options: [
      { label: "Pamatų drenažas", value: "foundation" },
      { label: "Sklypo drenažas", value: "plot" },
      { label: "Lietaus vandens nuvedimas", value: "rain" },
      { label: "Kita", value: "other" },
    ],
  }),
  field("completion_date", "Užbaigimo metai arba data", "string", {
    required: false,
    hint: "Pvz., 2026 arba 2026-10-20.",
    pattern: [
      "^(?:\\d{4}(?:-\\d{2}-\\d{2})?)?$",
      "Įrašykite metus arba YYYY-MM-DD datą.",
    ],
  }),
  ...["problem", "solution", "work_scope"].map((k, i) =>
    text(
      k,
      ["Pradinė problema", "Pasirinktas sprendimas", "Darbų apimtis"][i],
      { required: false },
    ),
  ),
  field("duration", "Darbų trukmė", "string", { required: false }),
  field("price", "Šio projekto kaina arba intervalas", "string", {
    required: false,
    hint: "Tik reali šio darbo kaina; nurodykite, ar su PVM.",
  }),
  list(
    "images",
    "Projekto nuotraukos",
    [
      img("src", "Nuotrauka", {
        hint: "Tik realaus darbo nuotrauka. JPG, PNG, WebP. Iki 20 MB. iPhone HEIC bus konvertuotas parenkant failą.",
      }),
      field("alt", "Kas pavaizduota nuotraukoje?", "string", {
        pattern: [
          "^.{3,200}$",
          "Trumpai aprašykite nuotrauką (3–200 simbolių).",
        ],
      }),
    ],
    {
      min: 1,
      max: 30,
      summary: "{{fields.alt}}",
      hint: "Pridėkite kelias nuotraukas, jų tvarką galite pakeisti sąraše.",
    },
  ),
  img("coverImage", "Viršelio nuotrauka", {
    required: false,
    hint: "Pasirinkite nuotrauką iš galerijos. Nepasirinkus naudojama pirmoji projekto nuotrauka.",
  }),
  hidden("cover", 0),
  integer("sort_order", "Eiliškumas galerijoje", {
    default: 0,
    hint: "Mažesnis skaičius rodomas pirmiau.",
  }),
  field("status", "Publikavimas", "select", {
    default: "draft",
    options: [
      { label: "Juodraštis", value: "draft" },
      { label: "Publikuota", value: "published" },
    ],
  }),
  field("seoTitle", "SEO pavadinimas", "string", { required: false }),
  text("seoDescription", "Meta aprašymas", { required: false }),
);
const settingsFields = [
  hidden("$schema", site.$schema),
  object("site", "Svetainė", [
    hidden("origin", site.site.origin),
    field("name", "Rodomas svetainės pavadinimas"),
  ]),
  object("contact", "Kontaktai", [
    bool("showPhone", "Rodyti telefono numerį"),
    field("phone", "Telefono numeris", "string", {
      required: false,
      hint: "Formatas +37061234567. Išjungus rodymą numeris svetainėje nerodomas.",
    }),
    field("email", "Viešas el. paštas"),
  ]),
  object("privacy", "Duomenų valdytojas", [
    field("controllerName", "Asmens arba įmonės pavadinimas"),
    field("controllerAddress", "Adresas"),
  ]),
  object("business", "Svetainės tekstai", [
    field("primaryCta", "Pagrindinio mygtuko tekstas"),
    list("serviceAreas", "Aptarnaujamos vietovės", null, { min: 1, max: 6 }),
    field("heroArea", "Teritorijos tekstas puslapio pradžioje"),
    field("footerArea", "Teritorijos tekstas puslapio apačioje"),
    list("footerLines", "Šūkis puslapio apačioje", null, { min: 2, max: 2 }),
    text("footerDescription", "Trumpas veiklos paaiškinimas"),
  ]),
  object("features", "Užklausos ir privatumas", [
    bool("leadsEnabled", "Priimti užklausas"),
    bool(
      "referrerAttribution",
      "Siūlyti įsiminti atėjimo šaltinį su lankytojo sutikimu",
    ),
    hidden("indexingEnabled", site.features.indexingEnabled),
  ]),
  hidden("email", site.email),
  hidden("analytics", site.analytics),
  hidden("turnstile", site.turnstile),
];
const pricing = await json("src/content/pricing.json");
const priceLabels = [
  "Įvadinis tekstas",
  "Skaičiuoklės antraštė",
  "Skaičiuoklės paaiškinimas",
  "Pavyzdys be JavaScript",
  "Modelio prielaidų antraštė",
  "Modelio prielaidos",
  "Kas neįskaičiuota",
  "Kainos veiksnių antraštė",
  "Pasiūlymų palyginimo antraštė",
  "Kaip palyginti pasiūlymus",
];
const config = {
  backend: {
    name: "github",
    repo: cms.repository,
    branch: cms.branch,
    base_url: site.site.origin,
    auth_endpoint: "auth",
    auth_scope: cms.scope,
    commit_messages: {
      create: "cms: sukurta {{collection}} „{{slug}}“",
      update: "cms: atnaujinta {{collection}} „{{slug}}“",
      delete: "cms: pašalinta {{collection}} „{{slug}}“",
      uploadMedia: "cms: pridėta nuotrauka {{path}}",
      deleteMedia: "cms: pašalinta nuotrauka {{path}}",
    },
  },
  locale: "lt",
  site_url: site.site.origin,
  display_url: site.site.origin,
  logo_url: "/favicon.svg",
  media_folder: "public/images/projects",
  public_folder: "/images/projects",
  slug: { encoding: "ascii", clean_accents: true, sanitize_replacement: "-" },
  show_preview_links: false,
  collections: [
    fileCollection("home", "Pagrindinis", [
      file("home", "Pagrindinis puslapis", "src/content/home.json", [
        field("heroEyebrow", "Įžanga virš pagrindinės antraštės"),
        list("heroTitle", "Pagrindinė antraštė (3 eilutės)", null, {
          min: 3,
          max: 3,
        }),
        text("heroIntro", "Įvadinis aprašymas"),
        field("positioning", "Pagrindinė mintis"),
        text("positioningText", "Pagrindinės minties paaiškinimas"),
        ...copyFields,
        fixedCards("heroServices", "Paskirties žymos", [
          hidden("icon"),
          field("text", "Pavadinimas"),
        ]),
        fixedCards("benefits", "Privalumai", [
          hidden("icon"),
          field("title", "Pavadinimas"),
          text("text", "Aprašymas"),
        ]),
        fixedCards("process", "Darbų eiga", [
          field("title", "Pavadinimas"),
          text("text", "Aprašymas"),
        ]),
        fixedCards("priceFactors", "Kainos veiksniai", [
          hidden("icon"),
          field("text", "Pavadinimas"),
        ]),
      ]),
      file(
        "problems",
        "Vandens problemų kortelės",
        "src/content/problems.json",
        [
          list(
            "items",
            "Problemos",
            [
              hidden("id"),
              hidden("icon"),
              hidden("href"),
              field("title", "Pavadinimas"),
              text("text", "Aprašymas"),
            ],
            { min: 4, max: 4, allow_add: false },
          ),
        ],
      ),
    ]),
    fileCollection("services", "Paslaugos ir patarimai", [
      file("cards", "Paslaugų kortelės", "src/content/services.json", [
        list(
          "items",
          "Paslaugos",
          [
            hidden("slug"),
            hidden("icon"),
            field("tag", "Trumpa žyma"),
            field("title", "Pavadinimas"),
            text("text", "Aprašymas"),
            bool("enabled", "Rodyti paslaugos kortelę"),
          ],
          { min: 3, max: 3, allow_add: false },
        ),
      ]),
      ...articleFiles,
    ]),
    fileCollection("prices", "Kainos", [
      file("pricing", "Kainos paaiškinimai", "src/content/pricing.json", [
        ...Object.keys(pricing)
          .filter((k) => /^text\d+$/.test(k))
          .map((k, i) => text(k, priceLabels[i])),
        list("factors", "Kainą keičiantys veiksniai", null, { min: 1 }),
        field("modelReviewedAt", "Modelio peržiūros data", "datetime", {
          format: "YYYY-MM-DD",
          date_format: "YYYY-MM-DD",
          time_format: false,
        }),
        list(
          "marketSources",
          "Patikrinti kainų šaltiniai",
          [
            field("label", "Pavadinimas"),
            field("url", "Vieša nuoroda"),
            text("scope", "Kokį intervalą ar darbų apimtį pagrindžia?"),
            field("reviewedAt", "Peržiūros data", "datetime", {
              format: "YYYY-MM-DD",
              date_format: "YYYY-MM-DD",
              time_format: false,
            }),
          ],
          {
            required: false,
            hint: "Pridėkite tik tikras patikrintas nuorodas. Tuščias sąrašas yra leidžiamas.",
          },
        ),
      ]),
    ]),
    {
      name: "projects",
      label: "Projektai ir galerija",
      label_singular: "Naujas projektas",
      folder: "src/content/projects",
      format: "json",
      extension: "json",
      create: true,
      delete: true,
      slug: "{{slug}}",
      identifier_field: "title",
      summary: "{{title}} · {{status}}",
      sortable_fields: ["title", "sort_order"],
      editor: { preview: true },
      fields: projectFields,
    },
    fileCollection("faq", "DUK", [
      file("faq", "Dažniausi klausimai", "src/content/faq.json", [
        list(
          "items",
          "Klausimai",
          [
            field("question", "Klausimas"),
            text("answer", "Atsakymas"),
            bool("enabled", "Rodyti svetainėje"),
            hidden("link"),
          ],
          { min: 1, summary: "{{fields.question}}" },
        ),
      ]),
    ]),
    fileCollection("settings", "Kontaktai ir svetainės nustatymai", [
      file(
        "settings",
        "Kontaktai ir veiklos informacija",
        "site.config.json",
        settingsFields,
      ),
    ]),
    fileCollection("seo", "SEO", [
      file("seo", "Puslapių paieškos informacija", "src/content/seo.json", [
        list(
          "pages",
          "Esami puslapiai",
          [
            hidden("path"),
            field("title", "SEO pavadinimas"),
            text("description", "Meta aprašymas"),
            img("ogImage", "Dalijimosi paveikslėlis", { required: false }),
          ],
          {
            min: (await json("src/content/seo.json")).pages.length,
            max: (await json("src/content/seo.json")).pages.length,
            allow_add: false,
            summary: "{{fields.title}}",
            hint: "Puslapių adresai ir indeksavimo taisyklės yra apsaugoti. Projekto SEO redaguokite pačiame projekte.",
          },
        ),
      ]),
    ]),
  ],
};
await mkdir("public/admin", { recursive: true });
await writeFile(
  "public/admin/config.json",
  JSON.stringify(config, null, 2) + "\n",
);
await writeFile("public/admin/config.yml", stringify(config));
console.log(
  "Decap configuration generated from protected repository settings.",
);

await build({
  entryPoints: ["src/scripts/cms-images.ts"],
  bundle: true,
  splitting: true,
  format: "esm",
  outdir: "public/admin/generated",
  minify: true,
});
