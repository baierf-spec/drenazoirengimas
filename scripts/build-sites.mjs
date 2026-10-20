import { readdir, readFile, mkdir, writeFile, rename } from "node:fs/promises";
import path from "node:path";
import { build } from "esbuild";
// Astro's canonical artifact is static. This extra adapter packages the same output for Sites.
// Cloudflare production uses native Workers Static Assets, not embedded assets.
const out = path.resolve("dist");
const client = path.join(out, "client");
await mkdir(client, { recursive: true });
for (const name of await readdir(out))
  if (name !== "client")
    await rename(path.join(out, name), path.join(client, name));
const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".json": "application/json",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".woff2": "font/woff2",
  ".avif": "image/avif",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".png": "image/png",
};
const files = {};
async function walk(dir, relative = "") {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name),
      key = relative + "/" + entry.name;
    if (entry.isDirectory()) await walk(file, key);
    else
      files[key] = [
        (await readFile(file)).toString("base64"),
        mime[path.extname(entry.name)] || "application/octet-stream",
      ];
  }
}
await walk(client);
const source = `import app from './worker/index.ts';\nconst files=${JSON.stringify(files)};\nconst assets={async fetch(request){const u=new URL(request.url);let key=u.pathname;let item=files[key];if(!item&&files[key+'/index.html']){u.pathname+='/';return Response.redirect(u.href,301)}if(!item&&key.endsWith('/'))item=files[key+'index.html'];const status=item?200:404;item??=files['/404.html'];if(!item)return new Response('Not found',{status:404});const bytes=Uint8Array.from(atob(item[0]),c=>c.charCodeAt(0));return new Response(request.method==='HEAD'?null:bytes,{status,headers:{'Content-Type':item[1]}})}};\nexport default {fetch(request,env,ctx){return app.fetch(request,{...env,ASSETS:assets},ctx)}};`;
await mkdir(path.join(out, "server"), { recursive: true });
await build({
  stdin: {
    contents: source,
    resolveDir: process.cwd(),
    sourcefile: "sites-entry.ts",
  },
  bundle: true,
  format: "esm",
  platform: "browser",
  target: "es2022",
  outfile: path.join(out, "server/index.js"),
  minify: true,
});
await mkdir(path.join(out, ".openai"), { recursive: true });
await writeFile(
  path.join(out, ".openai/hosting.json"),
  await readFile(".openai/hosting.json"),
);
console.log(
  "Sites Worker packaged; native Cloudflare assets remain in dist/client.",
);
