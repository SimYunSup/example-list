/**@type {import("esbuild").BuildOptions} */
export default {
  allowOverwrite: true,
  outdir: ".",
  outbase: ".",
  entryPoints: [
    "**/*.razor.ts",
  ],
  loader: {
    ".png": "file",
    ".woff2": "file",
    ".woff": "file",
    ".gif": "file",
  },
  bundle: true,
  splitting: true,
  format: "esm",
  platform: "browser",
  entryNames: "[dir]/[name]",
  assetNames: "build/[dir]/[name]",
  define: {
    "import.meta.env.MODE": "\"production\"",
  }
}