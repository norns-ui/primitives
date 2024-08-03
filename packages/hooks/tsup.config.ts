import {defineConfig} from "tsup";

export default defineConfig([
  {
    entry: ["lib/index.ts"],
    external: [/@norns-ui\/.+/, "react", "react/jsx-runtime"],
    skipNodeModulesBundle: true,
    splitting: false,
    treeshake: true,
    format: ["esm", "cjs"],
    minify: true,
    silent: true,
    clean: true,
    dts: false,
  },
  {
    entry: ["lib/index.ts"],
    external: [/@norns-ui\/.+/],
    format: ["esm"],
    silent: true,
    dts: {only: true},
  },
]);
