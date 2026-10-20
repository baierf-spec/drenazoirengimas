export function initConfirmation() {
  let received = false;
  try {
    received = sessionStorage.getItem("drainage-received") === "yes";
  } catch {
    /* Without evidence retain the neutral, server-rendered message. */
  }
  if (!received) return;
  const heading = document.querySelector("h1");
  if (heading) heading.textContent = "Užklausa gauta.";
  const copy = document.querySelector("#success-copy");
  if (copy)
    copy.textContent =
      "Jūsų pateikta informacija ir nuotraukų priedai perduoti el. pašto siuntimo sistemai. Jie bus naudojami situacijai įvertinti ir su jumis susisiekti.";
  const note = document.querySelector<HTMLElement>("[data-received-note]");
  if (note) note.hidden = false;
  const link = document.querySelector<HTMLAnchorElement>(
    ".flow-message .button",
  );
  if (link) {
    link.href = "/";
    link.textContent = "Grįžti į pradžią";
  }
}
