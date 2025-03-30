import { build } from "esbuild";
import options from "./esbuild.config.mjs";
import cssOptions from "./esbuild.css.config.mjs";

await Promise.allSettled([
  build(options).catch(() => process.exit(1)),
  build(cssOptions).catch(() => process.exit(1)),
])