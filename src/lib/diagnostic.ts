export function diagnose(problem: string, when: string, outlet: string) {
  if (
    !["foundations", "basement", "yard", "groundwater"].includes(problem) ||
    !["rain", "always", "thaw"].includes(when) ||
    !["known", "unknown"].includes(outlet)
  )
    throw new Error("Pasirinkite visus atsakymus.");
  const main =
    problem === "basement"
      ? "Verta įvertinti pamatų zoną ir hidroizoliaciją."
      : when === "rain"
        ? "Pradėkite nuo lietaus ir paviršinio vandens kelio įvertinimo."
        : problem === "groundwater" || when === "always"
          ? "Reikalingas išsamesnis grunto ir vandens sąlygų įvertinimas."
          : "Verta įvertinti reljefą ir sklypo vandens surinkimą.";
  const next =
    outlet === "unknown"
      ? "Pirmiausia svarbu nustatyti, kur vanduo galėtų būti tinkamai nuvedamas."
      : "Nurodytą priėmimo vietą turi patikrinti specialistas – jos tinkamumas nėra patvirtintas.";
  return { main, next, summary: `${problem}; ${when}; ${outlet}` };
}
