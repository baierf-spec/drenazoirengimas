// Every page of the site, in sitemap order (content and markup live in the modules below).
import index from './index.mjs';
import paslaugos from './paslaugos.mjs';
import kaina from './kaina.mjs';
import cities from './cities.mjs';
import uzklausa from './uzklausa.mjs';
import rangovams from './rangovams.mjs';
import privatumas from './privatumas.mjs';
import notfound from './notfound.mjs';
export const PAGES = [index, paslaugos, kaina, ...cities, uzklausa, rangovams, privatumas];
export const NOT_FOUND = notfound;
