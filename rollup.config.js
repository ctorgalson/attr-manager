import { createRequire } from "node:module";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";

const require = createRequire(import.meta.url);
const pkg = require("./package.json");
const plugins = [nodeResolve(), typescript({ tsconfig: "./tsconfig.json" })];
const banner = `/*! attr-manager ${pkg.version} — © Christopher Torgalson */`;
const minifyPlugin = terser({
  compress: {
    module: true,
    passes: 2,
    toplevel: true,
  },
  ecma: 2020,
  keep_classnames: true,
  keep_fnames: false,
});
const umdCfg = {
  format: "umd",
  name: "AttrManager",
  exports: "default",
};

export default {
  input: "src/attr-manager.ts",
  plugins: plugins,
  output: [
    // UMD
    { banner, file: "dist/js/attr-manager.js", ...umdCfg },
    {
      banner,
      file: "dist/js/attr-manager.min.js",
      ...umdCfg,
      plugins: [minifyPlugin],
    },
    // ESM
    { banner, file: "dist/js/attr-manager.esm.js", format: "esm" },
    {
      banner,
      file: "dist/js/attr-manager.esm.min.js",
      format: "esm",
      plugins: [minifyPlugin],
    },
    // CJS
    { banner, file: "dist/js/attr-manager.cjs", format: "cjs", exports: "default" },
    {
      banner,
      file: "dist/js/attr-manager.min.cjs",
      format: "cjs",
      exports: "default",
      plugins: [minifyPlugin],
    },
  ],
  watch: {
    exclude: "node_modules/**",
  },
};