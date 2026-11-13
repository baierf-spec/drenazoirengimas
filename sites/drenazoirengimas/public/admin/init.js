/* Only the admin page loads this script. No credentials or visitor trackers. */
(async () => {
  const status = document.getElementById("cms-loading");
  if (!window.CMS) {
    status.textContent =
      "Nepavyko užkrauti turinio valdymo. Patikrinkite interneto ryšį ir atnaujinkite puslapį.";
    return;
  }
  try {
    const response = await fetch("/admin/config.json", { cache: "no-store" });
    if (!response.ok) throw new Error("config");
    const config = await response.json();
    window.CMS.init({ config: { ...config, load_config_file: false } });
    status.remove();
    window.CMS.registerEventListener({
      name: "preSave",
      handler: ({ entry }) => {
        if (entry.get("collection") !== "projects") return entry.get("data");
        const data = entry.get("data").toJS();
        if (!data.title || data.title.trim().length < 3)
          throw new Error("Įrašykite projekto pavadinimą (bent 3 simboliai).");
        if (!data.description || data.description.trim().length < 10)
          throw new Error("Trumpai aprašykite projektą (bent 10 simbolių).");
        if (!data.images || !data.images.length)
          throw new Error("Pridėkite bent vieną tikro darbo nuotrauką.");
        if (!data.coverImage && (data.cover || 0) >= data.images.length)
          throw new Error(
            "Viršelio numeris neatitinka nuotraukų. Pirmai nuotraukai pasirinkite 0.",
          );
        return entry.get("data");
      },
    });
    // Text-only preview: React escapes editor input; no arbitrary HTML rendering.
    const h = window.h;
    const Preview = ({ entry, getAsset }) => {
      const data = entry.get("data").toJS();
      const images = data.images || [];
      return h(
        "article",
        {
          style: { padding: "24px", fontFamily: "system-ui", lineHeight: 1.6 },
        },
        h("h1", null, data.title || "Turinio peržiūra"),
        ...Object.entries(data)
          .filter(
            ([key, value]) =>
              ![
                "slug",
                "status",
                "sort_order",
                "seoTitle",
                "seoDescription",
              ].includes(key) && typeof value === "string",
          )
          .map(([key, value]) => h("p", { key }, value)),
        ...images.map((image, i) =>
          h(
            "figure",
            { key: i },
            h("img", {
              src: getAsset(image.src).toString(),
              alt: image.alt,
              style: { maxWidth: "100%" },
            }),
            h("figcaption", null, image.alt),
          ),
        ),
      );
    };
    window.CMS.registerPreviewTemplate("projects", Preview);
  } catch {
    status.textContent =
      "Nepavyko užkrauti nustatymų. Atnaujinkite puslapį arba susisiekite su svetainės prižiūrėtoju.";
  }
})();
