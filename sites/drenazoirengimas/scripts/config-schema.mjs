import { writeFile } from "node:fs/promises";
import { z } from "zod";
import { configSchema } from "../shared/site-config.ts";
const schema = z.toJSONSchema(configSchema, { target: "draft-7" });
schema.title = "Svetainės nustatymai";
await writeFile(
  "site.config.schema.json",
  JSON.stringify(schema, null, 2) + "\n",
);
console.log("site.config.schema.json generated from shared validation.");
