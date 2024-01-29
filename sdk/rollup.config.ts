import { RollupOptions, defineConfig } from 'rollup';
import dts from "rollup-plugin-dts"
import esbuild from "rollup-plugin-esbuild"

const bundle = (config: RollupOptions) => ({
  ...config,
  input: "src/index.ts",
  external: (id: string) => !/^[./]/.test(id),
})

export default defineConfig([
  bundle({
    plugins: [esbuild()],
    output: [
      {
        format: "es",
        file: 'dist/index.mjs',
        exports: "named",
      },
      {
        format: "cjs",
        exports: "auto",
        file: 'dist/index.cjs',
      },
    ],
  }),
  bundle({
    plugins: [dts()],
    output: {
      dir: "dist",
      format: "es",
      exports: "named",
      preserveModules: true,
    },
  }),
])