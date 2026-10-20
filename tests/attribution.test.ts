// @vitest-environment happy-dom
import { it, expect, beforeEach } from "vitest";
import {
  rememberEntrySource,
  entrySource,
  forgetEntrySource,
} from "../src/scripts/attribution";
beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});
function consent(value: string) {
  localStorage.setItem(
    "drainage-consent",
    JSON.stringify({ value, at: Date.now() }),
  );
}
it("does not persist source before consent or after denial", () => {
  rememberEntrySource("https://www.google.com/search?q=private");
  expect(sessionStorage.getItem("drainage-entry-source")).toBeNull();
  consent("denied");
  rememberEntrySource("https://www.google.com/");
  expect(entrySource()).toBe("");
  expect(sessionStorage.getItem("drainage-entry-source")).toBeNull();
});
it("keeps first external domain across internal navigation after opt-in", () => {
  consent("granted");
  rememberEntrySource("https://www.google.com/search?q=private#x");
  rememberEntrySource(location.origin + "/gauti-pasiulyma/");
  expect(entrySource()).toBe("https://www.google.com");
  expect(sessionStorage.getItem("drainage-entry-source")).not.toContain(
    "private",
  );
});
it("clears on withdrawal and expires old source", () => {
  consent("granted");
  rememberEntrySource("https://facebook.com/private");
  consent("denied");
  expect(entrySource()).toBe("");
  expect(sessionStorage.getItem("drainage-entry-source")).toBeNull();
  consent("granted");
  sessionStorage.setItem(
    "drainage-entry-source",
    JSON.stringify({
      origin: "https://facebook.com",
      at: Date.now() - 2 * 864e5,
    }),
  );
  expect(entrySource()).not.toBe("https://facebook.com");
  forgetEntrySource();
  expect(sessionStorage.getItem("drainage-entry-source")).toBeNull();
});
