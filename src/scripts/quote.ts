import { validateLead, LIMITS } from "../lib/validation";
import { entrySource } from "./attribution";
import { track, reportGeneratedLead, gaHeaders } from "../lib/analytics";
export function initQuote() {
  const form = document.querySelector<HTMLFormElement>("#quote-form");
  if (!form) return;
  const steps = [...form.querySelectorAll<HTMLFieldSetElement>(".flow-step")];
  let step = 0;
  let started = false;
  let busy = false;
  let delivered = false;
  let processing = false;
  let photos: File[] = [];
  const photoUrls: string[] = [];
  let widgetId: string | undefined;
  const error = form.querySelector<HTMLElement>("#quote-error")!;
  const status = form.querySelector<HTMLElement>("#quote-status")!;
  const uploadStatus = form.querySelector<HTMLElement>("#upload-status")!;
  const fileInput = form.querySelector<HTMLInputElement>("#photos")!;
  const requestId = form.elements.namedItem("requestId") as HTMLInputElement;
  requestId.value = crypto.randomUUID();
  const source = form.elements.namedItem("source") as HTMLInputElement;
  source.value = location.pathname;
  for (const key of ["diagnostic", "estimate"]) {
    try {
      const context = sessionStorage.getItem("drainage-" + key);
      if (context)
        (form.elements.namedItem(key) as HTMLInputElement).value =
          context.slice(0, 250);
    } catch {
      /* Optional context. */
    }
  }
  function showStep(next: number) {
    step = next;
    steps.forEach((el, i) => {
      el.hidden = i !== step;
    });
    document.querySelectorAll<HTMLElement>(".progress li").forEach((el, i) => {
      el.classList.toggle("active", i === step);
      if (i === step) el.setAttribute("aria-current", "step");
      else el.removeAttribute("aria-current");
    });
    error.hidden = true;
    if (next > 0) {
      const legend = steps[next].querySelector("legend")!;
      legend.tabIndex = -1;
      legend.focus();
    }
    if (next === 2) loadTurnstile();
  }
  function fail(message: string) {
    error.textContent = message;
    error.hidden = false;
  }
  function validStep() {
    const fields = [
      ...steps[step].querySelectorAll<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >("input,select,textarea"),
    ].filter((el) => el.type !== "file");
    for (const field of fields) {
      if (!field.checkValidity()) {
        field.reportValidity();
        field.focus();
        return false;
      }
    }
    return true;
  }
  form.addEventListener("input", () => {
    if (!started) {
      started = true;
      track("quote_started");
    }
    error.hidden = true;
  });
  form.querySelectorAll("[data-next]").forEach((button) =>
    button.addEventListener("click", () => {
      if (processing) {
        fail("Palaukite, kol bus paruoštos nuotraukos.");
        return;
      }
      if (validStep()) showStep(Math.min(step + 1, 2));
    }),
  );
  form
    .querySelectorAll("[data-back]")
    .forEach((button) =>
      button.addEventListener("click", () => showStep(Math.max(step - 1, 0))),
    );
  function loadTurnstile() {
    const key = form!.dataset.turnstile;
    if (!key) return;
    function render() {
      if (widgetId || !window.turnstile) return;
      widgetId = window.turnstile.render(
        form!.querySelector<HTMLElement>("#turnstile-container")!,
        {
          sitekey: key,
          action: "lead",
          theme: "light",
          "response-field-name": "turnstileToken",
          "error-callback": () =>
            fail(
              "Nepavyko patikrinti apsaugos. Patikrinkite ryšį ir pabandykite iš naujo.",
            ),
          "expired-callback": () => {
            status.textContent =
              "Apsaugos patikra baigė galioti. Patvirtinkite ją dar kartą.";
          },
          "timeout-callback": () =>
            fail("Apsaugos patikra užtruko. Bandykite dar kartą."),
        },
      );
    }
    if (window.turnstile) {
      render();
      return;
    }
    if (document.querySelector("#turnstile-script")) return;
    window.onTurnstileLoaded = render;
    const script = document.createElement("script");
    script.id = "turnstile-script";
    script.src =
      "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoaded&render=explicit";
    script.async = true;
    script.defer = true;
    script.onerror = () =>
      fail(
        "Apsaugos įkelti nepavyko. Patikrinkite ryšį ir įkelkite puslapį iš naujo.",
      );
    document.head.append(script);
  }
  function renderPhotos() {
    for (const url of photoUrls) URL.revokeObjectURL(url);
    photoUrls.length = 0;
    const list = form!.querySelector<HTMLUListElement>(".photo-list")!;
    list.replaceChildren();
    photos.forEach((photo, i) => {
      const li = document.createElement("li");
      const img = document.createElement("img");
      const url = URL.createObjectURL(photo);
      photoUrls.push(url);
      img.src = url;
      img.alt = `Pridėta objekto nuotrauka ${i + 1}`;
      const remove = document.createElement("button");
      remove.type = "button";
      remove.textContent = "×";
      remove.setAttribute("aria-label", `Pašalinti ${i + 1} nuotrauką`);
      remove.addEventListener("click", () => {
        photos = photos.filter((_, n) => n !== i);
        renderPhotos();
        uploadStatus.textContent = `Pridėta nuotraukų: ${photos.length}.`;
      });
      li.append(img, remove);
      list.append(li);
    });
  }
  fileInput.addEventListener("change", async () => {
    const added = [...(fileInput.files || [])];
    if (!added.length) return;
    processing = true;
    fileInput.disabled = true;
    uploadStatus.textContent = "Ruošiamos nuotraukos…";
    try {
      if (photos.length + added.length > LIMITS.photos)
        throw new Error("Galima pridėti iki 5 nuotraukų.");
      const ready: File[] = [];
      for (const file of added) {
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
          throw new Error("Tinka tik JPG, PNG arba WebP nuotraukos.");
        if (file.size > 8 * 1024 * 1024)
          throw new Error("Pradinė nuotrauka negali viršyti 8 MB.");
        ready.push(await compressPhoto(file));
      }
      if ([...photos, ...ready].reduce((n, f) => n + f.size, 0) > LIMITS.total)
        throw new Error(
          "Bendras paruoštų nuotraukų dydis negali viršyti 3 MB.",
        );
      photos.push(...ready);
      renderPhotos();
      uploadStatus.textContent = `Paruošta nuotraukų: ${photos.length}.`;
      track("photo_uploaded", { photo_count: photos.length });
    } catch (e) {
      uploadStatus.textContent =
        e instanceof Error
          ? e.message
          : "Nuotraukos paruošti nepavyko. Bandykite JPG formatu.";
    } finally {
      processing = false;
      fileInput.disabled = false;
      fileInput.value = "";
    }
  });
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (busy || processing) return;
    if (step !== 2) {
      if (validStep()) showStep(Math.min(step + 1, 2));
      return;
    }
    const data = new FormData(form);
    data.set(
      "referrer",
      form.dataset.attribution === "true" ? entrySource() : "",
    );
    data.delete("photos");
    photos.forEach((photo) => data.append("photos", photo));
    const validation = validateLead(data);
    if (!validation.success) {
      const issue = validation.error.issues[0];
      const field = form.querySelector<HTMLInputElement>(
        `[name="${String(issue.path[0])}"]`,
      );
      const fieldStep = field?.closest<HTMLElement>(".flow-step");
      if (fieldStep) showStep(Number(fieldStep.dataset.step));
      fail(issue.message);
      field?.focus();
      return;
    }
    if (!data.get("turnstileToken")) {
      fail(
        form.dataset.turnstile
          ? "Patvirtinkite apsaugos patikrą."
          : "Užklausų priėmimas dar neaktyvus. Jūsų informacija nebuvo išsiųsta.",
      );
      return;
    }
    busy = true;
    error.hidden = true;
    form.setAttribute("aria-busy", "true");
    const submit = form.querySelector<HTMLButtonElement>("[type=submit]")!;
    submit.disabled = true;
    status.textContent = "Siunčiama užklausa ir nuotraukos…";
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: gaHeaders(),
        body: data,
        signal: AbortSignal.timeout(45000),
      });
      const result = (await response.json()) as {
        id?: string;
        status?: string;
        tracked?: boolean;
        error?: string;
      };
      if (!response.ok || !result.id || result.status !== "sent")
        throw new Error(
          result.error ||
            "Užklausos pateikti nepavyko. Duomenys liko formoje – pabandykite dar kartą.",
        );
      delivered = true;
      // Serveris jau užskaitė užklausą GA (Measurement Protocol) – nedubliuojame.
      if (!result.tracked) await reportGeneratedLead(result.id);
      track("quote_submitted", {
        photo_count: photos.length,
        property_type: validation.data.property,
        problem_type: validation.data.problem,
      });
      try {
        sessionStorage.removeItem("drainage-diagnostic");
        sessionStorage.removeItem("drainage-estimate");
        sessionStorage.setItem("drainage-received", "yes");
      } catch {
        /* Nonessential. */
      }
      window.location.assign("/aciu/");
    } catch (e) {
      fail(
        e instanceof TypeError ||
          (e instanceof Error &&
            ["TimeoutError", "AbortError"].includes(e.name))
          ? "Ryšio klaida arba siuntimas užtruko. Duomenys liko formoje – pabandykite dar kartą."
          : e instanceof Error
            ? e.message
            : "Ryšio klaida. Duomenys liko formoje – pabandykite dar kartą.",
      );
      status.textContent = "";
      window.turnstile?.reset(widgetId);
    } finally {
      busy = delivered;
      submit.disabled = delivered;
      form.removeAttribute("aria-busy");
    }
  });
  showStep(0);
}
export async function compressPhoto(file: File): Promise<File> {
  const image = await createImageBitmap(file);
  try {
    if (image.width * image.height > 60_000_000)
      throw new Error("Nuotraukos raiška per didelė. Sumažinkite ją telefone.");
    const scale = Math.min(1, 1600 / Math.max(image.width, image.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(image.width * scale);
    canvas.height = Math.round(image.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Naršyklė negali paruošti nuotraukos.");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    let blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (b) =>
          b ? resolve(b) : reject(new Error("Nuotraukos paruošti nepavyko.")),
        "image/jpeg",
        0.82,
      ),
    );
    for (const quality of [0.7, 0.55, 0.4]) {
      if (blob.size <= 550 * 1024) break;
      blob = await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob(
          (b) =>
            b ? resolve(b) : reject(new Error("Nuotraukos paruošti nepavyko.")),
          "image/jpeg",
          quality,
        ),
      );
    }
    if (blob.size > LIMITS.file)
      throw new Error("Paruošta nuotrauka per didelė. Pasirinkite mažesnę.");
    return new File([blob], "objekto-nuotrauka.jpg", { type: "image/jpeg" });
  } finally {
    image.close();
  }
}
