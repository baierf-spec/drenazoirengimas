// LeadHub: while the site is rented, show the tenant's contacts and work photos and count contact
// clicks. With no tenant nothing is shown and visitors use the enquiry form.
type Tenant = {
  company_name: string;
  company_code: string;
  vat_code: string;
  address: string;
  phone: string;
  email: string;
  hours: string;
  about: string;
};
type Photo = { id: string; caption: string; src: string; srcSet: string };

const tel = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;
const el = <K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props: Partial<HTMLElementTagNameMap[K]> = {},
  ...kids: (Node | string)[]
) => {
  const node = Object.assign(document.createElement(tag), props);
  node.append(...kids);
  return node;
};

const counted = new Set<string>();
function count(kind: "phone_click" | "email_click") {
  if (counted.has(kind)) return;
  counted.add(kind);
  const body = JSON.stringify({ kind });
  if (
    !navigator.sendBeacon?.(
      "/api/leadhub/event",
      new Blob([body], { type: "text/plain;charset=UTF-8" }),
    )
  )
    void fetch("/api/leadhub/event", {
      method: "POST",
      body,
      keepalive: true,
    }).catch(() => undefined);
}
document.addEventListener("click", (e) => {
  const a = (e.target as HTMLElement).closest<HTMLAnchorElement>(
    "a[href^='tel:'], a[href^='mailto:']",
  );
  if (a?.closest("[data-lh]"))
    count(a.href.startsWith("tel:") ? "phone_click" : "email_click");
});

function contactList(t: Tenant) {
  const list = el("ul", { className: "lh-contacts" });
  if (t.phone)
    list.append(el("li", {}, el("a", { href: tel(t.phone) }, t.phone)));
  if (t.email)
    list.append(el("li", {}, el("a", { href: `mailto:${t.email}` }, t.email)));
  if (t.hours) list.append(el("li", {}, t.hours));
  if (t.address) list.append(el("li", {}, t.address));
  return list;
}
const legal = (t: Tenant) =>
  [
    t.company_code && `Įm. k. ${t.company_code}`,
    t.vat_code && `PVM k. ${t.vat_code}`,
  ]
    .filter(Boolean)
    .join(" · ");

function render(t: Tenant, gallery: Photo[]) {
  // Footer column
  for (const box of document.querySelectorAll<HTMLElement>(
    "[data-lh-footer]",
  )) {
    box.replaceChildren(el("strong", {}, t.company_name), contactList(t));
    if (legal(t)) box.append(el("span", { className: "small" }, legal(t)));
    box.hidden = false;
  }
  // Call buttons (hero, mobile bar): switch from "send photos" to calling the tenant
  if (t.phone)
    for (const a of document.querySelectorAll<HTMLAnchorElement>(
      "[data-lh-call]",
    )) {
      a.href = tel(t.phone);
      a.dataset.event = "phone_click";
      a.querySelector("[data-lh-call-icon=camera]")?.setAttribute("hidden", "");
      a.querySelector("[data-lh-call-icon=phone]")?.removeAttribute("hidden");
      const label = a.querySelector("[data-lh-call-label]");
      if (label) label.textContent = "Skambinti";
    }
  // Provider card and gallery section
  for (const section of document.querySelectorAll<HTMLElement>(
    "[data-lh-section]",
  )) {
    const card = section.querySelector<HTMLElement>("[data-lh-card]");
    if (card) {
      card.replaceChildren(
        el("span", { className: "eyebrow" }, "Darbus atlieka"),
        el("h2", {}, t.company_name),
      );
      if (t.about) card.append(el("p", {}, t.about));
      card.append(contactList(t));
      if (legal(t)) card.append(el("span", { className: "small" }, legal(t)));
    }
    const grid = section.querySelector<HTMLElement>("[data-lh-gallery]");
    if (grid) {
      grid.replaceChildren(
        ...gallery.map((p) =>
          el(
            "figure",
            {},
            el("img", {
              src: p.src,
              srcset: p.srcSet,
              sizes: "(min-width: 900px) 300px, 50vw",
              alt: p.caption || "Atliktas drenažo darbas",
              loading: "lazy",
              decoding: "async",
            }),
            ...(p.caption ? [el("figcaption", {}, p.caption)] : []),
          ),
        ),
      );
      grid.hidden = gallery.length === 0;
    }
    section.hidden = false;
  }
}

if (document.querySelector("[data-lh]"))
  fetch("/api/leadhub/config")
    .then((r) => (r.ok ? r.json() : null))
    .then((c: { tenant: Tenant | null; gallery: Photo[] } | null) => {
      if (c?.tenant) render(c.tenant, c.gallery ?? []);
    })
    .catch(() => undefined);
