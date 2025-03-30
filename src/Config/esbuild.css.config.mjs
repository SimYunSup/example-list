import path from "node:path";
import { fileURLToPath } from 'node:url';
import { globSync } from "tinyglobby";
    
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**@type {import("esbuild").BuildOptions} */
console.log(globSync("**/*.r.css"));
export default {
  allowOverwrite: true,
  outfile: "wwwroot/build/css/custom.css",
  entryPoints: [
    "./Config/index.css",
  ],
  alias: {
    "~": path.resolve(__dirname, "../node_modules"),
  },
  loader: {
    ".png": "file",
    ".woff2": "file",
    ".woff": "file",
    ".gif": "file",
  },
  bundle: true,
  platform: "browser",
  define: {
    "import.meta.env.MODE": "\"production\"",
  },
  logLevel: "verbose"
}