import {
  prepareGalleryPhoto,
  uploadGalleryPhoto,
  type PreparedPhoto,
} from "./gallery-photos";
import type { Project, ProjectWithImages } from "../lib/gallery";
export function initGalleryManager() {
  const form = document.querySelector<HTMLFormElement>("#project-editor");
  if (!form) return;
  const $ = <T extends HTMLElement = HTMLElement>(selector: string) =>
    document.querySelector<T>(selector)!;
  const status = $("#manager-status"),
    error = $("#manager-error"),
    fileInput = $<HTMLInputElement>("#gallery-files");
  let active: ProjectWithImages | null = null,
    list: Project[] = [],
    dirty = false,
    busy = false,
    uploading = false;
  type Job = {
    id: string;
    file: File;
    ready?: PreparedPhoto;
    row: HTMLLIElement;
    progress: HTMLProgressElement;
    text: HTMLSpanElement;
    retry: HTMLButtonElement;
    remove: HTMLButtonElement;
    failed: boolean;
  };
  const jobs: Job[] = [];
  const field = (name: string) =>
    form.elements.namedItem(name) as HTMLInputElement;
  function fail(e: unknown) {
    status.textContent = "";
    error.textContent =
      e instanceof Error
        ? e.message
        : "Nepavyko išsaugoti. Bandykite dar kartą.";
    error.hidden = false;
  }
  async function api(path: string, method = "GET", body?: unknown) {
    const r = await fetch("/api/gallery" + path, {
      method,
      headers: body ? { "Content-Type": "application/json" } : {},
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await r
      .json()
      .catch(() => ({ error: "Prisijunkite iš naujo arba bandykite vėliau." }));
    if (!r.ok) throw new Error(data.error || "Veiksmas nepavyko.");
    return data;
  }
  function guard() {
    return (
      !busy &&
      !uploading &&
      (!dirty || confirm("Yra neišsaugotų pakeitimų. Juos atmesti?"))
    );
  }
  function state() {
    const published = active?.status === "published";
    $("#project-state").textContent = published ? "PUBLIKUOTAS" : "JUODRAŠTIS";
    $("#publish-project").textContent = published
      ? "Išsaugoti pakeitimus"
      : "Publikuoti";
    $("#save-project").textContent = published
      ? "Išsaugoti pakeitimus"
      : "Išsaugoti juodraštį";
    $("#unpublish-project").hidden = !published;
    $("#delete-project").hidden = !active;
  }
  async function loadList() {
    list = (await api("/projects")).projects;
    renderList();
  }
  function button(text: string, label: string, fn: () => void) {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = text;
    b.setAttribute("aria-label", label);
    b.addEventListener("click", fn);
    return b;
  }
  function renderList() {
    const root = $("#owner-project-list");
    root.replaceChildren();
    if (!list.length) {
      const p = document.createElement("p");
      p.className = "small";
      p.textContent = "Projektų dar nėra.";
      root.append(p);
    }
    list.forEach((p, i) => {
      const row = document.createElement("div");
      row.className = "owner-project";
      const open = button(p.title, `Redaguoti ${p.title}`, () => {
        if (guard()) void openProject(p.id);
      });
      open.className = "owner-project-title";
      open.setAttribute("aria-current", String(active?.id === p.id));
      const badge = document.createElement("span");
      badge.className = "small";
      badge.textContent =
        p.status === "published" ? "Publikuotas" : "Juodraštis";
      const controls = document.createElement("div");
      controls.className = "photo-actions";
      for (const [delta, label] of [
        [-1, "Aukštyn"],
        [1, "Žemyn"],
      ] as const) {
        const b = button(delta < 0 ? "↑" : "↓", `${p.title}: ${label}`, () => {
          if (!guard()) return;
          const ids = list.map((p) => p.id);
          [ids[i], ids[i + delta]] = [ids[i + delta], ids[i]];
          void action(async () => {
            await api("/reorder", "POST", { ids });
            await loadList();
          });
        });
        b.disabled = i + delta < 0 || i + delta >= list.length;
        controls.append(b);
      }
      row.append(open, badge, controls);
      root.append(row);
    });
  }
  function editor(p: ProjectWithImages | null) {
    active = p;
    dirty = false;
    form!.hidden = false;
    $("#manager-welcome").hidden = true;
    form!.reset();
    for (const name of [
      "title",
      "description",
      "location",
      "project_type",
      "completion_date",
    ])
      field(name).value = String(p?.[name as keyof Project] || "");
    $("#editor-heading").textContent = p
      ? "Redaguoti projektą"
      : "Naujas projektas";
    $("#upload-queue").replaceChildren();
    jobs.length = 0;
    renderPhotos();
    state();
    renderList();
  }
  async function openProject(id: string) {
    try {
      editor(await api("/projects/" + id));
    } catch (e) {
      fail(e);
    }
  }
  function payload(statusValue: "draft" | "published") {
    return {
      title: field("title").value || "Naujas projektas",
      description: field("description").value,
      location: field("location").value || null,
      project_type: field("project_type").value || null,
      completion_date: field("completion_date").value || null,
      cover_image_id: active?.cover_image_id || null,
      status: statusValue,
      ...(active ? { version: active.updated_at } : {}),
    };
  }
  async function ensureDraft() {
    if (!active) {
      active = await api("/projects", "POST", {
        ...payload("draft"),
        cover_image_id: null,
      });
      state();
      await loadList();
    }
    return active!;
  }
  async function action(fn: () => Promise<void>) {
    if (busy || uploading) return;
    busy = true;
    error.hidden = true;
    form!.setAttribute("aria-busy", "true");
    status.textContent = "Išsaugoma…";
    const controls = Array.from(
      form!.querySelectorAll<
        | HTMLInputElement
        | HTMLButtonElement
        | HTMLTextAreaElement
        | HTMLSelectElement
      >("input,button,textarea,select"),
    );
    const disabled = controls.map((c) => c.disabled);
    controls.forEach((c) => (c.disabled = true));
    try {
      await fn();
    } catch (e) {
      fail(e);
    } finally {
      busy = false;
      form!.removeAttribute("aria-busy");
      controls.forEach((c, i) => (c.disabled = disabled[i]));
      if (status.textContent === "Išsaugoma…")
        status.textContent = "Išsaugota.";
    }
  }
  async function save(target: "draft" | "published") {
    if (target === "published" && !form!.reportValidity()) return;
    await action(async () => {
      if (jobs.some((j) => j.failed))
        throw new Error(
          "Pirmiausia pakartokite arba pašalinkite nepavykusias nuotraukas.",
        );
      await ensureDraft();
      active = await api("/projects/" + active!.id, "PATCH", payload(target));
      dirty = false;
      state();
      await loadList();
      status.textContent =
        target === "published"
          ? "Projektas publikuotas. Jis jau matomas svetainėje."
          : "Juodraštis išsaugotas.";
    });
  }
  function renderPhotos() {
    const root = $("#owner-photos");
    root.replaceChildren();
    active?.images.forEach((im, i) => {
      const item = document.createElement("div");
      item.className = "owner-photo";
      item.draggable = true;
      item.dataset.id = im.id;
      item.addEventListener("dragstart", (e) =>
        e.dataTransfer?.setData("text/plain", im.id),
      );
      item.addEventListener("dragover", (e) => {
        if (!e.dataTransfer?.types.includes("Files")) e.preventDefault();
      });
      item.addEventListener("drop", (e) => {
        if (e.dataTransfer?.files.length) return;
        e.preventDefault();
        const id = e.dataTransfer?.getData("text/plain"),
          ids = active!.images.map((v) => v.id),
          from = ids.indexOf(id || "");
        if (from < 0) return;
        ids.splice(from, 1);
        ids.splice(i, 0, id!);
        void reorder(ids);
      });
      const img = document.createElement("img");
      img.src = `/api/gallery/images/${im.id}/480.webp`;
      img.width = 240;
      img.height = 180;
      img.alt = im.alt_text || `Projekto nuotrauka ${i + 1}`;
      img.loading = "lazy";
      const controls = document.createElement("div");
      controls.className = "photo-actions";
      const cover = button(
        active!.cover_image_id === im.id ? "★" : "☆",
        "Pasirinkti viršeliu",
        () => {
          if (busy || uploading) return;
          active!.cover_image_id = im.id;
          dirty = true;
          renderPhotos();
        },
      );
      cover.setAttribute(
        "aria-pressed",
        String(active!.cover_image_id === im.id),
      );
      controls.append(cover);
      for (const delta of [-1, 1]) {
        const b = button(
          delta < 0 ? "↑" : "↓",
          `Nuotrauką ${i + 1} perkelti ${delta < 0 ? "aukštyn" : "žemyn"}`,
          () => {
            const ids = active!.images.map((p) => p.id);
            [ids[i], ids[i + delta]] = [ids[i + delta], ids[i]];
            void reorder(ids);
          },
        );
        b.disabled = i + delta < 0 || i + delta >= active!.images.length;
        controls.append(b);
      }
      controls.append(
        button("×", `Ištrinti ${i + 1} nuotrauką`, () => {
          if (!confirm("Ištrinti šią nuotrauką?")) return;
          void action(async () => {
            active = await api("/images/" + im.id, "DELETE");
            renderPhotos();
            state();
            await loadList();
          });
        }),
      );
      const label = document.createElement("label");
      label.className = "small";
      label.textContent = "Nuotraukos aprašymas";
      const input = document.createElement("input");
      input.maxLength = 250;
      input.value = im.alt_text || "";
      input.placeholder = "Kas matoma nuotraukoje?";
      input.addEventListener(
        "change",
        () =>
          void action(async () => {
            await api("/images/" + im.id, "PATCH", { alt_text: input.value });
            active = await api("/projects/" + active!.id);
            status.textContent = "Nuotraukos aprašymas išsaugotas.";
          }),
      );
      label.append(input);
      item.append(img, controls, label);
      root.append(item);
    });
  }
  async function reorder(ids: string[]) {
    await action(async () => {
      const cover = active!.cover_image_id;
      active = await api("/projects/" + active!.id + "/reorder", "POST", {
        ids,
      });
      active!.cover_image_id = cover;
      renderPhotos();
      status.textContent = "Nuotraukų tvarka išsaugota.";
    });
  }
  async function processQueue() {
    if (uploading || busy) return;
    uploading = true;
    fileInput.disabled = true;
    error.hidden = true;
    try {
      await ensureDraft();
      for (const job of jobs.filter((j) => !j.failed && j.row.isConnected)) {
        if (job.progress.value === 100) continue;
        job.retry.hidden = true;
        job.remove.disabled = true;
        job.text.textContent = "Ruošiama…";
        job.progress.removeAttribute("value");
        try {
          job.ready ??= await prepareGalleryPhoto(job.file);
          job.text.textContent = "Siunčiama…";
          job.progress.value = 0;
          const cover = active!.cover_image_id;
          active = (await uploadGalleryPhoto(
            active!.id,
            job.id,
            job.ready,
            (n) => {
              job.progress.value = n;
              job.text.textContent = `Siunčiama ${n} %`;
            },
          )) as ProjectWithImages;
          if (cover && active.images.some((im) => im.id === cover))
            active.cover_image_id = cover;
          job.progress.value = 100;
          job.text.textContent = "Išsaugota";
          job.row.remove();
          jobs.splice(jobs.indexOf(job), 1);
          job.ready = undefined;
          renderPhotos();
          state();
        } catch (e) {
          job.failed = true;
          job.text.textContent =
            e instanceof Error ? e.message : "Nepavyko įkelti.";
          job.retry.hidden = false;
          job.progress.value = 0;
        } finally {
          job.remove.disabled = false;
        }
      }
      await loadList();
      status.textContent = jobs.some((j) => j.failed)
        ? "Dalies nuotraukų įkelti nepavyko. Galite kartoti."
        : "Nuotraukos išsaugotos. Pasirinkite viršelį ir publikuokite projektą.";
    } catch (e) {
      for (const job of jobs.filter((j) => j.row.isConnected)) {
        job.failed = true;
        job.retry.hidden = false;
        job.text.textContent = "Įkelti nepavyko. Bandykite dar kartą.";
      }
      fail(e);
    } finally {
      uploading = false;
      fileInput.disabled = false;
    }
  }
  function addFiles(files: File[]) {
    if (busy || uploading) return;
    if (
      (active?.images.length || 0) +
        jobs.filter((j) => j.row.isConnected).length +
        files.length >
      20
    ) {
      fail(new Error("Vienam projektui galima pridėti iki 20 nuotraukų."));
      return;
    }
    for (const file of files) {
      const row = document.createElement("li"),
        name = document.createElement("span"),
        text = document.createElement("span"),
        progress = document.createElement("progress");
      name.textContent = file.name;
      progress.max = 100;
      progress.value = 0;
      progress.setAttribute("aria-label", "Nuotraukos įkėlimo eiga");
      const job: Job = {
        id: crypto.randomUUID(),
        file,
        row,
        progress,
        text,
        retry: button("Kartoti", "Kartoti nuotraukos siuntimą", () => {
          job.failed = false;
          void processQueue();
        }),
        remove: button("Pašalinti", "Pašalinti iš laukiančių nuotraukų", () => {
          jobs.splice(jobs.indexOf(job), 1);
          row.remove();
        }),
        failed: false,
      };
      job.retry.hidden = true;
      row.append(name, text, progress, job.retry, job.remove);
      jobs.push(job);
      $("#upload-queue").append(row);
    }
    void processQueue();
  }
  $("#new-project").addEventListener("click", () => {
    if (guard()) {
      editor(null);
      field("title").focus();
    }
  });
  form.addEventListener("input", () => {
    dirty = true;
  });
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    void save("published");
  });
  $("#save-project").addEventListener(
    "click",
    () => void save(active?.status || "draft"),
  );
  $("#unpublish-project").addEventListener(
    "click",
    () =>
      void action(async () => {
        if (!active) return;
        const {
          title,
          description,
          location,
          project_type,
          completion_date,
          cover_image_id,
          updated_at,
        } = active;
        active = await api("/projects/" + active.id, "PATCH", {
          title,
          description,
          location,
          project_type,
          completion_date,
          cover_image_id,
          status: "draft",
          version: updated_at,
        });
        state();
        await loadList();
        status.textContent = "Projektas paslėptas iš viešos galerijos.";
      }),
  );
  $("#delete-project").addEventListener("click", () => {
    if (
      !active ||
      !confirm(
        "Ištrinti projektą ir visas jo nuotraukas? Šio veiksmo atšaukti negalima.",
      )
    )
      return;
    void action(async () => {
      await api("/projects/" + active!.id, "DELETE");
      active = null;
      dirty = false;
      form.hidden = true;
      $("#manager-welcome").hidden = false;
      await loadList();
      status.textContent = "Projektas ištrintas.";
    });
  });
  fileInput.addEventListener("change", () => {
    addFiles(Array.from(fileInput.files || []));
    fileInput.value = "";
  });
  const drop = $("#gallery-drop");
  drop.addEventListener("click", () => fileInput.click());
  drop.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fileInput.click();
    }
  });
  drop.addEventListener("dragover", (e) => {
    e.preventDefault();
    drop.classList.add("dragging");
  });
  drop.addEventListener("dragleave", () => drop.classList.remove("dragging"));
  drop.addEventListener("drop", (e) => {
    e.preventDefault();
    drop.classList.remove("dragging");
    addFiles(Array.from(e.dataTransfer?.files || []));
  });
  window.addEventListener("beforeunload", (e) => {
    if (dirty || busy || uploading) {
      e.preventDefault();
    }
  });
  void loadList()
    .then(() => {
      status.textContent = "";
    })
    .catch(fail);
}
