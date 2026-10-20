import { publicSettings } from "../../shared/site-config";
import faqContent from "../content/faq.json";
import serviceContent from "../content/services.json";
import problemContent from "../content/problems.json";
export const site = publicSettings(undefined, import.meta.env.SITE_AUDIT_MODE);
export const problems = problemContent.items;
export const propertyTypes = [
  ["house", "Gyvenamasis namas", "house"],
  ["homestead", "Sodyba / ūkinis pastatas", "trees"],
  ["plot", "Sklypas (be pastatų)", "land"],
  ["other", "Kitas objektas", "building"],
] as const;
export const faq = faqContent.items
  .filter((i) => i.enabled)
  .map((i) => [i.question, i.answer]);
export const faqLinks: Record<string, { href: string; label: string }> =
  Object.fromEntries(
    faqContent.items
      .filter((i) => i.enabled && i.link)
      .map((i) => [i.question, i.link!]),
  );
export const services = serviceContent.items.filter((i) => i.enabled);
