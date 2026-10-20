export interface Article {
  slug: string;
  title: string;
  description: string;
  intro: string;
  image?: string;
  sections: { title: string; text: string[]; list?: string[]; id?: string }[];
  imageAlt?: string;
  sources?: { label: string; url: string }[];
  service?: boolean;
}

const files = import.meta.glob<Article & { enabled?: boolean }>(
  "../content/articles/*.json",
  { eager: true, import: "default" },
);
export const articles: Article[] = Object.entries(files)
  .sort(([a], [b]) => a.localeCompare(b))
  .filter(([, v]) => v.enabled !== false)
  .map(([path, v]) => ({
    ...v,
    slug: path
      .split("/")
      .pop()!
      .replace(/\.json$/, ""),
  }));
