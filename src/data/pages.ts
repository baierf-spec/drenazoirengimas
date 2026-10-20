import { publicProjects } from "./projects";
import { articles } from "./articles";
import { reviewedLocationArticles } from "./locations";
import seo from "../content/seo.json";
import { site } from "./site";
export interface PageMeta {
  path: string;
  title: string;
  description: string;
  indexable: boolean;
  ogImage?: string;
}
const suffix = " | " + site.name;
const staticPages: [string, boolean][] = [
  ["/", true],
  ["/drenazo-kaina/", true],
  ["/duk/", true],
  ["/privatumo-politika/", true],
  ["/projektai/", publicProjects.length > 0],
  ["/gauti-pasiulyma/", false],
  ["/diagnostika/", false],
  ["/aciu/", false],
  ["/404.html", false],
];
function configuredPage(
  path: string,
  indexable: boolean,
  fallback?: { title: string; description: string },
): PageMeta {
  const content = seo.pages.find((p) => p.path === path) || fallback;
  if (!content) throw new Error("Trūksta SEO informacijos: " + path);
  return {
    path,
    indexable,
    title: content.title + suffix,
    description: content.description,
    ogImage:
      "ogImage" in content && typeof content.ogImage === "string"
        ? content.ogImage || undefined
        : undefined,
  };
}
export const pages: PageMeta[] = [
  ...staticPages.map(([path, indexable]) => configuredPage(path, indexable)),
  ...[...articles, ...reviewedLocationArticles()].map((a) =>
    configuredPage(`/${a.slug}/`, true, a),
  ),
  ...publicProjects.map((p) => ({
    path: `/projektai/${p.slug}/`,
    title: (p.seoTitle || p.title) + suffix,
    description: (p.seoDescription || p.title + ". " + p.description)
      .replace(/\s+/g, " ")
      .slice(0, 180),
    indexable: true,
  })),
];
export const pageMeta = (path: string) =>
  pages.find((page) => page.path === path);
export const indexablePaths = () =>
  pages.filter((page) => page.indexable).map((page) => page.path);
