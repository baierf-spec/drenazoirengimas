import { estimateCost, type EstimateInput } from "../lib/estimator";
import { diagnose } from "../lib/diagnostic";
import { track } from "../lib/analytics";
export function initDiagnostic() {
  const form = document.querySelector<HTMLFormElement>("#diagnostic-form");
  if (!form) return;
  const steps = [...form.querySelectorAll<HTMLElement>("[data-step]")];
  let started = false;
  const go = (n: number) => {
    steps.forEach((s, i) => (s.hidden = i !== n));
    document.querySelectorAll<HTMLElement>(".progress li").forEach((el, i) => {
      el.classList.toggle("active", n === i);
      if (n === i) el.setAttribute("aria-current", "step");
      else el.removeAttribute("aria-current");
    });
    const heading = steps[n].querySelector<HTMLElement>("legend,h1,h2");
    if (heading) {
      heading.tabIndex = -1;
      heading.focus();
    }
  };
  form
    .querySelector("[data-diagnostic-next]")
    ?.addEventListener("click", () => {
      if (!started) {
        track("diagnostic_started");
        started = true;
      }
      go(1);
    });
  form
    .querySelector("[data-diagnostic-back]")
    ?.addEventListener("click", () => go(0));
  form
    .querySelector("[data-diagnostic-reset]")
    ?.addEventListener("click", () => {
      started = false;
      go(0);
    });
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const result = diagnose(
      String(data.get("problem")),
      String(data.get("when")),
      String(data.get("outlet")),
    );
    document.querySelector("#diagnostic-result")!.textContent = result.main;
    document.querySelector("#diagnostic-next")!.textContent = result.next;
    try {
      sessionStorage.setItem("drainage-diagnostic", result.summary);
    } catch {
      /* Optional handoff. */
    }
    track("diagnostic_completed", {
      problem_type: String(data.get("problem")),
    });
    go(2);
  });
}
export function initEstimator() {
  const form = document.querySelector<HTMLFormElement>("#estimator-form");
  if (!form) return;
  function update() {
    const data = new FormData(form!);
    const input: EstimateInput = {
      length: Number(data.get("length")),
      type: data.get("type") as EstimateInput["type"],
      access: data.get("access") as EstimateInput["access"],
      landscaped: data.get("landscaped") === "on",
    };
    const r = estimateCost(input);
    document.querySelector("#length-label")!.textContent = `${r.length} m`;
    const fmt = (n: number) => new Intl.NumberFormat("lt-LT").format(n);
    document.querySelector("#estimate-price")!.textContent =
      `${fmt(r.min)} – ${fmt(r.max)} €`;
    document.querySelector("#estimate-formula")!.textContent =
      `${r.length} m × ${r.rate[0]}–${r.rate[1]} €/m${r.factor !== 1 ? " × 1,25 (sudėtingas priėjimas)" : ""} + ${fmt(r.fixed[0])}–${fmt(r.fixed[1])} € ${input.landscaped ? "gerbūvio atkūrimo ir papildomų darbų" : "papildomų darbų"} rezervas. Suapvalinta iki 100 €.`;
    return r;
  }
  form.addEventListener("submit", (e) => e.preventDefault());
  form.addEventListener("input", update);
  form.addEventListener("change", () => {
    const r = update();
    try {
      sessionStorage.setItem(
        "drainage-estimate",
        `${r.length} m; ${r.min}–${r.max} EUR`,
      );
    } catch {
      /* Optional. */
    }
  });
  document.querySelector("#estimate-cta")?.addEventListener("click", () => {
    const r = update();
    try {
      sessionStorage.setItem(
        "drainage-estimate",
        `${r.length} m; ${r.min}–${r.max} EUR`,
      );
    } catch {
      /* Optional. */
    }
    track("cost_estimator_completed", {
      estimate_min: r.min,
      estimate_max: r.max,
    });
  });
  update();
}
